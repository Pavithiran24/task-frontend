import React, { useState, useEffect } from "react";

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", weight: "", price: "" });
  const [errors, setErrors] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch products from the backend
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const validate = () => {
    const errors = {};
    if (!newProduct.name.trim()) {
      errors.name = "Name is required.";
    } else if (!/^[a-zA-Z ]+$/.test(newProduct.name.trim())) {
      errors.name = "Name must contain only letters.";
    }

    if (!newProduct.weight) {
      errors.weight = "Weight is required.";
    } else if (isNaN(newProduct.weight) || newProduct.weight <= 0) {
      errors.weight = "Weight must be a positive number.";
    }

    if (!newProduct.price || isNaN(newProduct.price) || newProduct.price <= 0) {
      errors.price = "Price must be a positive number.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = async () => {
    if (!validate()) return;
    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });
      if (response.ok) {
        const data = await response.json();
        setProducts([...products, data]);
        setNewProduct({ name: "", weight: "", price: "" });
        setErrors({});
      } else {
        console.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setProducts(products.filter((product) => product._id !== id));
      } else {
        console.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (id) => {
    const productToEdit = products.find((product) => product._id === id);
    if (productToEdit) {
      setNewProduct(productToEdit);
      setEditingProduct(id);
    }
  };

  const handleUpdateProduct = async () => {
    if (!validate()) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${editingProduct}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });
      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(
          products.map((product) =>
            product._id === editingProduct ? updatedProduct : product
          )
        );
        setNewProduct({ name: "", weight: "", price: "" });
        setEditingProduct(null);
        setErrors({});
      } else {
        console.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleShow = (id) => {
    const productToShow = products.find((product) => product._id === id);
    if (productToShow) {
      alert(`Product Details:\nName: ${productToShow.name}\nWeight: ${productToShow.weight}\nPrice: ${productToShow.price}`);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace("T", " ");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>
      <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setSearchTerm("")}
          >
            Search
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="border p-2"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Weight"
            value={newProduct.weight}
            onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
            className="border p-2"
          />
          {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            className="border p-2"
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>
        {editingProduct ? (
          <button
            onClick={handleUpdateProduct}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Update Product
          </button>
        ) : (
          <button
            onClick={handleAddProduct}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Product
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Created At</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Weight</th>
              <th className="border border-gray-300 px-4 py-2">Price</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {formatDateTime(product.createdAt)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{product.name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{product.weight}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{product.price}</td>
                  <td className="border border-gray-300 px-4 py-2 flex gap-2 justify-center">
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => handleEdit(product._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                      onClick={() => handleShow(product._id)}
                    >
                      Show
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No products available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          className="bg-gray-300 text-black px-4 py-2 rounded disabled:opacity-50"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="bg-gray-300 text-black px-4 py-2 rounded disabled:opacity-50"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductTable;
