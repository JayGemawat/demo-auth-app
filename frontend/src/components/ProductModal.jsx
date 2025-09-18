// src/components/ProductModal.jsx
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { addProductAsync, updateProductAsync, fetchProducts } from "../redux/dataSlice";
import { validateProduct } from "../utils/validation";

export default function ProductModal({ category, lockCategory = false, onClose, productToEdit = null }) {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.data.categories || []);
  const products = useSelector((state) => state.data.products || []);
  const colorsList = useSelector((state) => state.data.colors || []);
  const currentUserId = useSelector((state) => state.auth.currentUserId);

  const [errors, setErrors] = useState({});
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [colors, setColors] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    lockCategory ? category?.id ?? "" : ""
  );

  const nameInputRef = useRef(null);

  useEffect(() => {
    if (!lockCategory && !productToEdit && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, lockCategory, productToEdit, selectedCategory]);

  useEffect(() => {
  if (productToEdit) {
    setName(productToEdit.name ?? "");
    setPrice(productToEdit.price ?? "");
    setColors(productToEdit.colors ?? []);
    setTags(productToEdit.tags ?? []);
    setSelectedCategory(productToEdit.categoryId ?? (lockCategory ? category?.id : ""));
  } else {
    setName("");
    setPrice("");
    setColors([]);
    setTags([]);
    setTagInput("");
    setSelectedCategory(lockCategory ? category?.id ?? "" : "");
  }
  setErrors({});
  setTimeout(() => nameInputRef.current?.focus(), 100);
}, [productToEdit, category, lockCategory]); // ✅ removed selectedCategory

  // Tags
  const handleTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput("");
      }
    }
  };
  const handleRemoveTag = (tag) => setTags(tags.filter((t) => t !== tag));

  // Colors
  const handleColorToggle = (color) => {
    setColors(colors.includes(color) ? colors.filter((c) => c !== color) : [...colors, color]);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateProduct({ name, price, colors, categoryId: selectedCategory });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (parseFloat(price) <= 0 || Number.isNaN(parseFloat(price))) {
      setErrors({ price: "Price must be greater than 0" });
      return;
    }

    const existing = products.find(
      (p) =>
        p.name.toLowerCase() === name.trim().toLowerCase() &&
        p.categoryId === selectedCategory &&
        (!productToEdit || p.id !== productToEdit.id)
    );
    if (existing) {
      Swal.fire({ icon: "error", title: "Product already exists in this category" });
      return;
    }

    if (!currentUserId) {
      Swal.fire({ icon: "error", title: "You must be logged in to add a product." });
      return;
    }

    const productPayload = {
      id: productToEdit?.id,
      categoryId: Number(selectedCategory),
      name: name.trim(),
      price: parseFloat(price),
      colors,
      tags,
      userId: Number(currentUserId),
    };

    try {
      if (productToEdit) {
        await dispatch(updateProductAsync(productPayload)).unwrap();
        Swal.fire({ icon: "success", title: "Product updated" });
      } else {
        await dispatch(addProductAsync(productPayload)).unwrap();
        Swal.fire({ icon: "success", title: "Product added" });
      }
      await dispatch(fetchProducts());
      onClose();
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to save product";
      Swal.fire({ icon: "error", title: message });
    }
  };

  const handleClose = () => onClose();

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modalTitle">
          {productToEdit ? `Edit Product: ${productToEdit.name}` : lockCategory ? `Add Product to ${category?.name}` : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            ref={nameInputRef}
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? "input-error" : ""}
          />
          {errors.name && <div className="error-text">{errors.name}</div>}

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={errors.price ? "input-error" : ""}
          />
          {errors.price && <div className="error-text">{errors.price}</div>}

          <div className="colors-group">
            {colorsList.map((c) => (
              <label key={c} className="color-label">
                <input
                  type="checkbox"
                  value={c}
                  checked={colors.includes(c)}
                  onChange={() => handleColorToggle(c)}
                />
                {c}
              </label>
            ))}
          </div>
          {errors.colors && <div className="error-text">{errors.colors}</div>}

          {!lockCategory && (
            <>
              <select
                value={selectedCategory ?? ""}
                onChange={(e) => {
                  e.preventDefault(); // stop form reload on change
                  setSelectedCategory(Number(e.target.value));
                }}
                className={errors.categoryId ? "input-error" : ""}
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <div className="error-text">{errors.categoryId}</div>}
            </>
          )}

          <div className="tags-section">
            <input
              type="text"
              placeholder="Add tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyPress}
            />
            <div className="tags">
              {tags.map((tag, i) => (
                <span key={i} className="tag" onClick={() => handleRemoveTag(tag)}>
                  {tag} ✖
                </span>
              ))}
            </div>
          </div>

          <div className="actions">
            <button type="submit">{productToEdit ? "Update" : "Save"}</button>
            <button type="button" onClick={handleClose} className="cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
