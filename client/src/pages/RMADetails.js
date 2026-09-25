import React, {
    useEffect,
    useState
} from "react";

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


    // =========================================
    // LOAD RMA DETAILS
    // =========================================

    useEffect(() => {

        if (!rma_no) {
            return;
        }

        setLoading(true);

        axios
            .get(
                `https://smazo.onrender.com/rma-details_r/${rma_no}`
            )

            .then((response) => {

                console.log(
                    "RMA DETAILS:",
                    response.data
                );

                setData(
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : []
                );

                setLoading(false);

            })

            .catch((error) => {

                console.log(
                    "RMA DETAILS ERROR:",
                    error
                );

                setData([]);

                setLoading(false);

            });

    }, [rma_no]);


    // =========================================
    // LOAD SUPPORTER
    // =========================================

    const loadSupporter =
        async (serialNo) => {

            try {

                setSupporterData([]);
                setSupporterHistory([]);


                if (!serialNo) {

                    return;

                }


                const response =
                    await axios.get(
                        `https://smazo.onrender.com/api/supporter-by-serial/${serialNo}`
                    );


                console.log(
                    "SUPPORTER:",
                    response.data
                );


                const supporterRows =
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : [];


                setSupporterData(
                    supporterRows
                );


                if (
                    supporterRows.length > 0
                ) {

                    const supporterId =
                        supporterRows[0].id;


                    const historyResponse =
                        await axios.get(
                            `https://smazo.onrender.com/api/supporter-status-history/${supporterId}`
                        );


                    console.log(
                        "SUPPORTER HISTORY:",
                        historyResponse.data
                    );


                    setSupporterHistory(
                        Array.isArray(
                            historyResponse.data
                        )
                            ? historyResponse.data
                            : []
                    );

                }

            } catch (error) {

                console.log(
                    "SUPPORTER ERROR:",
                    error
                );

                setSupporterData([]);

                setSupporterHistory([]);

            }

        };


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <div className="rma-inline-loading">

                Loading RMA Details...

            </div>

        );

    }


    // =========================================
    // NO DATA
    // =========================================

    if (data.length === 0) {

        return (

            <div className="rma-details-container">

                <div className="rma-details-header">

                    <div>

                        <h2>
                            RMA Details
                        </h2>

                        <p>
                            RMA No :{" "}
                            <strong>
                                {rma_no}
                            </strong>
                        </p>

                    </div>


                    <button
                        type="button"
                        className="hide-details-btn"
                        onClick={onClose}
                    >
                        Hide
                    </button>

                </div>


                <div className="rma-empty">

                    No Data Found

                </div>

            </div>

        );

    }


    // =========================================
    // MAIN
    // =========================================

    return (

        <div className="rma-details-container">


            {/* =================================
                HEADER
            ================================= */}

            <div className="rma-details-header">

                <div>

                    <h2>
                        RMA Details
                    </h2>

                    <p>

                        RMA No :{" "}

                        <strong>
                            {rma_no}
                        </strong>

                    </p>

                </div>


                <button
                    type="button"
                    className="hide-details-btn"
                    onClick={onClose}
                >
                    Hide
                </button>

            </div>


            {/* =================================
                CUSTOMER INFO
            ================================= */}

            <div className="customer-info">

                <div>

                    <span>
                        Customer
                    </span>

                    <strong>
                        {data[0]
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
                        {data[0]
                            ?.rma_no ||
                            rma_no
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Entry Date
                    </span>

                    <strong>

                        {data[0]
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


            {/* =================================
                PRODUCTS TITLE
            ================================= */}

            <h3 className="products-title">

                RMA Products

            </h3>


            {/* =================================
                PRODUCT TABLE
            ================================= */}

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
                                Replacement
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

                                            {index === 0 ||
                                            data[index - 1]
                                                ?.id !==
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


                                        {/* ISSUE */}

                                        <td>
                                            {
                                                item.issues ||
                                                "-"
                                            }
                                        </td>


                                        {/* REPLACEMENT VIEW */}

                                        <td>

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

                                        </td>


                                        {/* STATUS UPDATE */}

                                        <td>

                                            <Link
                                                to={`/statuspage/${item.item_id}`}
                                                className="modal-status-update-btn"
                                            >
                                                status
                                            </Link>

                                        </td>


                                        {/* STATUS HISTORY */}

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


            {/* =================================
                SUPPORTER DETAILS
            ================================= */}

            {supporterData.length > 0 && (

                <div className="supporter-section">

                    <h3>
                        Replacement Product Details
                    </h3>


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
                                (row, index) => (

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
                                                    row.return_status
                                                        ?.trim()
                                                        .toLowerCase() ===
                                                    "returned"
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

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}


            {/* =================================
                SUPPORTER HISTORY
            ================================= */}

            {supporterHistory.length > 0 && (

                <div className="supporter-section">

                    <h3>
                        Return Status History
                    </h3>


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
                                (history, index) => (

                                    <tr
                                        key={
                                            history.id ||
                                            index
                                        }
                                    >

                                        <td>
                                            {index + 1}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    history.status
                                                        ?.trim()
                                                        .toLowerCase() ===
                                                    "returned"
                                                        ? "supporter-returned"
                                                        : "supporter-pending"
                                                }
                                            >
                                                {
                                                    history.status ||
                                                    "-"
                                                }
                                            </span>

                                        </td>

                                        <td>

                                            {history.status_date
                                                ? new Date(
                                                    history.status_date
                                                ).toLocaleString()
                                                : "-"
                                            }

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}


            {/* =================================
                HIDE
            ================================= */}

            <div className="details-hide-footer">

                <button
                    type="button"
                    className="hide-details-btn"
                    onClick={onClose}
                >
                    Hide
                </button>

            </div>


        </div>

    );

}

export default RMADetails;