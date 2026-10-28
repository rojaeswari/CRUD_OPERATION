
import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://smazo.onrender.com/api/reminder-history";

function ReminderHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const params = new URLSearchParams(window.location.search);
    const reminderId = params.get("reminderId") || "";
    const selectedCustomer = params.get("customer")?.trim() || "";

    useEffect(() => {
        const loadHistory = async () => {
            try {
                setLoading(true);
                setError("");

                const queryParams = reminderId
                    ? { reminderId }
                    : selectedCustomer
                    ? { customer: selectedCustomer }
                    : {};

                const response = await axios.get(API, {
                    params: queryParams
                });

                const rows = response.data?.data;
                setHistory(Array.isArray(rows) ? rows : []);
            } catch (err) {
                console.error("Failed to load reminder history:", err);
                setError(
                    "Failed to load history. Please check the backend API."
                );
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [reminderId, selectedCustomer]);

    const title = history.length > 0
        ? `${history[0].customer_name || "Customer"} - Reminder History`
        : reminderId
        ? "Reminder History"
        : selectedCustomer
        ? `${selectedCustomer} - Reminder History`
        : "Reminder History";

    return (
        <div style={{ padding: "24px" }}>
            <button
                type="button"
                onClick={() => window.history.back()}
            >
                ← Back to Reminders
            </button>

            <h2>{title}</h2>

            {reminderId && (
                <p>Reminder ID: {reminderId}</p>
            )}

            {loading && <p>Loading history...</p>}

            {error && <p style={{ color: "red" }}>{error}</p>}

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
                        {history.map((item) => (
                            <tr key={item.history_id ?? item.id}>
                                <td>{item.customer_name || "-"}</td>
                                <td>{item.note || "-"}</td>
                                <td>{item.event_type || "-"}</td>
                                <td>{item.details || "-"}</td>
                                <td>
                                    {item.event_time
                                        ? new Date(
                                              item.event_time
                                          ).toLocaleString()
                                        : "-"}
                                </td>
                            </tr>
                        ))}

                        {history.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        textAlign: "center",
                                        padding: "16px"
                                    }}
                                >
                                    No history records found for this reminder.
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
