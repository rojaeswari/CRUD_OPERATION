import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function InwardReminders() {
    const navigate = useNavigate();

    const [reminders, setReminders] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedReminder, setSelectedReminder] = useState(null);

    const [showView, setShowView] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);

    const [status, setStatus] = useState("Pending");
    const [statusText, setStatusText] = useState("");

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

  const handleView = (item) => {
    navigate(`/rma-details_r/${item.rma_no}/${item.reminder_id}`);
};

  const handleUpdate = (item) => {
    navigate(
        `/status/${item.item_id}/${item.reminder_id}`
    );
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
                        <th>Reminder</th>
                        <th>Action</th>
                    </tr>
                </thead>


                <tbody>

                    {filteredReminders.length === 0 ? (

                        <tr>
                            <td colSpan="7" style={{ textAlign: "center" }}>
                                No Reminders Found
                            </td>
                        </tr>

                    ) : (

                        filteredReminders.map((item, index) => (

                            <tr key={item.item_id || index}>

                                <td>{index + 1}</td>

                                <td>{item.rma_no}</td>

                                <td>{item.product_name}</td>

                                <td>{item.model_number}</td>

                                <td>{item.serial_no}</td>

                                {/* Reminder */}
                                <td>
                                    {item.status_text}
                                    <br />
                                    <small>
                                        {item.updated_at
                                            ? new Date(item.updated_at).toLocaleString()
                                            : "-"}
                                    </small>
                                </td>

                                {/* Action */}
                                <td>

                                    <button
                                        className="view-btn"
                                        onClick={() => handleView(item)}
                                    >
                                        View
                                    </button>

                                    <button
                                        className="edit-btn"
                                        onClick={() => handleUpdate(item)}
                                    >
                                        Update
                                    </button>

                                </td>

                            </tr>

                        ))

                    )}

                </tbody>
            </table>
            {/* VIEW */}
            {showView && selectedReminder && (
                <div className="reminder-box">

                    <h3>Reminder Details</h3>

                    <p>
                        <strong>RMA No :</strong>{" "}
                        {selectedReminder.rma_no}
                    </p>

                    <p>
                        <strong>Product Name :</strong>{" "}
                        {selectedReminder.product_name}
                    </p>

                    <p>
                        <strong>Model Number :</strong>{" "}
                        {selectedReminder.model_number}
                    </p>

                    <p>
                        <strong>Serial No :</strong>{" "}
                        {selectedReminder.serial_no}
                    </p>

                    <p>
                        <strong>Reminder :</strong>{" "}
                        {selectedReminder.status_text}
                    </p>

                    <p>
                        <strong>Date & Time :</strong>{" "}
                        {selectedReminder.updated_at
                            ? new Date(
                                selectedReminder.updated_at
                            ).toLocaleString()
                            : "-"
                        }
                    </p>

                    <button
                        className="back-btn"
                        onClick={() =>
                            setShowView(false)
                        }
                    >
                        Close
                    </button>

                </div>
            )}


            {/* UPDATE */}
            {showUpdate && selectedReminder && (
                <div className="reminder-box">

                    <h3>Update Reminder</h3>

                    <p>
                        <strong>RMA No :</strong>{" "}
                        {selectedReminder.rma_no}
                    </p>

                    <p>
                        <strong>Product Name :</strong>{" "}
                        {selectedReminder.product_name}
                    </p>

                    <p>
                        <strong>Serial No :</strong>{" "}
                        {selectedReminder.serial_no}
                    </p>

                    <label>
                        <strong>Status</strong>
                    </label>

                    <select
                        className="form-control"
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value)
                        }
                    >
                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Completed">
                            Completed
                        </option>
                    </select>

                    <br />

                    <label>
                        <strong>Status Text</strong>
                    </label>

                    <textarea
                        className="form-control"
                        value={statusText}
                        onChange={(e) =>
                            setStatusText(e.target.value)
                        }
                        placeholder="Enter status text"
                    />

                    <br />

                    <button
                        className="save-btn"
                        onClick={() => {

                            console.log({
                                item_id:
                                    selectedReminder.item_id,
                                status,
                                status_text:
                                    statusText
                            });

                            alert("Update clicked");

                        }}
                    >
                        Save
                    </button>

                    <button
                        className="back-btn"
                        onClick={() =>
                            setShowUpdate(false)
                        }
                    >
                        Cancel
                    </button>

                </div>
            )}

        </div>
    );
}

export default InwardReminders;