import React, { useEffect, useState } from "react";
import axios from "axios";

function InwardReminders() {

    const [reminders, setReminders] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const loadReminders = async () => {

        try {

            const response = await axios.get(
                "https://smazo.onrender.com/api/inward-reminders"
            );

            console.log("INWARD REMINDERS:", response.data);

            setReminders(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.log("Reminder error:", error);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        loadReminders();

    }, []);


    const filteredReminders = reminders.filter((item) => {

        const text = search.toLowerCase();

        return (
            String(item.rma_no || "")
                .toLowerCase()
                .includes(text) ||

            String(item.product_name || "")
                .toLowerCase()
                .includes(text) ||

            String(item.model_number || "")
                .toLowerCase()
                .includes(text) ||

            String(item.serial_no || "")
                .toLowerCase()
                .includes(text)
        );

    });


    if (loading) {
        return (
            <div style={{ marginTop: "150px", padding: "30px" }}>
                <h3>Loading Reminders...</h3>
            </div>
        );
    }


    return (

        <div
            style={{
                marginTop: "150px",
                padding: "30px"
            }}
        >

            <h2>🔔 RMA-Inward Reminders</h2>

            <p>
                <strong>
                    {filteredReminders.length}
                </strong>{" "}
                Reminders
            </p>


            <input
                type="text"
                placeholder="Search RMA / Product / Serial"
                value={search}
                onChange={(e) =>
                    setSearch(e.target.value)
                }
                style={{
                    width: "400px",
                    padding: "10px",
                    marginBottom: "20px"
                }}
            />


            <table className="styled-table">

                <thead>

                    <tr>

                        <th>S.No</th>

                        <th>RMA No</th>

                        <th>Product Name</th>

                        <th>Model Number</th>

                        <th>Serial No</th>

                        <th>Status</th>

                        <th>Status Text</th>

                        <th>Date & Time</th>

                    </tr>

                </thead>


                <tbody>

                    {filteredReminders.length === 0 ? (

                        <tr>

                            <td
                                colSpan="8"
                                style={{
                                    textAlign: "center"
                                }}
                            >
                                No Reminders Found
                            </td>

                        </tr>

                    ) : (

                        filteredReminders.map(
                            (item, index) => (

                                <tr key={item.id}>

                                    <td>
                                        {index + 1}
                                    </td>

                                    <td>
                                        {item.rma_no}
                                    </td>

                                    <td>
                                        {item.product_name}
                                    </td>

                                    <td>
                                        {item.model_number}
                                    </td>

                                    <td>
                                        {item.serial_no}
                                    </td>

                                    <td>
                                        {item.status}
                                    </td>

                                    <td>
                                        {item.status_text}
                                    </td>

                                    <td>
                                        {item.updated_at
                                            ? new Date(
                                                item.updated_at
                                            ).toLocaleString()
                                            : "-"
                                        }
                                    </td>

                                </tr>

                            )
                        )

                    )}

                </tbody>

            </table>

        </div>
    );
}

export default InwardReminders;