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
            .get("http://localhost:5000/api/pending-rma-out")
            .then((res) => {
                setData(res.data);
            });

    }, []);

    useEffect(() => {

        axios
            .get("http://localhost:5000/api/completed-rma-out")
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
                         {/* <th>Customer DC No</th> */}
                        <th>Product</th>
                        <th>Model</th>
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
                             {/* <td>{item.customer_dc_no}</td> */}
                            <td>{item.product_name}</td>
                            <td>{item.model_number}</td>
                            <td>{item.status}</td>
                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default TotalRMAOut;