import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home_l.css";


function RMADetails({
    rma_no,
    onClose
}) {


    const [data, setData] =
        useState([]);


    const [supporterData, setSupporterData] =
        useState([]);


    const [supporterHistory, setSupporterHistory] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    // =====================================================
    // LOAD RMA DETAILS
    // =====================================================

    useEffect(() => {

        if (!rma_no) {

            return;

        }


        setLoading(true);


        axios

            .get(
                `https://smazo.onrender.com/rma-details_r/${rma_no}`
            )

            .then((res) => {

                console.log(
                    "RMA DETAILS:",
                    res.data
                );


                setData(
                    Array.isArray(res.data)
                        ? res.data
                        : []
                );


                setLoading(false);

            })

            .catch((err) => {

                console.log(
                    "RMA DETAILS ERROR:",
                    err
                );


                setData([]);

                setLoading(false);

            });

    }, [rma_no]);


    // =====================================================
    // LOAD REPLACEMENT PRODUCT
    // =====================================================

    const loadSupporter = async (
        serialNo
    ) => {

        try {

            if (!serialNo) {

                alert(
                    "Serial number not available"
                );

                return;

            }


            setSupporterData([]);

            setSupporterHistory([]);


            const res =
                await axios.get(

                    `https://smazo.onrender.com/api/supporter-by-serial/${serialNo}`

                );


            console.log(
                "SUPPORTER DATA:",
                res.data
            );


            const supporterResult =
                Array.isArray(res.data)
                    ? res.data
                    : [];


            setSupporterData(
                supporterResult
            );


            // =================================================
            // LOAD HISTORY
            // =================================================

            if (
                supporterResult.length > 0
            ) {

                const supporterId =
                    supporterResult[0].id;


                const historyRes =
                    await axios.get(

                        `https://smazo.onrender.com/api/supporter-status-history/${supporterId}`

                    );


                console.log(
                    "SUPPORTER HISTORY:",
                    historyRes.data
                );


                setSupporterHistory(

                    Array.isArray(
                        historyRes.data
                    )
                        ? historyRes.data
                        : []

                );

            }


        } catch (err) {

            console.log(
                "SUPPORTER ERROR:",
                err
            );

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="rma-modal-overlay">

                <div className="rma-modal">

                    <div className="rma-loading">

                        Loading RMA Details...

                    </div>

                </div>

            </div>

        );

    }


    // =====================================================
    // NO DATA
    // =====================================================

    if (data.length === 0) {

        return (

            <div className="rma-modal-overlay">

                <div className="rma-modal">


                    <div className="rma-modal-header">

                        <div>

                            <h2>
                                RMA Details
                            </h2>

                            <p>
                                RMA No :
                                <strong>
                                    {rma_no}
                                </strong>
                            </p>

                        </div>


                        <button
                            type="button"
                            className="modal-close-btn"
                            onClick={onClose}
                        >
                            ✕
                        </button>

                    </div>


                    <div className="rma-empty">

                        No Data Found

                    </div>


                </div>

            </div>

        );

    }


    // =====================================================
    // MAIN MODAL
    // =====================================================

    return (

        <div
            className="rma-modal-overlay"
            onClick={onClose}
        >


            <div
                className="rma-modal"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="rma-modal-header">


                    <div>

                        <h2>
                            RMA Details
                        </h2>


                        <p>

                            RMA No :
                            <strong>
                                {rma_no}
                            </strong>

                        </p>

                    </div>


                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                    >

                        ✕

                    </button>


                </div>


                {/* =================================================
                    CUSTOMER INFORMATION
                ================================================= */}

                <div className="customer-info">


                    <div>

                        <span>
                            Customer
                        </span>

                        <strong>
                            {
                                data[0]
                                    ?.customer_name ||
                                "-"
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            RMA No
                        </span>

                        <strong>
                            {
                                data[0]
                                    ?.rma_no ||
                                "-"
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Entry Date
                        </span>

                        <strong>

                            {
                                data[0]
                                    ?.entry_date

                                    ? new Date(
                                        data[0]
                                            .entry_date
                                    ).toLocaleDateString(
                                        "en-GB"
                                    )

                                    : "-"
                            }

                        </strong>

                    </div>


                    <div>

                        <span>
                            Total Products
                        </span>

                        <strong>
                            {data.length}
                        </strong>

                    </div>


                </div>


                {/* =================================================
                    PRODUCTS TITLE
                ================================================= */}

                <h3 className="products-title">

                    RMA Products

                </h3>


                {/* =================================================
                    PRODUCTS TABLE
                ================================================= */}

                <div className="rma-products-table-wrapper">


                    <table className="rma-products-table">


                        <thead>

                            <tr>

                                <th>
                                    S.No
                                </th>

                                <th>
                                    Product Name
                                </th>

                                <th>
                                    Model Number
                                </th>

                                <th>
                                    Quantity
                                </th>

                                <th>
                                    Serial No
                                </th>

                                <th>
                                    Accessory
                                </th>

                                <th>
                                    Issues
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Status Update
                                </th>

                                <th>
                                    Status History
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                            {data.map(
                                (item, index) => {


                                    const isCompleted =

                                        item.status
                                            ?.trim()
                                            .toLowerCase() ===
                                        "completed";


                                    return (

                                        <tr
                                            key={
                                                item.item_id ||
                                                item.serial_no ||
                                                index
                                            }
                                        >


                                            {/* S.NO */}

                                            <td>
                                                {index + 1}
                                            </td>


                                            {/* PRODUCT */}

                                            <td

                                                className={

                                                    isCompleted

                                                        ? "product-completed"

                                                        : "product-pending"

                                                }

                                            >

                                                {
                                                    item.product_name ||
                                                    "-"
                                                }

                                            </td>


                                            {/* MODEL */}

                                            <td>

                                                {
                                                    item.model_number ||
                                                    "-"
                                                }

                                            </td>


                                            {/* QUANTITY */}

                                            <td>

                                                {
                                                    index === 0 ||
                                                    data[
                                                        index - 1
                                                    ].id !==
                                                    item.id

                                                    ? item.quantity_no

                                                    : ""

                                                }

                                            </td>


                                            {/* SERIAL */}

                                            <td>

                                                {
                                                    item.serial_no ||
                                                    "-"
                                                }

                                            </td>


                                            {/* ACCESSORY */}

                                            <td>

                                                {
                                                    item.accessory ||
                                                    "-"
                                                }

                                            </td>


                                            {/* ISSUES */}

                                            <td>

                                                {
                                                    item.issues ||
                                                    "-"
                                                }

                                            </td>


                                            {/* =================================================
                                                STATUS + VIEW
                                            ================================================= */}

                                            <td>

                                                <div className="status-cell">


                                                    <span

                                                        className={

                                                            isCompleted

                                                                ? "status-completed"

                                                                : "status-pending"

                                                        }

                                                    >

                                                        {
                                                            item.status ||
                                                            "Pending"
                                                        }

                                                    </span>


                                                    <button

                                                        type="button"

                                                        className="modal-view-btn"

                                                        onClick={() =>
                                                            loadSupporter(
                                                                item.serial_no
                                                            )
                                                        }

                                                    >

                                                        View

                                                    </button>


                                                </div>

                                            </td>


                                            {/* =================================================
                                                STATUS UPDATE
                                            ================================================= */}

                                            <td>

                                                <Link

                                                    to={`/statuspage/${item.item_id}`}

                                                    className="modal-status-update-btn"

                                                >

                                                    Status

                                                </Link>

                                            </td>


                                            {/* =================================================
                                                HISTORY
                                            ================================================= */}

                                            <td>

                                                <Link

                                                    to={`/serial-history/${item.serial_no}`}

                                                    className="modal-history-btn"

                                                >

                                                    View

                                                </Link>

                                            </td>


                                        </tr>

                                    );

                                }

                            )}


                        </tbody>


                    </table>


                </div>


                {/* =================================================
                    REPLACEMENT PRODUCT
                ================================================= */}

                {supporterData.length > 0 && (

                    <div className="supporter-section">


                        <h3>

                            Replacement Product Details

                        </h3>


                        <div className="rma-products-table-wrapper">


                            <table className="rma-products-table">


                                <thead>

                                    <tr>

                                        <th>
                                            S.No
                                        </th>

                                        <th>
                                            Product Name
                                        </th>

                                        <th>
                                            Model No
                                        </th>

                                        <th>
                                            Serial No
                                        </th>

                                        <th>
                                            Replacement Serial No
                                        </th>

                                        <th>
                                            Return Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>


                                    {supporterData.map(
                                        (row, index) => {


                                            const returned =

                                                row.return_status
                                                    ?.trim()
                                                    .toLowerCase() ===
                                                "returned";


                                            return (

                                                <tr
                                                    key={
                                                        row.id ||
                                                        index
                                                    }
                                                >


                                                    <td>
                                                        {index + 1}
                                                    </td>


                                                    <td>
                                                        {
                                                            row.product_name ||
                                                            "-"
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            row.model_no ||
                                                            "-"
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            row.serial_no ||
                                                            "-"
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            row.replacement_serial_no ||
                                                            "-"
                                                        }
                                                    </td>


                                                    <td>

                                                        <span

                                                            className={

                                                                returned

                                                                    ? "supporter-returned"

                                                                    : "supporter-pending"

                                                            }

                                                        >

                                                            {
                                                                row.return_status ||
                                                                "Pending"
                                                            }

                                                        </span>

                                                    </td>


                                                </tr>

                                            );

                                        }

                                    )}


                                </tbody>


                            </table>


                        </div>


                    </div>

                )}


                {/* =================================================
                    STATUS HISTORY
                ================================================= */}

                {supporterHistory.length > 0 && (

                    <div className="supporter-section">


                        <h3>

                            Return Status History

                        </h3>


                        <div className="rma-products-table-wrapper">


                            <table className="rma-products-table">


                                <thead>

                                    <tr>

                                        <th>
                                            S.No
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>


                                    {supporterHistory.map(
                                        (item, index) => {


                                            const returned =

                                                item.status
                                                    ?.trim()
                                                    .toLowerCase() ===
                                                "returned";


                                            return (

                                                <tr
                                                    key={
                                                        item.id ||
                                                        index
                                                    }
                                                >


                                                    <td>
                                                        {index + 1}
                                                    </td>


                                                    <td>

                                                        <span

                                                            className={

                                                                returned

                                                                    ? "supporter-returned"

                                                                    : "supporter-pending"

                                                            }

                                                        >

                                                            {
                                                                item.status ||
                                                                "-"
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        {
                                                            item.status_date

                                                                ? new Date(
                                                                    item.status_date
                                                                ).toLocaleString()

                                                                : "-"
                                                        }

                                                    </td>


                                                </tr>

                                            );

                                        }

                                    )}


                                </tbody>


                            </table>


                        </div>


                    </div>

                )}


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="modal-footer">


                    <button

                        type="button"

                        className="modal-back-btn"

                        onClick={onClose}

                    >

                        Close

                    </button>


                </div>


            </div>


        </div>

    );

}


export default RMADetails;