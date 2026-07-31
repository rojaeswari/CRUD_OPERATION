import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./support.css";
// import { Toast } from "react-toastify";
import axios from "axios";
// import supporter from "./supporter";

const Support = () => {

    const [data, setData] = useState([]);

    const loadData = async () => {
        const response = await axios.get(
            "https://smazo.onrender.com/api/get1"
        );

        console.log(response.data);

        setData(response.data);
    };

    useEffect(() => {
        loadData();
    }, []);


    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete?")) {

            try {
                await axios.delete(
                    `https://smazo.onrender.com/api/remove1/${id}`
                );

                // alert("Product Deleted Successfully");

                loadData();

            } catch (err) {
                console.log(err);
                alert("Delete Failed");
            }
        }
    };
    const updateReturnStatus = async (id, status) => {
        try {
            await axios.put(
                `https://smazo.onrender.com/api/update-return-status/${id}`,
                {
                    return_status: status
                }
            );

            alert("Return Status Updated Successfully");

            loadData();

        } catch (err) {
            console.log(err);
            alert("Return Status Update Failed");
        }
    };




    return (

        <div style={{ marginTop: "150px" }}>


            <div className="top-bar">
                <Link to="/home/home_l">
                    <button className="back-btn">
                        Go Back
                    </button>
                </Link>

                <Link to="/supporter">
                    <button className="add-btn">
                        + Add Product
                    </button>
                </Link>
            </div>
            <table className="styled-table">

                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>S.NO</th>
                        <th style={{ textAlign: "center" }}> Customer Name</th>
                        <th style={{ textAlign: "center" }}>Product Name</th>
                        <th style={{ textAlign: "center" }}>Model No</th>
                        <th style={{ textAlign: "center" }}> Serial No</th>
                        <th style={{ textAlign: "center" }}>  Replacement Serial No</th>
                        <th style={{ textAlign: "center" }}>Return Status</th>
                        <th style={{ textAlign: "center" }}> Action</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>{item.customer_name}</td>
                            <td>{item.product_name}</td>
                            <td>{item.model_no}</td>
                            <td>{item.serial_no}</td>
                            <td>{item.replacement_serial_no}</td>
                            <td>
                                <select
                                    value={item.return_status || "Not Returned"}
                                    onChange={(e) =>
                                        updateReturnStatus(item.id, e.target.value)
                                    }
                                >
                                    <option value="Not Returned">
                                        Not Returned
                                    </option>

                                    <option value="Returned">
                                        Returned
                                    </option>
                                </select>
                            </td>

                            <td>
                                <Link to={`/supporter/${item.id}`}>
                                    <button className="btn-edit">
                                        Edit
                                    </button>
                                </Link>
                                <Link to={`/supporter-view/${item.id}`}>
    <button className="btn-view">
        View
    </button>
</Link>

                                <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(item.id)}
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

export default Support;