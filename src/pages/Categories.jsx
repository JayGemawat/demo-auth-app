// src/pages/Categories.jsx
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import ProductModal from "../components/ProductModal";
import {
  addCategory as addCategoryAction,
  removeCategory as removeCategoryAction,
} from "../redux/dataSlice";

export default function Categories() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.data.categories);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Add a new category
  const handleAddCategory = async () => {
    const { value: name } = await Swal.fire({
      title: "Add New Category",
      input: "text",
      inputLabel: "Category Name",
      inputPlaceholder: "Enter category name",
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value.trim()) return "Category name cannot be empty";
        if (
          categories.some(
            (c) => c.name.toLowerCase() === value.trim().toLowerCase()
          )
        )
          return "Category already exists";
        return null;
      },
    });

    if (name) {
      const newCat = { id: Date.now(), name: name.trim(), productCount: 0 };
      dispatch(addCategoryAction(newCat));
      Swal.fire({
        icon: "success",
        title: "Category added!",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  // Remove a category
  const handleRemoveCategory = async (cat) => {
    const result = await Swal.fire({
      title: `Delete "${cat.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      dispatch(removeCategoryAction(cat.id));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="categories">
      <h1>Manage Categories</h1>

      <div style={{ marginBottom: "20px" }}>
        <button className="btn-primary" onClick={handleAddCategory}>
          + Add New Category
        </button>
      </div>

      <div className="category-list">
        {categories.map((cat) => (
          <div key={cat.id} className="category-card">
            <h2>{cat.name}</h2>
            <p>Products: {cat.productCount}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setSelectedCategory(cat)}
                className="btn-success"
              >
                Add Product
              </button>
              <button
                onClick={() => handleRemoveCategory(cat)}
                className="btn-danger"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Modal now uses Redux directly, no onSave prop */}
      {selectedCategory && (
        <ProductModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
