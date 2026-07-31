import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./supporter.css";

const SupporterView = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState({});
    const [history, setHistory] = useState([]);

    useEffect(() => {

        axios
            .get(`https://smazo.onrender.com/api/supporter-view/${id}`)
            .then((res) => {

                console.log(res.data);

                setProduct(res.data.product);
                setHistory(res.data.history);

            })
            .catch((err) => {
                console.log("VIEW ERROR:", err);
            });

    }, [id]);

   return (
    <div style={{ marginTop: "150px", padding: "30px" }}>

        <h2>Product Return Details</h2>

        <div className="product-details">

            <p>
                <strong>Customer Name:</strong>{" "}
                {product.customer_name}
            </p>

            <p>
                <strong>Product Name:</strong>{" "}
                {product.product_name}
            </p>

            <p>
                <strong>Model No:</strong>{" "}
                {product.model_no}
            </p>

            <p>
                <strong>Serial No:</strong>{" "}
                {product.serial_no}
            </p>

            <p>
                <strong>Replacement Serial No:</strong>{" "}
                {product.replacement_serial_no}
            </p>

            <div className="current-status">
                <strong>Current Status:</strong>

                <span
                    className={
                        product.return_status === "Returned"
                            ? "status-returned"
                            : "status-not-returned"
                    }
                >
                    {product.return_status}
                </span>
            </div>

        </div>

        <h3>Status History</h3>

        <table className="styled-table">

            <thead>
                <tr>
                    <th>S.NO</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </thead>

            <tbody>

                {history.map((item, index) => (
                    <tr key={item.id}>

                        <td>{index + 1}</td>

                        <td>{item.status}</td>

                        <td>
                            {new Date(
                                item.status_date
                            ).toLocaleString()}
                        </td>

                    </tr>
                ))}

            </tbody>

        </table>

        <button
            className="view-back-btn"
            onClick={() => navigate("/support")}
        >
            Go Back
        </button>

    </div>
);
};

export default SupporterView;