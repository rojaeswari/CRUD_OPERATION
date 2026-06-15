import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home_l.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Home_l = () => {

    const [data, setData] = useState([]); // MUST BE []

    useEffect(() => {
        loadData();
    }, []);

    const reminderDate =
        new Date();

    reminderDate.setDate(
        reminderDate.getDate() + 3
    );

    const formattedDate =
        reminderDate
            .toISOString()
            .split("T")[0];

    const loadData = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/get_P"
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
                `http://localhost:5000/delete-rma_r/${rma_no}`
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
                `http://localhost:5000/api/pdf/${item.id}`
            );

            const pdfData = resp.data;
            const entryDate = pdfData.entry_date.substring(0, 10);

            const doc = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4"
            });
            doc.rect(5, 5, 287, 200);

            // Company Header
            doc.setFontSize(22);
            doc.setFont(undefined, "bold");

            doc.text(
                "M K ELECTRONICS",
                105,
                15,
                { align: "center" }
            );

            doc.setFontSize(10);
            doc.setFont(undefined, "normal");

            doc.text(
                "36B, Chakra Complex, Nalli Hospital Road, Near Erode Bus Stand, Erode - 638011",
                148,
                23,
                { align: "center" }
            );

            doc.text(
                "GSTIN: 33DSEPK8530C1Z1",
                148,
                29,
                { align: "center" }
            );

            doc.text(
                "Contact: 9003838352, 9500508118, 9003866653, 9566672229",
                148,
                35,
                { align: "center" }
            );
            doc.text(
                "E-Mail:mkelectronicsservices@gmail.com",
                148,
                40,
                { align: "center" }

            );

            // RMA

            doc.rect(210, 50, 75, 40);

            doc.setFont(undefined, "bold");
            // doc.text("RMA DETAILS", 215, 58);

            doc.setFont(undefined, "normal");

            doc.text(`RMA No : ${pdfData.id}`, 215, 55);

            doc.text(
                ` Cus DC No : ${pdfData.customer_dc_no}`,
                215,
                65
            );

            doc.text(
                `Entry Date : ${entryDate}`,
                215,
                75
            );

            doc.text(
                `Staff Name : ${pdfData.staff_name || ""}`,
                215,
                85
            );

            // Customer Details Table
            // -------- Customer Details (Text Format) --------
            doc.rect(10, 50, 190, 40);
            doc.setFontSize(11);
            doc.setFont(undefined, "bold");

            doc.text("Center Details", 15, 58);

            doc.setFont(undefined, "normal");

            doc.text(
                `Customer Name : ${pdfData.customer_name || ""}`,
                15,
                68
            );
            doc.text(
                `phone : ${pdfData.phone_no || ""}`,
                110,
                68
            );
            doc.text(
                ` Email : ${pdfData.email}`,
                15,
                78
            );
            doc.text(

                `Address: ${pdfData.address}`,
                110,
                78
            );


            // RMA Details Table
            autoTable(doc, {
                startY: 95,

                theme: "grid",

                head: [[
                    "Product Name",
                    "Model No",
                    "Qty",
                    "Serial No",
                    "Accessory",
                    "Issue"
                ]],

                body: [[
                    pdfData.product_name || "",
                    pdfData.model_number || "",
                    pdfData.quantity_no || "",
                    pdfData.serial_no || "",
                    pdfData.accessory || "",
                    pdfData.issues || ""
                ]],

                styles: {
                    halign: "center",
                    valign: "middle",
                    fontSize: 10
                },

                headStyles: {
                    fillColor: [220, 220, 220],
                    textColor: [0, 0, 0]
                }
            });


            // Signature
            const finalY =
                doc.lastAutoTable
                    ? doc.lastAutoTable.finalY + 35
                    : 160;

            doc.text(
                "Customer Signature",
                20,
                finalY
            );

            doc.text(
                "Authorized Signature",
                135,
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

    return (
        <div className="top-btns">
            <div className="top-buttons">

                <Link to="/Dashboard">
                    <button className="back-btn">
                        Go Back
                    </button>
                </Link>


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
                    {data.map((item, index) => {
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
                                    <Link to={`/update-rma/${item.rma_no}`}>
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

                                {/* <td>
                                    <Link to={`/status-history_lsr/${item.id}`}>
                                        <button className="btn btn-view">
                                            View History
                                        </button>
                                    </Link>



                                </td> */}
                                {/* <td>
                                    <Link to={`/search-model/${item.model_number}`}>
                                        <button className="edit-btn">
                                            search
                                        </button>
                                    </Link>
                                </td> */}
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

export default Home_l;