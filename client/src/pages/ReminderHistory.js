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
                setError("Failed to load history. Please check the backend API.");
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, []);

    // Filter history using the customer name in the URL
    const params = new URLSearchParams(window.location.search);
    const selectedCustomer = params.get("customer");

    const filteredHistory = selectedCustomer
        ? history.filter(
              (item) =>
                  String(item.customer_name || "").trim().toLowerCase() ===
                  selectedCustomer.trim().toLowerCase()
          )
        : history;

    return (
        <div style={{ padding: "24px" }}>
            <button onClick={() => window.history.back()}>
                ← Back to Reminders
            </button>

            <h2>
                {selectedCustomer
                    ? `${selectedCustomer} - Reminder History`
                    : "Reminder History"}
            </h2>

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
                            <th>Date &amp; Time</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredHistory.map((item) => (
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

                        {filteredHistory.length === 0 && (
                            <tr>
                                <td colSpan="5">
                                    No history records found for this customer.
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