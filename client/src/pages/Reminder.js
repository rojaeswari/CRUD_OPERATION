
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

const formatDate = (date) =>
    date ? String(date).slice(0, 10) : "-";

const formatTime = (time) =>
    time ? String(time).slice(0, 5) : "-";

const getStatusClass = (status) =>
    String(status || "Pending").toLowerCase().replace(/\s+/g, "-");

const formatCountdown = (seconds) => {
    if (seconds === null) return "15:00";

    const safe = Math.max(0, seconds);
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(
        safe % 60
    ).padStart(2, "0")}`;
};

function Reminder() {
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

    const [showForm, setShowForm] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [deletingCustomer, setDeletingCustomer] = useState("");

    const loadReminders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(API);
            setReminders(getRows(response));
            setError("");
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Reminders load aagala. Backend API check pannunga."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReminders();

        const refreshTimer = setInterval(loadReminders, 10000);
        const clockTimer = setInterval(
            () => setCurrentTime(Date.now()),
            1000
        );

        return () => {
            clearInterval(refreshTimer);
            clearInterval(clockTimer);
        };
    }, [loadReminders]);

    const resetForm = () => {
        setCustomerName("");
        setNote("");
        setReminderDate("");
        setReminderTime("");
        setSelectedCustomer("");
    };

    const openNewCustomerForm = () => {
        resetForm();
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openExistingCustomerForm = (name) => {
        resetForm();
        setSelectedCustomer(name);
        setCustomerName(name);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !customerName.trim() ||
            !note.trim() ||
            !reminderDate ||
            !reminderTime
        ) {
            setError("Customer name, note, date, time fill pannunga.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await axios.post(API, {
                customer_name: customerName.trim(),
                note: note.trim(),
                reminder_date: reminderDate,
                reminder_time: reminderTime,
                repeat_minutes: REMINDER_MINUTES,
            });

            const savedName = customerName.trim();
            resetForm();
            setShowForm(false);
            setSuccess(`Reminder saved for ${savedName}.`);
            await loadReminders();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Reminder save pannumbothu error vandhuchu."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDone = async (id) => {
        if (!window.confirm("Indha reminder-ai Done pannalama?")) return;

        setError("");
        setSuccess("");

        try {
            await axios.post(`${API}/${id}/done`);
            setSuccess("Reminder completed successfully.");
            await loadReminders();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Reminder complete panna mudiyala."
            );
        }
    };

    const handleDeleteCustomer = async (group) => {
        const key = group.customerName.toLowerCase();

        if (
            !window.confirm(
                `${group.customerName}-க்கு irukkum ${group.reminders.length} reminder(s)-ai delete pannalama?`
            )
        ) {
            return;
        }

        setDeletingCustomer(key);
        setError("");
        setSuccess("");

        try {
            // Backend DELETE /api/reminders/:id endpoint required.
            // Stop and show an error if any delete request fails.
            for (const reminder of group.reminders) {
                await axios.delete(`${API}/${reminder.id}`);
            }

            setSuccess(`${group.customerName} reminders deleted.`);
            await loadReminders();
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Delete API fail aachu. Backend DELETE endpoint check pannunga."
            );
            await loadReminders();
        } finally {
            setDeletingCustomer("");
        }
    };

    const getRemainingSeconds = (reminder) => {
        if (!reminder.started_at) return null;

        const started = new Date(reminder.started_at).getTime();
        if (Number.isNaN(started)) return null;

        const minutes =
            Number(reminder.repeat_minutes) || REMINDER_MINUTES;
        const end = started + minutes * 60 * 1000;

        return Math.max(
            0,
            Math.ceil((end - currentTime) / 1000)
        );
    };

    const activeReminders = reminders.filter(
        (r) => String(r.status || "").toLowerCase() === "active"
    );

    const customerGroups = Object.values(
        reminders.reduce((groups, reminder) => {
            const name = String(reminder.customer_name || "").trim();
            if (!name) return groups;

            const key = name.toLowerCase();

            if (!groups[key]) {
                groups[key] = {
                    customerName: name,
                    reminders: [],
                };
            }

            groups[key].reminders.push(reminder);
            return groups;
        }, {})
    ).sort((a, b) =>
        a.customerName.localeCompare(b.customerName)
    );

    return (
        <div className="reminder-page">
            <div className="reminder-heading">
                <div>
                    <h2>RMA Reminder</h2>
                    <p className="reminder-subtitle">
                        Manage customer follow-up reminders.
                    </p>
                </div>

                <div className="reminder-heading-actions">
                    <button
                        type="button"
                        className="reminder-add-btn"
                        onClick={openNewCustomerForm}
                    >
                        + New Customer
                    </button>

                    <button
                        type="button"
                        className="reminder-refresh-btn"
                        onClick={loadReminders}
                        disabled={loading}
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
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

            {showForm && (
                <form className="reminder-form" onSubmit={handleSubmit}>
                    <h3>
                        {selectedCustomer
                            ? `Add Reminder - ${selectedCustomer}`
                            : "Add New Customer Reminder"}
                    </h3>

                    <div className="reminder-field">
                        <label htmlFor="customerName">Customer Name</label>
                        <input
                            id="customerName"
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter customer name"
                            readOnly={Boolean(selectedCustomer)}
                            required
                        />
                    </div>

                    <div className="reminder-field">
                        <label htmlFor="reminderNote">Reminder Note</label>
                        <textarea
                            id="reminderNote"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Enter reminder note"
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
                        Reminder active aana piragu {REMINDER_MINUTES} minutes
                        kulla Done pannunga.
                    </p>

                    <div className="reminder-form-actions">
                        <button
                            type="submit"
                            className="reminder-add-btn"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "+ Add Reminder"}
                        </button>

                        <button
                            type="button"
                            className="reminder-refresh-btn"
                            disabled={saving}
                            onClick={() => {
                                setShowForm(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <section className="reminder-active-section">
                <div className="reminder-section-heading">
                    <h3>Active Reminders</h3>
                    <span className="reminder-count">
                        {activeReminders.length}
                    </span>
                </div>

                {activeReminders.length === 0 ? (
                    <div className="reminder-empty">
                        <p>No active reminders.</p>
                    </div>
                ) : (
                    activeReminders.map((reminder) => (
                        <div
                            className="reminder-active-card"
                            key={reminder.id}
                        >
                            <div className="reminder-active-top">
                                <span className="reminder-live-label">
                                    ACTIVE
                                </span>
                                <span className="reminder-timer">
                                    {formatCountdown(
                                        getRemainingSeconds(reminder)
                                    )}
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
                    ))
                )}
            </section>

            <section className="reminder-list-section">
                <div className="reminder-section-heading">
                    <h3>Customers &amp; Reminders</h3>
                    <span className="reminder-count">
                        {customerGroups.length}
                    </span>
                </div>

                <div className="reminder-table-wrapper">
                    <table className="reminder-table">
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Total Reminders</th>
                                <th>Reminder Date</th>
                                <th>Reminder Time</th>
                                <th>Latest Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customerGroups.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="reminder-no-data">
                                        {loading
                                            ? "Loading customers..."
                                            : "No customers found. Click + New Customer."}
                                    </td>
                                </tr>
                            ) : (
                                customerGroups.map((group) => {
                                    const sorted = [...group.reminders].sort(
                                        (a, b) => {
                                            const dateA = new Date(
                                                `${formatDate(a.reminder_date)}T${formatTime(a.reminder_time)}`
                                            ).getTime();

                                            const dateB = new Date(
                                                `${formatDate(b.reminder_date)}T${formatTime(b.reminder_time)}`
                                            ).getTime();

                                            return dateB - dateA;
                                        }
                                    );

                                    const latestReminder = sorted[0];
                                    const key = group.customerName.toLowerCase();

                                    return (
                                        <tr key={key}>
                                            <td className="reminder-customer-name">
                                                {group.customerName}
                                            </td>

                                            <td>{group.reminders.length}</td>

                                            <td>
                                                {formatDate(
                                                    latestReminder?.reminder_date
                                                )}
                                            </td>

                                            <td>
                                                {formatTime(
                                                    latestReminder?.reminder_time
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={`reminder-status ${getStatusClass(
                                                        latestReminder?.status
                                                    )}`}
                                                >
                                                    {latestReminder?.status || "Pending"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="reminder-action-buttons">
                                                    <button
                                                        type="button"
                                                        className="reminder-refresh-btn"
                                                        onClick={() =>
                                                            openExistingCustomerForm(
                                                                group.customerName
                                                            )
                                                        }
                                                    >
                                                        + Add
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="reminder-delete-btn"
                                                        disabled={deletingCustomer === key}
                                                        onClick={() =>
                                                            handleDeleteCustomer(group)
                                                        }
                                                    >
                                                        {deletingCustomer === key
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default Reminder;
