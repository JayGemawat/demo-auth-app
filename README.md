# Demo Auth App

A full-stack React authentication app with login, registration, and password reset functionality.

**Features include:**

* Combined login & registration page with 3D flip effect.
* Forgot password and reset password via OTP.
* Dashboard and admin routes.
* Protected routes for authenticated users.
* Role-based access (Admin/User) for certain pages.
* Simple and responsive UI using CSS variables and flexbox.

---

## Features

* Login/Register with validation and SweetAlert2 feedback.
* Forgot password workflow with OTP email verification.
* Change password functionality.
* Admin-only categories page.
* Responsive dashboard with sidebar, topbar, and tables.
* Modern CSS styling and reusable components.

---

## Technologies Used

* React 18
* React Router v6
* Redux Toolkit for state management
* SweetAlert2 for notifications
* HTML5 & CSS3 (with CSS variables)
* Git & GitHub for version control

---

## Setup & Run

### 1. Clone the repository


git clone https://github.com/JayGemawat/demo-auth-app.git
cd demo-auth-app


### 2. Install dependencies


npm install


### 3. Start development server


npm start


The app will run at [http://localhost:3000](http://localhost:3000) by default.

---

## Deployment

You can deploy the project easily on free hosting services such as:

* [Vercel](https://vercel.com/)
* [Netlify](https://www.netlify.com/)
* [Render](https://render.com/)

Just connect your GitHub repository and follow their deployment instructions.

---

## Notes

* LocalStorage is used for demo authentication and OTP workflow.
* Role-based access control is implemented for Admin/User pages.
* SweetAlert2 is used for alerts and feedback instead of default `alert()` boxes.
