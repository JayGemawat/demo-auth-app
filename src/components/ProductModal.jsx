// src/components/ProductModal.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { addProduct as addProductAction } from "../redux/dataSlice";

export default function ProductModal({ category, onClose }) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [colors, setColors] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const handleColorChange = (e) => {
    const { value, checked } = e.target;
    setColors((prev) =>
      checked ? [...prev, value] : prev.filter((c) => c !== value)
    );
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || colors.length === 0) {
      Swal.fire({ icon: "error", title: "Fill all required fields" });
      return;
    }

    const product = {
      id: Date.now(),
      categoryId: category.id,
      categoryName: category.name,
      name,
      price: parseFloat(price),
      colors,
      tags,
    };

    dispatch(addProductAction({ categoryId: category.id, product }));

    onClose();
    Swal.fire({ icon: "success", title: "Product added" });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Product to {category.name}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <div className="checkbox-group">
            {["Black", "White", "Yellow", "Green", "Blue", "Red"].map((c) => (
              <label key={c}>
                <input type="checkbox" value={c} onChange={handleColorChange} />{" "}
                {c}
              </label>
            ))}
          </div>

          <div className="tags-section">
            <input
              type="text"
              placeholder="Add tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
            <button type="button" onClick={handleAddTag}>Add Tag</button>
            <div className="tags">
              {tags.map((tag, i) => (
                <span key={i} className="tag" onClick={() => handleRemoveTag(tag)}>
                  {tag} ✖
                </span>
              ))}
            </div>
          </div>

          <div className="actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose} className="cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
