import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Home_l.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Homel = () => {
    const nav = useNavigate();

    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    // =====================================================
    // LOAD RMA DATA
    // =====================================================
    const loadData = async () => {
        try {
            const response = await axios.get(
                "https://smazo.onrender.com/api/get_P"
            );

            console.log("RMA DATA =", response.data);

            setData(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {
            console.log("Load RMA Error:", error);
        }
    };

    // =====================================================
    // DELETE RMA
    // =====================================================
    const deleteRMA = async (rma_no) => {

        if (
            !window.confirm(
                "Are you sure you want to delete this RMA?"
            )
        ) {
            return;
        }

        try {

            await axios.delete(
                `https://smazo.onrender.com/delete-rma_r/${rma_no}`
            );

            alert("Deleted Successfully");

            loadData();

        } catch (err) {

            console.log(err);
            alert("Delete failed");

        }
    };

    // =====================================================
    // PDF
    // =====================================================
    const generatePDF = async (item) => {

        try {

            const resp = await axios.get(
                `https://smazo.onrender.com/api/pdf/${item.rma_no}`
            );

            const pdfData = resp.data;

            console.log("PDF DATA =", pdfData);

            if (!pdfData || pdfData.length === 0) {
                alert("No Data Found");
                return;
            }

            const headerData = pdfData[0];

            const entryDate = headerData.entry_date
                ? headerData.entry_date.substring(0, 10)
                : "";

            const doc = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a5"
            });

            doc.rect(5, 5, 200, 138);

            // =================================================
            // COMPANY HEADER
            // =================================================

            doc.setFontSize(16);
            doc.setFont(undefined, "bold");

            doc.text(
                "SMAZO SECURITY SYSTEMS",
                105,
                15,
                {
                    align: "center"
                }
            );

            doc.setFontSize(7);
            doc.setFont(undefined, "normal");

            doc.text(
                "GSTIN: 33CFJPD9030B2ZZ",
                177,
                15,
                {
                    align: "right"
                }
            );

            doc.setFontSize(8);

            doc.text(
                "3A/1, Aanoor Amman Complex, Veerabathara Road, Veerappan Chattram, Erode,Tamilnadu - 638011,Email: sales@smazoindia.com",
                105,
                22,
                {
                    align: "center"
                }
            );

            doc.text(
                "Contact: 9042606713, 9042606715",
                105,
                27,
                {
                    align: "center"
                }
            );

            // =================================================
            // MINI HEADER
            // =================================================

            const drawMiniHeader = () => {

                doc.setFontSize(10);
                doc.setFont(undefined, "bold");

                doc.setLineWidth(0.2);

                doc.rect(5, 5, 202, 139);

                doc.text(
                    "SMAZO",
                    100,
                    9,
                    {
                        align: "center"
                    }
                );

                doc.setFontSize(8);
                doc.setFont(undefined, "normal");

                doc.text(
                    `Customer : ${headerData.customer_name || ""}`,
                    11,
                    12
                );

                doc.text(
                    `Phone : ${headerData.phone_no || ""}`,
                    60,
                    12
                );

                doc.text(
                    `RMA No : ${headerData.rma_no || ""}`,
                    110,
                    12
                );

                doc.text(
                    `Entry Date : ${entryDate}`,
                    155,
                    12
                );
            };

            autoTable(doc, {
                startY: 25,

                didDrawPage: function (data) {

                    if (data.pageNumber > 1) {
                        drawMiniHeader();
                    }

                },

                margin: {
                    top: 30
                }
            });

            // =================================================
            // CUSTOMER DETAILS
            // =================================================

            doc.rect(13, 35, 182, 55);

            doc.setFontSize(9);
            doc.setFont(undefined, "bold");

            doc.text(
                `RMA No : ${headerData.rma_no}`,
                18,
                43
            );

            doc.text(
                `Entry Date : ${entryDate}`,
                80,
                43
            );

            doc.text(
                `Staff : ${headerData.created_by_name || ""}`,
                145,
                43
            );

            doc.line(
                13,
                48,
                195,
                48
            );

            doc.setFontSize(10);

            doc.text(
                "Customer Details",
                18,
                55
            );

            doc.setFont(undefined, "normal");
            doc.setFontSize(9);

            doc.text(
                `Customer : ${headerData.customer_name || ""}`,
                18,
                62
            );

            doc.text(
                `Company : ${headerData.company_name || ""}`,
                18,
                70
            );

            doc.text(
                `Phone : ${headerData.phone_no || ""}`,
                105,
                62
            );

            doc.text(
                `Email : ${headerData.email || ""}`,
                105,
                70
            );

            const address = doc.splitTextToSize(
                `Address : ${headerData.address || ""}`,
                160
            );

            doc.text(
                address,
                18,
                78
            );

            // =================================================
            // RMA DETAILS TABLE
            // =================================================

            autoTable(doc, {

                startY: 94,

                theme: "grid",

                head: [[
                    "Product Name",
                    "Model No",
                    "Qty",
                    "Serial No",
                    "Accessory",
                    "Issue"
                ]],

                body: pdfData.map(
                    (row, index) => {

                        const prevRow =
                            pdfData[index - 1];

                        const showQty =
                            index === 0 ||
                            !prevRow ||
                            prevRow.product_name !==
                                row.product_name ||
                            prevRow.model_number !==
                                row.model_number;

                        return [
                            row.product_name || "",
                            row.model_number || "",
                            showQty
                                ? row.quantity_no
                                : "",
                            row.serial_no || "",
                            row.accessory || "",
                            row.issues || ""
                        ];
                    }
                ),

                didDrawPage: function (data) {

                    if (data.pageNumber > 1) {
                        drawMiniHeader();
                    }

                },

                styles: {
                    fontSize: 8,
                    halign: "center",
                    valign: "middle"
                },

                headStyles: {
                    fillColor: [220, 220, 220],
                    textColor: [0, 0, 0]
                }

            });

            // =================================================
            // SIGNATURE
            // =================================================

            const finalY =
                doc.lastAutoTable
                    ? doc.lastAutoTable.finalY + 15
                    : 120;

            doc.setFontSize(9);

            doc.text(
                "Customer Signature",
                15,
                finalY
            );

            doc.text(
                "Authorized Signature",
                140,
                finalY
            );

            // =================================================
            // PAGE NUMBER
            // =================================================

            const totalPages =
                doc.internal.getNumberOfPages();

            for (
                let i = 1;
                i <= totalPages;
                i++
            ) {

                doc.setPage(i);

                const pageWidth =
                    doc.internal.pageSize.getWidth();

                const pageHeight =
                    doc.internal.pageSize.getHeight();

                doc.setFontSize(8);

                doc.setTextColor(100);

                doc.text(
                    `Page ${i} of ${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 5,
                    {
                        align: "center"
                    }
                );
            }

            // =================================================
            // SAVE
            // =================================================

            doc.save(
                `RMA_${item.rma_no}.pdf`
            );

        } catch (err) {

            console.log(
                "PDF ERROR:",
                err
            );

        }
    };

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredData = [...data]
        .filter((item) => {

            const searchText =
                search.toLowerCase();

            return (
                item.customer_name
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.company_name
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.product_name
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.model_number
                    ?.toLowerCase()
                    .includes(searchText) ||

                String(item.rma_no || "")
                    .toLowerCase()
                    .includes(searchText)
            );

        })
        .sort((a, b) => {

            const statusA =
                a.status
                    ?.trim()
                    .toLowerCase();

            const statusB =
                b.status
                    ?.trim()
                    .toLowerCase();

            if (
                statusA === "completed" &&
                statusB !== "completed"
            ) {
                return -1;
            }

            if (
                statusA !== "completed" &&
                statusB === "completed"
            ) {
                return 1;
            }

            return (
                Number(b.rma_no) -
                Number(a.rma_no)
            );
        });

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="top-btns">

            {/* =================================================
                TOP BUTTONS
            ================================================= */}

            <div className="top-buttons">

                <Link to="/Dashboard">

                    <button className="back-btn">
                        Go Back
                    </button>

                </Link>

                <Link to="/supporter">

                    <button className="view-btn">
                        supporter
                    </button>

                </Link>

                <input
                    type="text"
                    className="form-control w-50"
                    placeholder="Search by Customer Name, Company Name, Product Name or Model No..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <Link to="/home/add">

                    <button className="add-btn">
                        Add RMA Entry
                    </button>

                </Link>

            </div>

            {/* =================================================
                RMA TABLE
            ================================================= */}

            <table className="rma-table">

                <thead>

                    <tr>

                        <th>RMA NO</th>

                        <th>Customer Name</th>

                        <th>Product Name</th>

                        <th>Model Number</th>

                        <th>Quantity</th>

                        <th>Status</th>

                        <th>Entry Date</th>

                        <th>Summary</th>

                        <th>Action</th>

                        <th>View</th>

                        <th>Product Details</th>

                    </tr>

                </thead>

                <tbody>

                    {filteredData.map(
                        (item) => {

                            return (

                                <tr
                                    key={item.id}
                                >

                                    {/* RMA NO */}

                                    <td
                                        style={{
                                            backgroundColor:
                                                item.status
                                                    ?.trim()
                                                    .toLowerCase() ===
                                                "completed"
                                                    ? "#1adab0"
                                                    : "white"
                                        }}
                                    >
                                        {item.rma_no}
                                    </td>

                                    {/* CUSTOMER */}

                                    <td>
                                        {item.customer_name}
                                    </td>

                                    {/* PRODUCT */}

                                    <td>
                                        {item.product_name}
                                    </td>

                                    {/* MODEL */}

                                    <td>
                                        {item.model_number}
                                    </td>

                                    {/* QUANTITY */}

                                    <td>
                                        {item.quantity_no}
                                    </td>

                                    {/* STATUS */}

                                    <td>
                                        {item.status}
                                    </td>

                                    {/* ENTRY DATE */}

                                    <td>

                                        {item.entry_date
                                            ? new Date(
                                                item.entry_date
                                            ).toLocaleDateString(
                                                "en-GB"
                                            )
                                            : "-"}

                                    </td>

                                    {/* SUMMARY */}

                                    <td>
                                        {item.status}
                                    </td>

                                    {/* ACTION */}

                                    <td>

                                        <Link
                                            to={`/update-rma1/${item.rma_no}`}
                                        >

                                            <button
                                                className="edit-btn"
                                            >
                                                Edit
                                            </button>

                                        </Link>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                deleteRMA(
                                                    item.rma_no
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </td>

                                    {/* =================================================
                                        VIEW BUTTON
                                        THIS IS YOUR EXISTING VIEW BUTTON
                                        DO NOT CHANGE
                                    ================================================= */}

                                    <td>

                                        <button
                                            className="view-btn"
                                            onClick={() =>
                                                nav(
                                                    `/rma-details_r/${item.rma_no}`,
                                                    {
                                                        state: {
                                                            from: "/home/home_l"
                                                        }
                                                    }
                                                )
                                            }
                                        >
                                            View
                                        </button>

                                    </td>

                                    {/* =================================================
                                        PRODUCT DROPDOWN
                                    ================================================= */}

                                    <td>

                                        <select
                                            className="product-dropdown"
                                            defaultValue=""
                                            onChange={(e) => {

                                                const selectedRma =
                                                    e.target.value;

                                                if (
                                                    selectedRma
                                                ) {

                                                    nav(
                                                        `/rma-details_r/${selectedRma}`,
                                                        {
                                                            state: {
                                                                from:
                                                                    "/home/home_l"
                                                            }
                                                        }
                                                    );

                                                }

                                            }}
                                        >

                                            <option value="">
                                                Select Product
                                            </option>

                                            {data
                                                .filter(
                                                    (product) =>
                                                        String(
                                                            product.rma_no
                                                        ) ===
                                                        String(
                                                            item.rma_no
                                                        )
                                                )
                                                .map(
                                                    (product) => (

                                                        <option
                                                            key={
                                                                product.id
                                                            }
                                                            value={
                                                                product.rma_no
                                                            }
                                                        >

                                                            {product.product_name ||
                                                                "Product"}

                                                            {" - "}

                                                            {product.model_number ||
                                                                "Model"}

                                                        </option>

                                                    )
                                                )}

                                        </select>

                                    </td>

                                </tr>

                            );

                        }
                    )}

                </tbody>

            </table>

        </div>
    );
};

export default Homel;