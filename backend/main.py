import os
from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, ForeignKey, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.hash import bcrypt
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional, List, Dict, Any
from config import (
    DATABASE_URL,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    EMAIL_ADDRESS,
    EMAIL_PASSWORD,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
)
import smtplib
from email.mime.text import MIMEText
import random
import json
from sqlalchemy.types import TypeDecorator

# ----------------------------
# App + CORS
# ----------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://your-frontend.com"  # Prod domain
]

app = FastAPI(title="Demo App - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# ----------------------------
# DB setup
# ----------------------------
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# ----------------------------
# JSON encoded list column
# ----------------------------
class JSONEncodedList(TypeDecorator):
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is None:
            return "[]"
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        try:
            return json.loads(value)
        except Exception:
            return []

# ----------------------------
# Models
# ----------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    mobile = Column(String(50), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")

    products = relationship("Product", back_populates="owner", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    productCount = Column(Integer, default=0)

    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    price = Column(Integer, nullable=False)
    colors = Column(JSONEncodedList)
    tags = Column(JSONEncodedList)
    category_id = Column(Integer, ForeignKey("categories.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    category = relationship("Category", back_populates="products")
    owner = relationship("User", back_populates="products")


Base.metadata.create_all(bind=engine)

# ----------------------------
# Schemas (Pydantic)
# ----------------------------
class UserCreate(BaseModel):
    name: str
    mobile: str
    email: str
    password: str
    confirm_password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    mobile: str
    email: str
    role: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class CategoryBase(BaseModel):
    name: str


class CategoryOut(BaseModel):
    id: int
    name: str
    productCount: int

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    price: int
    colors: List[str] = []
    tags: List[str] = []
    categoryId: int


class ProductOut(BaseModel):
    id: int
    name: str
    price: int
    colors: List[str]
    tags: List[str]
    categoryId: int
    categoryName: Optional[str] = None
    userId: int
    ownerEmail: Optional[str] = None

    class Config:
        from_attributes = True


# ----------------------------
# Helpers
# ----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def send_otp_email(to_email: str, otp: str):
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("No email configured; OTP:", otp, "for", to_email)
        return
    msg = MIMEText(f"Your OTP code is: {otp}")
    msg["Subject"] = "Password Reset OTP"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)


def send_password_change_email(to_email: str):
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("No email configured; password change notification to", to_email)
        return
    msg = MIMEText("Your password was successfully changed. If this wasn’t you, please reset it immediately.")
    msg["Subject"] = "Password Changed Successfully"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)


# ----------------------------
# Authentication utilities
# ----------------------------
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = parts[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ----------------------------
# Auth endpoints
# ----------------------------
@app.post("/register", response_model=UserOut, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = bcrypt.hash(user.password)
    new_user = User(name=user.name, mobile=user.mobile, email=user.email, password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not bcrypt.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email, "role": db_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": db_user,
    }


# ----------------------------
# Admin seed on startup
# ----------------------------
@app.on_event("startup")
def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if not existing:
            hashed_pw = bcrypt.hash(ADMIN_PASSWORD)
            admin = User(name="Admin", mobile="0000000000", email=ADMIN_EMAIL, password=hashed_pw, role="Admin")
            db.add(admin)
            db.commit()
            print("✅ Admin user created:", ADMIN_EMAIL)
    finally:
        db.close()


# ----------------------------
# OTP / Password endpoints
# ----------------------------
otp_store: Dict[str, Dict[str, Any]] = {}


@app.post("/request-otp")
def request_otp(payload: Dict[str, str], db: Session = Depends(get_db)):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    otp = str(random.randint(100000, 999999))
    otp_store[email] = {"otp": otp, "expires": datetime.utcnow() + timedelta(minutes=10)}
    send_otp_email(email, otp)
    return {"message": "OTP sent to email"}


@app.post("/reset-password")
def reset_password(payload: Dict[str, str], db: Session = Depends(get_db)):
    email = payload.get("email")
    otp = payload.get("otp")
    new_password = payload.get("new_password")

    if not email or not otp or not new_password:
        raise HTTPException(status_code=400, detail="email, otp and new_password required")

    entry = otp_store.get(email)
    if not entry or entry.get("otp") != otp or datetime.utcnow() > entry.get("expires"):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = bcrypt.hash(new_password)
    db.commit()
    otp_store.pop(email, None)
    send_password_change_email(email)
    return {"message": "Password reset successful"}


@app.post("/change-password")
def change_password(payload: Dict[str, str], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    old_password = payload.get("old_password")
    new_password = payload.get("new_password")

    if not old_password or not new_password:
        raise HTTPException(status_code=400, detail="old_password and new_password required")

    if not bcrypt.verify(old_password, current_user.password):
        raise HTTPException(status_code=401, detail="Invalid old password")

    current_user.password = bcrypt.hash(new_password)
    db.commit()
    send_password_change_email(current_user.email)
    return {"message": "Password changed successfully"}


# ----------------------------
# Category endpoints
# ----------------------------
@app.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@app.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(category: CategoryBase, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.name == category.name).first():
        raise HTTPException(status_code=400, detail="Category already exists")
    new = Category(name=category.name)
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@app.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    c = db.query(Category).get(category_id)
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(c)
    db.commit()
    return {"message": "Category deleted"}


# ----------------------------
# Product endpoints (owner + admin rules)
# ----------------------------
@app.get("/products", response_model=List[ProductOut])
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    out: List[ProductOut] = []
    for p in products:
        out.append(
            ProductOut(
                id=p.id,
                name=p.name,
                price=p.price,
                colors=p.colors or [],
                tags=p.tags or [],
                categoryId=p.category_id,
                categoryName=p.category.name if p.category else None,
                userId=p.user_id,
                ownerEmail=p.owner.email if p.owner else None,
            )
        )
    return out


@app.post("/products", response_model=ProductOut, status_code=201)
def create_product(product: ProductBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    category = db.query(Category).filter(Category.id == product.categoryId).first()
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")

    new = Product(
        name=product.name,
        price=product.price,
        colors=product.colors or [],
        tags=product.tags or [],
        category_id=product.categoryId,
        user_id=current_user.id,
    )
    db.add(new)
    category.productCount = (category.productCount or 0) + 1
    db.commit()
    db.refresh(new)
    return ProductOut(
        id=new.id,
        name=new.name,
        price=new.price,
        colors=new.colors or [],
        tags=new.tags or [],
        categoryId=new.category_id,
        categoryName=category.name,
        userId=new.user_id,
        ownerEmail=current_user.email,
    )


@app.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, product: ProductBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_product = db.query(Product).get(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    if db_product.user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this product")

    category = db.query(Category).filter(Category.id == product.categoryId).first()
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")

    if db_product.category_id != product.categoryId:
        old_cat = db.query(Category).get(db_product.category_id)
        if old_cat:
            old_cat.productCount = max(0, old_cat.productCount - 1)
        category.productCount = (category.productCount or 0) + 1

    db_product.name = product.name
    db_product.price = product.price
    db_product.colors = product.colors or []
    db_product.tags = product.tags or []
    db_product.category_id = product.categoryId

    db.commit()
    db.refresh(db_product)

    return ProductOut(
        id=db_product.id,
        name=db_product.name,
        price=db_product.price,
        colors=db_product.colors or [],
        tags=db_product.tags or [],
        categoryId=db_product.category_id,
        categoryName=category.name,
        userId=db_product.user_id,
        ownerEmail=db_product.owner.email if db_product.owner else None,
    )


@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_product = db.query(Product).get(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    if db_product.user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")

    category = db_product.category
    db.delete(db_product)
    if category:
        category.productCount = max(0, category.productCount - 1)
    db.commit()
    return {"message": "Product deleted"}


# ----------------------------
# Health + Root
# ----------------------------
@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.get("/")
def root():
    return {"message": "Backend is running 🚀"}
