import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Products.css";

const Products = () => {

    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState("");
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate();

    const API_URL = "https://smazo.onrender.com";

    // Get products
    const loadProducts = async () => {

        try {

            const response = await axios.get(
                `${API_URL}/api/products`
            );

            setProducts(response.data);

        } catch (err) {

            console.log("Product fetch error:", err);

        }
    };

    useEffect(() => {
        loadProducts();
    }, []);


    // Add / Update
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!productName.trim()) {
            alert("Enter Product Name");
            return;
        }

        try {

            if (editId) {

                await axios.put(
                    `${API_URL}/api/products/${editId}`,
                    {
                        product_name: productName
                    }
                );

                alert("Product Updated Successfully");

            } else {

                await axios.post(
                    `${API_URL}/api/products`,
                    {
                        product_name: productName
                    }
                );

                alert("Product Added Successfully");
            }

            setProductName("");
            setEditId(null);

            loadProducts();

        } catch (err) {

            console.log(err);

            alert(
                err.response?.data?.error ||
                "Something went wrong"
            );
        }
    };


    // Edit
    const handleEdit = (product) => {

        setProductName(product.product_name);
        setEditId(product.id);

    };


    // Delete
    const handleDelete = async (id) => {

        if (!window.confirm(
            "Are you sure you want to delete this product?"
        )) {
            return;
        }

        try {

            await axios.delete(
                `${API_URL}/api/products/${id}`
            );

            alert("Product Deleted Successfully");

            loadProducts();

        } catch (err) {

            console.log(err);

            alert(
                err.response?.data?.error ||
                "Delete Failed"
            );
        }
    };


    return (

        <div className="product-master-container">
            <div className="product-master-header">

                <button
                    className="product-back-btn"
                    onClick={() => navigate("/support")}
                >
                    Go Back
                </button>

                <h2>Product Names</h2>

            </div>

            {/* Add / Edit Product */}

            <form
                className="product-form"
                onSubmit={handleSubmit}
            >

                <input
                    type="text"
                    className="product-input"
                    placeholder="Enter Product Name"
                    value={productName}
                    onChange={(e) =>
                        setProductName(e.target.value)
                    }
                />

                <button
                    type="submit"
                    className="product-add-btn"
                >
                    {editId ? "Update Product" : "Add Product"}
                </button>

                {editId && (

                    <button
                        type="button"
                        className="product-cancel-btn"
                        onClick={() => {
                            setEditId(null);
                            setProductName("");
                        }}
                    >
                        Cancel
                    </button>

                )}

            </form>


            {/* Product List */}

            <table className="product-table">

                <thead>

                    <tr>

                        <th>S.NO</th>

                        <th>Product Name</th>

                        <th>Action</th>

                    </tr>

                </thead>


                <tbody>

                    {products.map((product, index) => (

                        <tr key={product.id}>

                            <td>
                                {index + 1}
                            </td>

                            <td>
                                {product.product_name}
                            </td>

                            <td>

                                <button
                                    className="product-edit-btn"
                                    onClick={() =>
                                        handleEdit(product)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    className="product-delete-btn"
                                    onClick={() =>
                                        handleDelete(product.id)
                                    }
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );

};

export default Products;