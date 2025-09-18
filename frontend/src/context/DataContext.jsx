import { createContext, useState, useEffect, useCallback, useMemo } from "react";

const DataContext = createContext();
export { DataContext };

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function DataProvider({ children }) {
  const [categories, setCategories] = useState(() =>
    safeParse("categories", [
      { id: 1, name: "Electronics", productCount: 0 },
      { id: 2, name: "Clothing", productCount: 0 },
      { id: 3, name: "Books", productCount: 0 },
    ])
  );

  const [products, setProducts] = useState(() => safeParse("products", []));

  // Persist categories/products to localStorage
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // Add a new product
  const addProduct = useCallback((product) => {
    setProducts((prev) => [...prev, product]);
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === product.categoryId ? { ...cat, productCount: cat.productCount + 1 } : cat
      )
    );
  }, []);

  // Clear all products
  const clearProducts = useCallback(() => {
    setProducts([]);
    setCategories((prev) => prev.map((c) => ({ ...c, productCount: 0 })));
  }, []);

  // Add a new category
 const addCategory = useCallback((category) => {
  setCategories((prev) => [...prev, category]);
}, []);


  // Remove a category
  const removeCategory = useCallback((id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setProducts((prev) => prev.filter((p) => p.categoryId !== id));
  }, []);

  // Export products as CSV
  const exportCsv = useCallback(() => {
    if (!products || products.length === 0) return "";
    const header = ["Name", "Category", "Price", "Colors", "Tags"];
    const rows = products.map((p) => [
      p.name,
      p.categoryName,
      p.price,
      (p.colors || []).join("|"),
      (p.tags || []).join("|"),
    ]);
    const csv =
      [header, ...rows]
        .map((r) => r.map((s) => `"${String(s).replace(/"/g, '""')}"`).join(","))
        .join("\n") || "";
    return csv;
  }, [products]);

  const value = useMemo(
    () => ({
      categories,
      products,
      addProduct,
      clearProducts,
      exportCsv,
      setCategories, // optional for direct use
      addCategory,
      removeCategory,
    }),
    [categories, products, addProduct, clearProducts, exportCsv, addCategory, removeCategory]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
