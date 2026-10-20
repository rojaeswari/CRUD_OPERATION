
import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://smazo.onrender.com/api/reminder-history";

function ReminderHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await axios.get(API);
                const rows = response.data?.data;
                setHistory(Array.isArray(rows) ? rows : []);
            } catch (err) {
                console.error("Failed to load reminder history:", err);
                setError("History load ஆகவில்லை. Backend API-ஐ சரிபார்க்கவும்.");
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, []);

    return (
        <div style={{ padding: "24px" }}>
            <button onClick={() => window.history.back()}>
                ← Back to Reminders
            </button>

            <h2>Reminder History</h2>

            {loading && <p>Loading history...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: "20px"
                    }}
                >
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Note</th>
                            <th>Event</th>
                            <th>Details</th>
                            <th>Date & Time</th>
                        </tr>
                    </thead>

                    <tbody>
                        {history.map((item) => (
                            <tr key={item.history_id ?? item.id}>
                                <td>{item.customer_name || "-"}</td>
                                <td>{item.note || "-"}</td>
                                <td>{item.event_type || "-"}</td>
                                <td>{item.details || "-"}</td>
                                <td>
                                    {item.event_time
                                        ? new Date(item.event_time).toLocaleString()
                                        : "-"}
                                </td>
                            </tr>
                        ))}

                        {history.length === 0 && (
                            <tr>
                                <td colSpan="5">
                                    History records எதுவும் இல்லை.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ReminderHistory;
