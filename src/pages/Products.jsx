// src/pages/Products.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { fetchProducts, addProductAsync } from "../redux/dataSlice";
import { fetchCategories } from "../redux/dataSlice"; // assuming you have this thunk

export default function Products() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.data.products);
  const categories = useSelector((state) => state.data.categories || []);
  const role = useSelector((state) => state.auth.role);

  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    colors: "",
    tags: "",
    categoryName: "",
  });

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.colors ||
      !newProduct.tags ||
      !newProduct.categoryName
    ) {
      return Swal.fire({ icon: "error", title: "Please fill all fields" });
    }

    const productToAdd = {
      ...newProduct,
      price: parseFloat(newProduct.price),
      colors: newProduct.colors.split(",").map((c) => c.trim()),
      tags: newProduct.tags.split(",").map((t) => t.trim()),
    };

    try {
      await dispatch(addProductAsync(productToAdd)).unwrap();
      Swal.fire({ icon: "success", title: "Product added successfully!" });
      setShowModal(false);
      setNewProduct({ name: "", price: "", colors: "", tags: "", categoryName: "" });
    } catch (err) {
      Swal.fire({ icon: "error", title: err.message || "Failed to add product" });
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Name", "Price", "Colors", "Tags", "Category"],
      ...products.map((p) => [
        p.name,
        p.price,
        p.colors.join(", "),
        p.tags.join(", "),
        p.categoryName,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content products">
      <div className="topbar">
        <h1 className="topbar-title">Products</h1>
        {role === "Admin" && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-primary" onClick={exportCSV}>
              Export
            </button>
            <button className="btn-success" onClick={() => setShowModal(true)}>
              Add Product
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Product</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                name="name"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={handleChange}
              />
              <input
                name="price"
                placeholder="Price"
                type="number"
                value={newProduct.price}
                onChange={handleChange}
              />
              <input
                name="colors"
                placeholder="Colors (comma separated)"
                value={newProduct.colors}
                onChange={handleChange}
              />
              <input
                name="tags"
                placeholder="Tags (comma separated)"
                value={newProduct.tags}
                onChange={handleChange}
              />
              <select
                name="categoryName"
                value={newProduct.categoryName}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="actions">
              <button type="submit" onClick={handleAddProduct}>
                Add
              </button>
              <button className="cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Colors</th>
            <th>Tags</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.colors.join(", ")}</td>
                <td>
                  {p.tags.map((t, i) => (
                    <span key={i} className="tag">
                      {t}
                    </span>
                  ))}
                </td>
                <td>{p.categoryName}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No products added yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
