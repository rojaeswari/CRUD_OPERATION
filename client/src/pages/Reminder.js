
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./Reminder.css";

// Backend API URL
// உங்க backend வேறு port-ல் ஓடினால் 5000-ஐ மாற்றவும்.
const API = "https://smazo.onrender.com/api/reminders";

const REMINDER_MINUTES = 15;

// API response-ல் array-ஐ எடுக்க
const getRows = (response) => {
    const data = response.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;

    return [];
};

// Date format
const formatDate = (date) => {
    return date ? String(date).slice(0, 10) : "-";
};

// Time format
const formatTime = (time) => {
    return time ? String(time).slice(0, 5) : "-";
};

// Status CSS class
const getStatusClass = (status) => {
    return String(status || "Pending")
        .toLowerCase()
        .replace(/\s+/g, "-");
};

// Countdown format
const formatCountdown = (seconds) => {
    if (seconds === null || seconds === undefined) {
        return `${REMINDER_MINUTES}:00`;
    }

    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
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

    // Load reminders from backend
    const loadReminders = useCallback(async () => {
        setLoading(true);

        try {
            const response = await axios.get(API);
            setReminders(getRows(response));
            setError("");
        } catch (err) {
            console.error("Load reminders error:", err);

            setError(
                err.response?.data?.message ||
                "Reminders load aagala. Backend running-aa irukka check pannunga."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Load initially and refresh every 10 seconds
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

    // Open form for a new customer
    const openNewCustomerForm = () => {
        setSelectedCustomer("");
        setCustomerName("");
        setNote("");
        setReminderDate("");
        setReminderTime("");
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    // Open form for an existing customer
    const openExistingCustomerForm = (name) => {
        setSelectedCustomer(name);
        setCustomerName(name);
        setNote("");
        setReminderDate("");
        setReminderTime("");
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    // Save reminder
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!customerName.trim()) {
            setError("Customer name enter pannunga.");
            return;
        }

        if (!note.trim() || !reminderDate || !reminderTime) {
            setError("Note, date, time ellame fill pannunga.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

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
                    response.data?.message || "Reminder save aagala."
                );
            }

            setSuccess(
                `Reminder saved successfully for ${customerName.trim()}.`
            );

            setCustomerName("");
            setNote("");
            setReminderDate("");
            setReminderTime("");
            setSelectedCustomer("");
            setShowForm(false);

            await loadReminders();
        } catch (err) {
            console.error("Save reminder error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Reminder save pannumbothu error vandhuchu."
            );
        } finally {
            setSaving(false);
        }
    };

    // Mark active reminder as Done
    const handleDone = async (id) => {
        const confirmed = window.confirm(
            "Indha reminder-ai Done nu mark pannalama?"
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            const response = await axios.post(`${API}/${id}/done`);

            if (response.data?.success === false) {
                throw new Error(
                    response.data?.message || "Reminder complete aagala."
                );
            }

            setSuccess("Reminder completed successfully.");
            await loadReminders();
        } catch (err) {
            console.error("Complete reminder error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Reminder complete pannumbothu error vandhuchu."
            );
        }
    };

    // Countdown calculation
    const getRemainingSeconds = (reminder) => {
        if (!reminder.started_at) {
            return null;
        }

        const startedAt = new Date(reminder.started_at).getTime();

        if (Number.isNaN(startedAt)) {
            return null;
        }

        const duration =
            Number(reminder.repeat_minutes) || REMINDER_MINUTES;

        const endTime = startedAt + duration * 60 * 1000;

        return Math.max(
            0,
            Math.ceil((endTime - currentTime) / 1000)
        );
    };

    // Active reminders
    const activeReminders = reminders
        .filter(
            (reminder) =>
                String(reminder.status || "").toLowerCase() === "active"
        )
        .sort((a, b) => {
            return (
                new Date(a.started_at || 0).getTime() -
                new Date(b.started_at || 0).getTime()
            );
        });

    // Group reminders by customer name
    // Same customer name appears only once in the customer list.
    const customerGroups = Object.values(
        reminders.reduce((groups, reminder) => {
            const name = String(
                reminder.customer_name || ""
            ).trim();

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
            {/* Heading and buttons */}
            <div className="reminder-heading">
                <div>
                    <h2>RMA Reminder</h2>
                    <p className="reminder-subtitle">
                        {/* Manage customer follow-up reminders. */}
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

            {/* Error and success messages */}
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

            {/* Add reminder form */}
            {showForm && (
                <form
                    className="reminder-form"
                    onSubmit={handleSubmit}
                >
                    <h3>
                        {selectedCustomer
                            ? `Add Reminder - ${selectedCustomer}`
                            : "Add New Customer Reminder"}
                    </h3>

                    <div className="reminder-field">
                        <label htmlFor="customerName">
                            Customer Name
                        </label>

                        <input
                            id="customerName"
                            type="text"
                            value={customerName}
                            onChange={(e) =>
                                setCustomerName(e.target.value)
                            }
                            placeholder="Enter customer name"
                            readOnly={Boolean(selectedCustomer)}
                            required
                        />
                    </div>

                    <div className="reminder-field">
                        <label htmlFor="reminderNote">
                            Reminder Note
                        </label>

                        <textarea
                            id="reminderNote"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Enter the reminder note"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="reminder-date-time">
                        <div className="reminder-field">
                            <label htmlFor="reminderDate">
                                Reminder Date
                            </label>

                            <input
                                id="reminderDate"
                                type="date"
                                value={reminderDate}
                                onChange={(e) =>
                                    setReminderDate(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="reminder-field">
                            <label htmlFor="reminderTime">
                                Reminder Time
                            </label>

                            <input
                                id="reminderTime"
                                type="time"
                                value={reminderTime}
                                onChange={(e) =>
                                    setReminderTime(e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    <p className="reminder-hint">
                        Reminder activate aana piragu{" "}
                        {REMINDER_MINUTES} minutes kulla Done
                        pannunga.
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
                            onClick={() => {
                                setShowForm(false);
                                setSelectedCustomer("");
                                setError("");
                            }}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Active reminders */}
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

            {/* Customer list: one row per customer */}
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
                                <th>Latest Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customerGroups.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="reminder-no-data"
                                    >
                                        {loading
                                            ? "Loading customers..."
                                            : "No customers found. Click + New Customer to add one."}
                                    </td>
                                </tr>
                            ) : (
                                customerGroups.map((group) => {
                                    const latestReminder = [
                                        ...group.reminders,
                                    ].sort((a, b) => {
                                        const dateA = new Date(
                                            `${formatDate(a.reminder_date)}T${formatTime(a.reminder_time)}`
                                        ).getTime();

                                        const dateB = new Date(
                                            `${formatDate(b.reminder_date)}T${formatTime(b.reminder_time)}`
                                        ).getTime();

                                        return dateB - dateA;
                                    })[0];

                                    return (
                                        <tr
                                            key={group.customerName.toLowerCase()}
                                        >
                                            <td className="reminder-customer-name">
                                                {group.customerName}
                                            </td>

                                            <td>
                                                {group.reminders.length}
                                            </td>

                                            <td>
                                                <span
                                                    className={`reminder-status ${getStatusClass(
                                                        latestReminder?.status
                                                    )}`}
                                                >
                                                    {latestReminder?.status ||
                                                        "Pending"}
                                                </span>
                                            </td>

                                            <td>
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
