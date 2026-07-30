import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function TotalRMAOut() {

    const [data, setData] = useState([]);
    const [completedata, setCompletedata] = useState([]);

    const location = useLocation();

    const type =
        location.pathname === "/completed-rma-out"
            ? "completed"
            : "pending";

    useEffect(() => {

        axios
            .get("https://smazo.onrender.com/api/pending-rma-out")
            .then((res) => {
                setData(res.data);
            });

    }, []);

    useEffect(() => {

        axios
            .get("https://smazo.onrender.com/api/completed-rma-out")
            .then((res) => {
                setCompletedata(res.data);
            });

    }, []);

    return (
        <div className="container">

            <h2>
                {type === "pending"
                    ? "Pending RMA Out List"
                    : "Completed RMA Out List"}
            </h2>

            <table className="table table-bordered">

                <thead>
                    <tr>
                        <th>RMA No</th>
                        <th>Center Name</th>
                        <th>Product</th>
                        <th>Model</th>
                        <th>Quantity</th>
                        <th>Entry date</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>

                    {(type === "pending"
                        ? data
                        : completedata
                    ).map((item) => (

                        <tr key={item.id}>
                            <td>{item.rma_no}</td>
                            <td>{item.center_name}</td>
                            <td>{item.product_name}</td>
                            <td>{item.model_number}</td>
                            <td>{item.quantity_no}</td>
                            <td>
                                {item.entry_date
                                    ? new Date(item.entry_date).toLocaleDateString("en-GB")
                                    : "-"}
                            </td>
                            <td>{item.status}</td>
                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default TotalRMAOut;