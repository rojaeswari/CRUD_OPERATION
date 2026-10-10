
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./Reminder.css";

const API = "https://smazo.onrender.com/api/reminders";
const REMINDER_MINUTES = 15;

const getRows = (response) => {
    const data = response.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;

    return [];
};

const formatDate = (date) => {
    if (!date) return "-";
    return String(date).slice(0, 10);
};

const formatTime = (time) => {
    if (!time) return "-";
    return String(time).slice(0, 5);
};

const getStatusClass = (status) => {
    return String(status || "Pending")
        .toLowerCase()
        .replace(/\s+/g, "-");
};

const Reminder = () => {
    const [customerName, setCustomerName] = useState("");
    const [note, setNote] = useState("");
    const [reminderDate, setReminderDate] = useState("");
    const [reminderTime, setReminderTime] = useState("");

    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentTime, setCurrentTime] = useState(Date.now());

    const loadReminders = useCallback(async () => {
        setLoading(true);

        try {
            const response = await axios.get(API);
            setReminders(getRows(response));
            setError("");
        } catch (err) {
            console.error("Error loading reminders:", err);
            setError(
                "Reminders load aagala. Backend server and API URL check pannunga."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReminders();

        const refreshInterval = setInterval(() => {
            loadReminders();
        }, 10000);

        const clockInterval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => {
            clearInterval(refreshInterval);
            clearInterval(clockInterval);
        };
    }, [loadReminders]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !customerName.trim() ||
            !note.trim() ||
            !reminderDate ||
            !reminderTime
        ) {
            setError("Ella fields-um fill pannunga.");
            return;
        }

        setSaving(true);

        try {
            const response = await axios.post(API, {
                customer_name: customerName.trim(),
                note: note.trim(),
                reminder_date: reminderDate,
                reminder_time: reminderTime,
                repeat_minutes: REMINDER_MINUTES,
            });

            if (response.data?.success === false) {
                throw new Error(
                    response.data.message || "Reminder save aagala."
                );
            }

            setSuccess("Reminder successfully added!");

            setCustomerName("");
            setNote("");
            setReminderDate("");
            setReminderTime("");

            await loadReminders();
        } catch (err) {
            console.error("Error saving reminder:", err);

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Reminder save pannumbodhu error vandhuchu."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDone = async (id) => {
        const confirmed = window.confirm(
            "Indha reminder-ai Done nu mark pannalama?"
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await axios.post(`${API}/${id}/done`);

            setSuccess("Reminder completed successfully!");
            await loadReminders();
        } catch (err) {
            console.error("Error completing reminder:", err);

            setError(
                err.response?.data?.message ||
                    "Reminder complete aagala. Backend endpoint check pannunga."
            );

            await loadReminders();
        }
    };

    const getRemainingSeconds = (reminder) => {
        if (!reminder.started_at) return null;

        const startedAt = new Date(reminder.started_at).getTime();

        if (Number.isNaN(startedAt)) return null;

        const deadline =
            startedAt +
            Number(reminder.repeat_minutes || REMINDER_MINUTES) * 60 * 1000;

        return Math.max(0, Math.ceil((deadline - currentTime) / 1000));
    };

    const formatCountdown = (seconds) => {
        if (seconds === null) return "15:00";

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    const activeReminders = reminders.filter(
        (reminder) =>
            String(reminder.status).toLowerCase() === "active"
    );

    const sortedReminders = [...reminders].sort((a, b) => {
        const dateA = `${a.reminder_date || ""} ${a.reminder_time || ""}`;
        const dateB = `${b.reminder_date || ""} ${b.reminder_time || ""}`;

        return dateB.localeCompare(dateA);
    });

    return (
        <div className="reminder-page">
            <div className="reminder-heading">
                <div>
                    <h2>RMA Reminder</h2>
                    <p className="reminder-subtitle">
                        Customer follow-up reminders manage pannunga.
                    </p>
                </div>

                <button
                    type="button"
                    className="reminder-refresh-btn"
                    onClick={loadReminders}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {error && (
                <div className="reminder-error" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div className="reminder-success" role="status">
                    {success}
                </div>
            )}

            <form className="reminder-form" onSubmit={handleSubmit}>
                <h3>Add New Reminder</h3>

                <div className="reminder-field">
                    <label htmlFor="customerName">Customer Name</label>
                    <input
                        id="customerName"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        required
                    />
                </div>

                <div className="reminder-field">
                    <label htmlFor="reminderNote">Reminder Note</label>
                    <textarea
                        id="reminderNote"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Enter RMA follow-up details"
                        rows={3}
                        required
                    />
                </div>

                <div className="reminder-date-time">
                    <div className="reminder-field">
                        <label htmlFor="reminderDate">Reminder Date</label>
                        <input
                            id="reminderDate"
                            type="date"
                            value={reminderDate}
                            onChange={(e) => setReminderDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="reminder-field">
                        <label htmlFor="reminderTime">Reminder Time</label>
                        <input
                            id="reminderTime"
                            type="time"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <p className="reminder-hint">
                    Reminder activate aana piragu {REMINDER_MINUTES} minutes
                    kulla Done pannunga.
                </p>

                <button
                    type="submit"
                    className="reminder-add-btn"
                    disabled={saving}
                >
                    {saving ? "Saving..." : "+ Add Reminder"}
                </button>
            </form>

            <section className="reminder-active-section">
                <div className="reminder-section-heading">
                    <h3>Active Reminders</h3>
                    <span className="reminder-count">
                        {activeReminders.length}
                    </span>
                </div>

                {activeReminders.length === 0 ? (
                    <div className="reminder-empty">
                        Ippo active reminders edhuvum illa.
                    </div>
                ) : (
                    activeReminders.map((reminder) => {
                        const seconds = getRemainingSeconds(reminder);

                        return (
                            <div
                                className="reminder-active-card"
                                key={reminder.id}
                            >
                                <div className="reminder-active-top">
                                    <span className="reminder-live-label">
                                        ACTIVE
                                    </span>

                                    <span className="reminder-timer">
                                        {formatCountdown(seconds)}
                                    </span>
                                </div>

                                <h4>{reminder.customer_name}</h4>

                                <p className="reminder-active-note">
                                    {reminder.note}
                                </p>

                                <p className="reminder-active-datetime">
                                    Date: {formatDate(reminder.reminder_date)}
                                    {" · "}
                                    Time: {formatTime(reminder.reminder_time)}
                                </p>

                                <button
                                    type="button"
                                    className="reminder-done-btn"
                                    onClick={() => handleDone(reminder.id)}
                                >
                                    ✓ Done
                                </button>
                            </div>
                        );
                    })
                )}
            </section>

            <section className="reminder-list-section">
                <div className="reminder-list-header">
                    <div>
                        <h3>All Reminders</h3>
                        <p>Reminder status and schedule details.</p>
                    </div>
                </div>

                <div className="reminder-table-wrapper">
                    <table className="reminder-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Note</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedReminders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="reminder-no-data"
                                    >
                                        {loading
                                            ? "Loading reminders..."
                                            : "No reminders found."}
                                    </td>
                                </tr>
                            ) : (
                                sortedReminders.map((reminder) => (
                                    <tr key={reminder.id}>
                                        <td className="reminder-customer-name">
                                            {reminder.customer_name}
                                        </td>

                                        <td className="reminder-note-cell">
                                            {reminder.note}
                                        </td>

                                        <td>
                                            {formatDate(reminder.reminder_date)}
                                        </td>

                                        <td>
                                            {formatTime(reminder.reminder_time)}
                                        </td>

                                        <td>
                                            <span
                                                className={`reminder-status reminder-status-${getStatusClass(
                                                    reminder.status
                                                )}`}
                                            >
                                                {reminder.status || "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Reminder;
