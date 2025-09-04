// src/pages/Products.jsx
import { useContext } from "react";
import { DataContext } from "../context/DataContext";
import { AuthContext } from "../context/AuthContext";

export default function Products() {
  const { products } = useContext(DataContext);
  const { role } = useContext(AuthContext);

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
          <div>
            <button className="btn-primary" onClick={exportCSV}>Export</button>
          </div>
        )}
      </div>

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
                    <span key={i} className="tag">{t}</span>
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
