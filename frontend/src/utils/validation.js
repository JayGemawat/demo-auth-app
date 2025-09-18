// src/utils/validation.js
export const validateProduct = ({ name, price, colors, categoryId }) => {
  const errors = {};
  if (!name || name.trim() === "") {
    errors.name = "Product name is required";
  }
  if (!price || parseFloat(price) <= 0) {
    errors.price = "Enter a valid price greater than 0";
  }
  if (!colors || colors.length === 0) {
    errors.colors = "Select at least one color";
  }
  if (!categoryId) {
    errors.categoryId = "Category is required";   // 👈 key must match your ProductModal
  }
  return errors;
};
