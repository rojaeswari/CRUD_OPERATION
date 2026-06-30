import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function SerialRMAOut() {

    const [data, setData] = useState([]);
    const [completedata, setCompletedata] = useState([]);

    const location = useLocation();

    const type =
        location.pathname === "/serial-completed-rma-out"
            ? "completed"
            : "pending";

    useEffect(() => {

        axios
            .get("http://localhost:5000/api/serial-pending-rma-out")
            .then((res) => {
                setData(res.data);
            });

    }, []);

    useEffect(() => {

        axios
            .get("http://localhost:5000/api/serial-completed-rma-out")
            .then((res) => {
                setCompletedata(res.data);
            });

    }, []);

    return (
        <div className="container">

            <h2>
                {type === "pending"
                    ? "Serial No Pending Outward List"
                    : "Serial No Completed Outward List"}
            </h2>

            <table className="table table-bordered">

                <thead>
                    <tr>
                        <th>RMA No</th>
                        {/* <th>Customer DC No</th> */}
                        <th>Product</th>
                        <th>Model</th>
                        <th>Serial No</th>
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
                            <td>{item.serial_no}</td>
                            <td>{item.status}</td>
                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default SerialRMAOut;