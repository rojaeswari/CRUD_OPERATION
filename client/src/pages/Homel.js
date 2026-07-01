import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home_l.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Homel = () => {

    const [data, setData] = useState([]); // MUST BE []
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const reminderDate =
        new Date();

    reminderDate.setDate(
        reminderDate.getDate() + 3
    );

    // const formattedDate =
    //     reminderDate
    //         .toISOString()
    //         .split("T")[0];

    const loadData = async () => {
        try {
            const response = await axios.get(
                "https://smazo.onrender.com/api/get_P"
            );

            console.log(response.data);

            // Safety check
            setData(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {
            console.log(error);
        }
    };


    const deleteRMA = async (rma_no) => {

        if (!window.confirm("Are you sure you want to delete this RMA?")) {
            return;
        }

        try {

            await axios.delete(
                `https://smazo.onrender.com/delete-rma_r/${rma_no}`
            );

            alert("Deleted Successfully");

            loadData(); // reload table

        } catch (err) {

            console.log(err);

        }

    };

    const generatePDF = async (item) => {

        try {

            const resp = await axios.get(
                `https://smazo.onrender.com/api/pdf/${item.rma_no}`
            );

            const pdfData = resp.data;

            console.log("RESP DATA:", pdfData);

            if (!pdfData || pdfData.length === 0) {
                alert("No Data Found");
                return;
            }

            const headerData = pdfData[0];
            console.log("Raw Date =", headerData.entry_date);

            const entryDate = headerData.entry_date
                ? headerData.entry_date.substring(0, 10)
                : "";




            const doc = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a5"
            });
            doc.rect(5, 5, 200, 138);

            // Company Header
            doc.setFontSize(16);
            doc.setFont(undefined, "bold");

            doc.text("SMAZO", 105, 15, {
                align: "center"
            });
            doc.setFontSize(7);
            doc.setFont(undefined, "normal");
            doc.text(
                "GSTIN: 33DSEPK8530C1Z1",
                177,
                15,
                { align: "right" }
            );

            doc.setFontSize(8);
            doc.setFont(undefined, "normal");

            doc.text(
                "36B, Chakra Complex, Nalli Hospital Road, Near Erode Bus Stand, Erode - 638011,Email: smazosecurityservices@gmail.com",
                105,
                22,
                { align: "center" }
            );

            // doc.text(
            //     "GSTIN: 33DSEPK8530C1Z1",
            //     105,
            //     27,
            //     { align: "center" }
            // );

            doc.text(
                "Contact: 9003838352, 9500508118, 9003866653",
                105,
                27,
                { align: "center" }
            );

            // doc.text(
            //     "Email: smazosecurityservices@gmail.com",
            //     105,
            //     37,
            //     { align: "center" }
            // );
            // RMA

            // doc.rect(10, 45, 120, 35);
            // doc.rect(135, 35, 60, 35);
            // doc.setFontSize(8);

            // doc.text(
            //     `RMA No : ${headerData.rma_no}`,
            //     140,
            //     45
            // );

            // doc.text(
            //     `Entry Date : ${entryDate}`,
            //     140,
            //     55
            // );

            // doc.text(
            //     `Staff Name : ${headerData.created_by_name || ""}`,
            //     140,
            //     65
            // );


            const drawMiniHeader = () => {

                doc.setFontSize(10);
                doc.setFont(undefined, "bold");

                doc.setLineWidth(0.2);
                doc.rect(5, 5, 202, 139);

                doc.text(
                    "SMAZO",
                    100,
                    9,
                    { align: "center" }
                );

                doc.setFontSize(8);
                doc.setFont(undefined, "normal");

                // Single Line
                doc.text(`Customer : ${headerData.customer_name || ""}`, 11, 12);

                doc.text(`Phone : ${headerData.phone_no || ""}`, 60, 12);

                doc.text(`RMA No : ${headerData.rma_no || ""}`, 110, 12);

                doc.text(`Entry Date : ${entryDate}`, 155, 12);

                // doc.line(10, 13, 200, 13);
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
                },


            });

            // Customer Details Table
            // -------- Customer Details (Text Format) --------
            // doc.rect(13, 35, 120, 35);
            // doc.setFontSize(10);
            // doc.setFont(undefined, "bold");

            // doc.text(
            //     "Customer Details",
            //     17,
            //     43
            // );

            // doc.setFont(undefined, "normal");
            // doc.setFontSize(8);

            // doc.text(
            //     `Customer : ${headerData.customer_name || ""}`,
            //     17,
            //     52
            // );

            // doc.text(
            //     `Phone : ${headerData.phone_no || ""}`,
            //     75,
            //     52
            // );

            // doc.text(
            //     `Email : ${headerData.email || ""}`,
            //     17,
            //     62
            // );

            // doc.text(
            //     `Address : ${headerData.address || ""}`,
            //     75,
            //     62
            // );

            // One big box
doc.rect(13, 35, 182, 55);

// Top row
doc.setFontSize(9);
doc.setFont(undefined, "bold");

doc.text(`RMA No : ${headerData.rma_no}`, 18, 43);
doc.text(`Entry Date : ${entryDate}`, 80, 43);
doc.text(`Staff : ${headerData.created_by_name || ""}`, 145, 43);

// Divider line
doc.line(13, 48, 195, 48);

// Customer Details title
doc.setFontSize(10);
doc.text("Customer Details", 18, 55);

doc.setFont(undefined, "normal");
doc.setFontSize(9);

// Left column
doc.text(`Customer : ${headerData.customer_name || ""}`, 18, 62);
doc.text(`Company : ${headerData.company_name || ""}`, 18, 70);
// const company = doc.splitTextToSize(
//     `Company : ${headerData.company_name || ""}`,
//     70
// );

// Right column
doc.text(`Phone : ${headerData.phone_no || ""}`, 105, 62);
doc.text(`Email : ${headerData.email || ""}`, 105, 70);

// Address
const address = doc.splitTextToSize(
    `Address : ${headerData.address || ""}`,
    160 // Width inside the box
);

doc.text(address, 18, 78);




            // RMA Details Table
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

                body: pdfData.map((row, index) => {
                    const prevRow = pdfData[index - 1];

                    const showQty =
                        index === 0 ||
                        !prevRow ||
                        prevRow.product_name !== row.product_name ||
                        prevRow.model_number !== row.model_number;

                    return [
                        row.product_name || "",
                        row.model_number || "",
                        showQty ? row.quantity_no : "",
                        row.serial_no || "",
                        row.accessory || "",
                        row.issues || ""
                    ];
                }),

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
            // Signature
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




            // Save PDF
            doc.save(
                `RMA_${item.id}.pdf`
            );

        } catch (err) {
            console.log(err);
        }
    };



    const shareWhatsApp = (item) => {

        const message = `
RMA Details

RMA No: ${item.id}
Product Name: ${item.product_name}
Model Number: ${item.model_number}
Quantity: ${item.quantity_no}
Serial No: ${item.serial_no}
Accessory: ${item.accessory}
Customer DC No: ${item.customer_dc_no}
Reminder Date: ${item.reminder_date}
`;

        const whatsappUrl =
            `https://wa.me/?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, "_blank");

    };


    const filteredData = data.filter((item) => {
  const searchText = search.toLowerCase();

  return (
    item.customer_name?.toLowerCase().includes(searchText) ||
    item.product_name?.toLowerCase().includes(searchText) ||
    item.model_no?.toLowerCase().includes(searchText)
  );
});

    return (
        <div className="top-btns">
            <div className="top-buttons">

                <Link to="/Dashboard">
                    <button className="back-btn">
                        Go Back
                    </button>
                </Link>

                <Link to={`/supporter`}>
                    <button className="view-btn"
                    >
                        supporter
                    </button>
                </Link>

               <input
    type="text"
    className="form-control w-40"
    placeholder="Search by Customer Name, Product Name or Model No..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />


                <Link to="/home/add">
                    <button className="add-btn">
                        Add RMA Entry
                    </button>
                </Link>

            </div>

            <table className="rma-table">
                <thead>
                    <tr>
                        <th>RMA NO</th>
                        <th>Customer Name</th>
                        <th>Product Name</th>
                        <th>Model Number</th>
                        <th>Quantity</th>
                        {/* <th>Serial No</th>
                        <th>Accessory</th> */}
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
                    {filteredData.map((item, index) => {
                        return (
                            <tr key={item.id}>
                                <td>{item.rma_no}</td>
                                <td>{item.customer_name}</td>
                                <td>{item.product_name}</td>
                                <td>{item.model_number}</td>
                                <td>{item.quantity_no}</td>
                                {/* <td>{item.serial_no}</td>
                                <td>{item.accessory}</td> */}
                                <td>{item.status}</td>

                                <td>
                                    {item.entry_date
                                        ? new Date(item.entry_date).toLocaleDateString("en-GB")
                                        : "-"}
                                </td>

                                <td>{item.status}</td>
                                <td>
                                    <Link

                                        to={`/rma-details_r/${item.rma_no}`}
                                    >
                                        View
                                    </Link>
                                </td>

                                <td>
                                    <Link to={`/update-rma1/${item.rma_no}`}>
                                        <button className="edit-btn">
                                            Edit
                                        </button>
                                    </Link>

                                    <button
                                        className="delete-btn"
                                        onClick={() =>
                                            deleteRMA(item.rma_no)
                                        }
                                    >
                                        Delete
                                    </button>




                                </td>

                               
                                <td>
                                    <button
                                        className="view-btn"
                                        onClick={() => generatePDF(item)}
                                    >
                                        View
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="share-btn"
                                        onClick={() => shareWhatsApp(item)}
                                    >
                                        WhatsApp
                                    </button>
                                </td>
                            </tr>



                        );
                    })}
                </tbody>
            </table>
        </div >
    );

}

export default Homel;