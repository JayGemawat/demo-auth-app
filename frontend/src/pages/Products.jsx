// src/pages/Products.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { fetchProducts, fetchCategories, removeProductAsync } from "../redux/dataSlice";
import ProductModal from "../components/ProductModal";


export default function Products() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.data.products || []);
  const categories = useSelector((state) => state.data.categories || []);
  const currentUserId = useSelector((state) => state.auth.currentUserId);
  const role = useSelector((state) => state.auth.role);

  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddProduct = () => {
    if (categories.length === 0) {
      Swal.fire({ icon: "error", title: "Categories are still loading..." });
      return;
    }
    setSelectedCategory(categories[0]?.name || "");
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedCategory(product.categoryName);
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(removeProductAsync(id)).unwrap();
          Swal.fire("Deleted!", "Product has been deleted.", "success");
        } catch (err) {
          Swal.fire("Error!", err.message || "Failed to delete product", "error");
        }
      }
    });
  };

  const exportCSV = () => {
    const rows = [
      ["Name", "Price", "Colors", "Tags", "Category"],
      ...products.map((p) => [p.name, p.price, p.colors.join(", "), p.tags.join(", "), p.categoryName]),
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

  const isLoggedIn = !!currentUserId;

  return (
    <div className="content products">
      <div className="topbar">
        <h1 className="topbar-title">Products</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          {role === "Admin" && (
            <button className="btn-primary" onClick={exportCSV}>Export</button>
          )}
          {isLoggedIn && (
            <button className="btn-success" onClick={handleAddProduct}>Add Product</button>
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          category={categories.find((c) => c.name === selectedCategory)}
          lockCategory={false}
          onClose={() => setShowModal(false)}
          productToEdit={editingProduct}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Colors</th>
            <th>Tags</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.colors.join(", ")}</td>
                <td>{p.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}</td>
                <td>{p.categoryName}</td>
<td>
  <div className="actions-cell">
    {(p.userId === currentUserId || role === "Admin") && (
      <>
        <button
          onClick={() => handleEditProduct(p)}
          className="icon-btn edit"
          title="Edit"
        >
          <i className="fa-solid fa-pen"></i>
        </button>

        <button
          onClick={() => handleDelete(p.id)}
          className="icon-btn delete"
          title="Delete"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </>
    )}

    <button
      onClick={() =>
        Swal.fire({
          title: p.name,
          html: `<b>Price:</b> ${p.price}<br/><b>Colors:</b> ${p.colors.join(", ")}<br/><b>Tags:</b> ${p.tags.join(", ")}`,
          icon: "info",
        })
      }
      className="icon-btn preview"
      title="Preview"
    >
      <i className="fa-solid fa-eye"></i>
    </button>
  </div>
</td>


              </tr>
            ))
          ) : (
            <tr><td colSpan={6}>No products added yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
