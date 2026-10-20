
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./Reminder.css";

const HISTORY_API =
    "https://smazo.onrender.com/api/reminder-history";

const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
};

const getEventClass = (event) =>
    String(event || "").toLowerCase().replace(/\s+/g, "-");

function ReminderHistory({ onBack }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");

    const loadHistory = useCallback(async () => {
        try {
            setLoading(true);

            const response = await axios.get(HISTORY_API);
            const rows = response.data?.data;

            setHistory(Array.isArray(rows) ? rows : []);
            setError("");
        } catch (err) {
            console.error("Failed to load reminder history:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load reminder history."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();

        const interval = setInterval(loadHistory, 10000);

        return () => clearInterval(interval);
    }, [loadHistory]);

    const filters = ["All", "Activated", "Missed", "Completed"];

    const filteredHistory =
        filter === "All"
            ? history
            : history.filter(
                  (item) =>
                      String(item.event_type || "").toLowerCase() ===
                      filter.toLowerCase()
              );

    return (
        <div className="reminder-page">
            <div className="reminder-header">
                <h1>Reminder History</h1>
                <p>View all reminder events and previous attempts.</p>

                <button
                    type="button"
                    className="reminder-add-btn"
                    onClick={onBack}
                >
                    ← Back to Reminders
                </button>
            </div>

            <div className="reminder-history-filters">
                {filters.map((item) => (
                    <button
                        type="button"
                        key={item}
                        className={
                            filter === item
                                ? "reminder-history-filter active"
                                : "reminder-history-filter"
                        }
                        onClick={() => setFilter(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {error && (
                <div className="reminder-message reminder-error">
                    {error}
                    <button
                        type="button"
                        className="reminder-add-btn"
                        onClick={loadHistory}
                    >
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <p>Loading reminder history...</p>
            ) : filteredHistory.length === 0 ? (
                <p className="reminder-empty">
                    No history records found.
                </p>
            ) : (
                <div className="reminder-table-wrapper">
                    <table className="reminder-table">
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
                                <tr key={item.history_id}>
                                    <td>{item.customer_name || "-"}</td>
                                    <td>{item.note || "-"}</td>
                                    <td>
                                        <span
                                            className={
                                                "reminder-status " +
                                                getEventClass(item.event_type)
                                            }
                                        >
                                            {item.event_type || "-"}
                                        </span>
                                    </td>
                                    <td>{item.details || "-"}</td>
                                    <td>
                                        {formatDateTime(item.event_time)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ReminderHistory;
