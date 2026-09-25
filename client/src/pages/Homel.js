import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home_l.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import RMADetails from "./RMADetails";

const Homel = () => {

    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedRmaNo, setSelectedRmaNo] = useState(null);

    // =========================================
    // LOAD RMA DATA
    // =========================================

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        try {

            const response = await axios.get(
                "https://smazo.onrender.com/api/get_P"
            );

            console.log("RMA DATA:", response.data);

            setData(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.log("LOAD RMA ERROR:", error);

            setData([]);

        }

    };


    // =========================================
    // DELETE RMA
    // =========================================

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

            // If deleted RMA is currently opened
            if (selectedRmaNo === rma_no) {
                setSelectedRmaNo(null);
            }

            loadData();

        } catch (error) {

            console.log("DELETE ERROR:", error);

            alert("Delete Failed");

        }

    };


    // =========================================
    // PDF
    // =========================================

    const generatePDF = async (item) => {

        try {

            const response = await axios.get(
                `https://smazo.onrender.com/api/pdf/${item.rma_no}`
            );

            const pdfData = response.data;

            console.log("PDF DATA:", pdfData);

            if (
                !pdfData ||
                !Array.isArray(pdfData) ||
                pdfData.length === 0
            ) {

                alert("No Data Found");

                return;
            }

            const headerData = pdfData[0];

            const entryDate =
                headerData.entry_date
                    ? headerData.entry_date.substring(0, 10)
                    : "";

            const doc = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a5"
            });


            // =====================================
            // OUTER BORDER
            // =====================================

            doc.rect(5, 5, 202, 139);


            // =====================================
            // COMPANY HEADER
            // =====================================

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
                195,
                15,
                {
                    align: "right"
                }
            );


            doc.setFontSize(8);

            doc.text(
                "3A/1, Aanoor Amman Complex, Veerabathara Road, Veerappan Chattram, Erode,Tamilnadu - 638011, Email: sales@smazoindia.com",
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


            // =====================================
            // MINI HEADER FOR MULTIPLE PAGES
            // =====================================

            const drawMiniHeader = () => {

                doc.setFontSize(10);
                doc.setFont(undefined, "bold");

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


            // =====================================
            // CUSTOMER BOX
            // =====================================

            doc.rect(
                13,
                35,
                182,
                55
            );


            doc.setFontSize(9);
            doc.setFont(undefined, "bold");

            doc.text(
                `RMA No : ${headerData.rma_no || ""}`,
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


            const address =
                doc.splitTextToSize(
                    `Address : ${headerData.address || ""}`,
                    160
                );

            doc.text(
                address,
                18,
                78
            );


            // =====================================
            // RMA PRODUCT TABLE
            // =====================================

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

                        const previousRow =
                            pdfData[index - 1];

                        const showQty =
                            index === 0 ||
                            !previousRow ||
                            previousRow.product_name !==
                                row.product_name ||
                            previousRow.model_number !==
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

                didDrawPage: function (tableData) {

                    if (
                        tableData.pageNumber > 1
                    ) {

                        drawMiniHeader();

                    }

                },

                styles: {

                    fontSize: 8,

                    halign: "center",

                    valign: "middle"

                },

                headStyles: {

                    fillColor: [
                        220,
                        220,
                        220
                    ],

                    textColor: [
                        0,
                        0,
                        0
                    ]

                }

            });


            // =====================================
            // SIGNATURE
            // =====================================

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


            // =====================================
            // PAGE NUMBER
            // =====================================

            const totalPages =
                doc.internal.getNumberOfPages();


            for (
                let page = 1;
                page <= totalPages;
                page++
            ) {

                doc.setPage(page);

                const pageWidth =
                    doc.internal.pageSize.getWidth();

                const pageHeight =
                    doc.internal.pageSize.getHeight();

                doc.setFontSize(8);

                doc.setTextColor(100);

                doc.text(
                    `Page ${page} of ${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 5,
                    {
                        align: "center"
                    }
                );

            }


            // =====================================
            // SAVE
            // =====================================

            doc.save(
                `RMA_${item.rma_no}.pdf`
            );

        } catch (error) {

            console.log(
                "PDF ERROR:",
                error
            );

            alert("PDF generation failed");

        }

    };


    // =========================================
    // WHATSAPP
    // =========================================

    const shareWhatsApp = (item) => {

        const message = `
RMA Details

RMA No: ${item.rma_no}
Product Name: ${item.product_name}
Model Number: ${item.model_number}
Quantity: ${item.quantity_no}
Serial No: ${item.serial_no || ""}
Accessory: ${item.accessory || ""}
Customer DC No: ${item.customer_dc_no || ""}
Reminder Date: ${item.reminder_date || ""}
`;

        const whatsappUrl =
            `https://wa.me/?text=${encodeURIComponent(message)}`;

        window.open(
            whatsappUrl,
            "_blank"
        );

    };


    // =========================================
    // SEARCH + SORT
    // =========================================

    const filteredData =
        [...data]
            .filter((item) => {

                const searchText =
                    search.toLowerCase();

                return (

                    item.customer_name
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    item.company_name
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    item.product_name
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    item.model_number
                        ?.toLowerCase()
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


    // =========================================
    // RETURN
    // =========================================

    return (

        <div className="top-btns">

            {/* =================================
                TOP BUTTONS
            ================================= */}

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


            {/* =================================
                RMA TABLE
            ================================= */}

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

                        <th>status</th>

                        <th>Summary</th>

                        <th>Action</th>

                        <th>View</th>

                        <th>Share</th>

                    </tr>

                </thead>


                <tbody>

                    {filteredData.map(
                        (item) => {

                            const isCompleted =
                                item.status
                                    ?.trim()
                                    .toLowerCase() ===
                                "completed";


                            return (

                                <tr
                                    key={item.id}
                                >

                                    {/* RMA NO */}

                                    <td
                                        className={
                                            isCompleted
                                                ? "rma-completed"
                                                : "rma-pending"
                                        }
                                    >
                                        {item.rma_no}
                                    </td>


                                    <td>
                                        {item.customer_name}
                                    </td>


                                    <td>
                                        {item.product_name}
                                    </td>


                                    <td>
                                        {item.model_number}
                                    </td>


                                    <td>
                                        {item.quantity_no}
                                    </td>


                                    <td>
                                        {item.status}
                                    </td>


                                    <td>

                                        {item.entry_date
                                            ? new Date(
                                                item.entry_date
                                            ).toLocaleDateString(
                                                "en-GB"
                                            )
                                            : "-"
                                        }

                                    </td>


                                    <td>
                                        {item.status}
                                    </td>


                                    {/* SUMMARY */}

                                    <td>

                                        <button
                                            type="button"
                                            className="view-btn"
                                            onClick={() =>
                                                setSelectedRmaNo(
                                                    item.rma_no
                                                )
                                            }
                                        >
                                            View
                                        </button>

                                    </td>


                                    {/* ACTION */}

                                    <td>

                                        <Link
                                            to={`/update-rma1/${item.rma_no}`}
                                        >

                                            <button
                                                type="button"
                                                className="edit-btn"
                                            >
                                                Edit
                                            </button>

                                        </Link>


                                        <button
                                            type="button"
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


                                    {/* PDF */}

                                    <td>

                                        <button
                                            type="button"
                                            className="view-btn"
                                            onClick={() =>
                                                generatePDF(item)
                                            }
                                        >
                                            Pdf
                                        </button>

                                    </td>


                                    {/* WHATSAPP */}

                                    <td>

                                        <button
                                            type="button"
                                            className="share-btn"
                                            onClick={() =>
                                                shareWhatsApp(
                                                    item
                                                )
                                            }
                                        >
                                            WhatsApp
                                        </button>

                                    </td>

                                </tr>

                            );

                        }
                    )}

                </tbody>

            </table>


            {/* =========================================
                RMA DETAILS BELOW TABLE
            ========================================= */}

            {selectedRmaNo && (

                <div className="rma-details-below">

                    <RMADetails
                        rma_no={selectedRmaNo}
                        onClose={() =>
                            setSelectedRmaNo(null)
                        }
                    />

                </div>

            )}

        </div>

    );

};

export default Homel;