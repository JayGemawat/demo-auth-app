import { useState } from "react";
import { useDispatch } from "react-redux";
import { addCategory as addCategoryAction } from "../redux/dataSlice";

export default function CategoryModal({ onClose }) {
  const [name, setName] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Category name is required");

    const newCategory = { id: Date.now(), name: name.trim(), productCount: 0 };
    dispatch(addCategoryAction(newCategory)); // dispatch to Redux
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Category</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="actions">
            <button type="submit">Save</button>
            <button type="button" className="cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
