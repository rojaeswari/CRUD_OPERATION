import React, { useEffect, useState } from "react";
import axios from "axios";

const Products = () => {

    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState("");
    const [editId, setEditId] = useState(null);

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

        <div style={{
            marginTop: "150px",
            padding: "30px"
        }}>

            <h2>Product Master</h2>


            {/* Add / Edit Product */}

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Enter Product Name"
                    value={productName}
                    onChange={(e) =>
                        setProductName(e.target.value)
                    }
                />

                <button type="submit">

                    {editId ? "Update" : "Add Product"}

                </button>

                {editId && (

                    <button
                        type="button"
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

            <table className="styled-table">

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
                                    onClick={() =>
                                        handleEdit(product)
                                    }
                                >
                                    Edit
                                </button>

                                <button
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