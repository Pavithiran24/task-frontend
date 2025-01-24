import React, { useState, useEffect } from "react";
import ProductTable from './pages/ProductTable';

const App = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleAdd = async (newProduct) => {
    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const data = await response.json();
      setProducts([...products, data]);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleEdit = async (id, updatedProduct) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });
      const data = await response.json();
      setProducts(products.map((product) => (product._id === id ? data : product)));
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, { method: "DELETE" });
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return <ProductTable products={products} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />;
};

export default App;
