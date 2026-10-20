
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./Reminder.css";
import { useNavigate } from "react-router-dom";

const API = "https://smazo.onrender.com/api/reminders";

const DEFAULT_REPEAT_MINUTES = 15;

const getRows = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;

    return [];
};

const getLocalDateString = (timestamp) => {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getTimeOptions = (selectedDate, timestamp) => {
    const now = new Date(timestamp);
    const today = getLocalDateString(timestamp);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const options = [];

    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
            const totalMinutes = hour * 60 + minute;

            if (selectedDate === today && totalMinutes <= currentMinutes) {
                continue;
            }

            const value =
                `${String(hour).padStart(2, "0")}:` +
                `${String(minute).padStart(2, "0")}`;

            options.push({
                value,
                label: value,
            });
        }
    }

    return options;
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

const formatCountdown = (seconds) => {
    const safe = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safe / 60);
    const remainingSeconds = safe % 60;

    return (
        `${String(minutes).padStart(2, "0")}:` +
        `${String(remainingSeconds).padStart(2, "0")}`
    );
};

const getReminderId = (reminder) =>
    reminder.id ?? reminder.reminder_id;

const getReminderStatus = (reminder) =>
    String(reminder.status || "Pending").toLowerCase();

const getReminderDateTime = (reminder) => {
    const date = formatDate(reminder.reminder_date);
    const time = formatTime(reminder.reminder_time);

    if (date === "-" || time === "-") return null;

    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute, 0).getTime();
};

const getCountdownSeconds = (reminder, now) => {
    const repeatMinutes =
        Number(reminder.repeat_minutes) || DEFAULT_REPEAT_MINUTES;

    if (reminder.started_at) {
        const startedAt = new Date(reminder.started_at).getTime();

        if (!Number.isNaN(startedAt)) {
            const endTime = startedAt + repeatMinutes * 60 * 1000;

            return Math.max(0, Math.ceil((endTime - now) / 1000));
        }
    }

    const scheduledTime = getReminderDateTime(reminder);

    if (scheduledTime === null) {
        return repeatMinutes * 60;
    }

    const endTime = scheduledTime + repeatMinutes * 60 * 1000;

    return Math.max(0, Math.ceil((endTime - now) / 1000));
};

function Reminder() {
    const [customerName, setCustomerName] = useState("");
    const [note, setNote] = useState("");
    const [reminderDate, setReminderDate] = useState(
        getLocalDateString(Date.now())
    );
    const [reminderTime, setReminderTime] = useState("");
    const [repeatMinutes, setRepeatMinutes] = useState("15");

    const [reminders, setReminders] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingCustomer, setDeletingCustomer] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Navigation state added
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    const timeOptions = getTimeOptions(reminderDate, currentTime);

    const loadReminders = useCallback(async () => {
        try {
            setLoading(true);

            const response = await axios.get(API);
            setReminders(getRows(response));
            setError("");
        } catch (err) {
            console.error("Failed to load reminders:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load reminders. Please check the backend API."
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

    useEffect(() => {
        if (!reminderDate) {
            setReminderTime("");
            return;
        }

        const availableTimes = getTimeOptions(reminderDate, currentTime);

        const isStillAvailable = availableTimes.some(
            (option) => option.value === reminderTime
        );

        if (reminderTime && !isStillAvailable) {
            setReminderTime("");
        }
    }, [reminderDate, reminderTime, currentTime]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const name = customerName.trim();
        const reminderNote = note.trim();
        const interval = Number(repeatMinutes);

        if (!name || !reminderNote || !reminderDate || !reminderTime) {
            setError("Please fill in all fields.");
            return;
        }

        if (!Number.isInteger(interval) || interval < 1) {
            setError("Repeat interval must be at least 1 minute.");
            return;
        }

        const selectedDateTime = new Date(
            `${reminderDate}T${reminderTime}:00`
        ).getTime();

        if (
            !Number.isFinite(selectedDateTime) ||
            selectedDateTime <= Date.now()
        ) {
            setError("Please select a future date and time.");
            setReminderTime("");
            return;
        }

        const validSlot = getTimeOptions(
            reminderDate,
            Date.now()
        ).some((option) => option.value === reminderTime);

        if (!validSlot) {
            setError("The selected time slot is no longer valid.");
            setReminderTime("");
            return;
        }

        try {
            setSaving(true);

            await axios.post(API, {
                customer_name: name,
                note: reminderNote,
                reminder_date: reminderDate,
                reminder_time: reminderTime,
                repeat_minutes: interval,
            });

            setSuccess("Reminder added successfully.");
            setShowForm(false);

            setCustomerName("");
            setNote("");
            setReminderDate(getLocalDateString(Date.now()));
            setReminderTime("");
            setRepeatMinutes("15");

            await loadReminders();
        } catch (err) {
            console.error("Failed to add reminder:", err);

            setError(
                err.response?.data?.message ||
                "Failed to save reminder. Please check the backend."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDone = async (id) => {
        if (!window.confirm("Mark this reminder as completed?")) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            await axios.post(`${API}/${id}/done`);

            setSuccess("Reminder completed successfully.");
            await loadReminders();
        } catch (err) {
            console.error("Failed to complete reminder:", err);

            setError(
                err.response?.data?.message ||
                "Failed to complete reminder."
            );
        }
    };

    const handleDeleteCustomer = async (customer, customerReminders) => {
        if (
            !window.confirm(
                `Delete all reminders for ${customer}?`
            )
        ) {
            return;
        }

        setError("");
        setSuccess("");
        setDeletingCustomer(customer);

        try {
            for (const reminder of customerReminders) {
                const id = getReminderId(reminder);

                if (id !== undefined && id !== null) {
                    await axios.delete(`${API}/${id}`);
                }
            }

            setSuccess(`Reminders for ${customer} deleted successfully.`);
            await loadReminders();
        } catch (err) {
            console.error("Failed to delete reminders:", err);

            setError(
                err.response?.data?.message ||
                "Failed to delete reminders."
            );

            await loadReminders();
        } finally {
            setDeletingCustomer("");
        }
    };

    const handleAddForCustomer = (customer) => {
        setShowForm(true);
        setCustomerName(customer);
        setReminderDate(getLocalDateString(Date.now()));
        setReminderTime("");
        setNote("");
        setSuccess("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const customerGroups = Object.values(
        reminders.reduce((groups, reminder) => {
            const customer =
                String(reminder.customer_name || "").trim() ||
                "Unknown Customer";

            if (!groups[customer]) {
                groups[customer] = {
                    customer,
                    reminders: [],
                };
            }

            groups[customer].reminders.push(reminder);

            return groups;
        }, {})
    ).sort((a, b) => a.customer.localeCompare(b.customer));

    const activeReminders = reminders.filter(
        (reminder) => getReminderStatus(reminder) === "active"
    );

    const pendingReminders = reminders.filter(
        (reminder) => getReminderStatus(reminder) === "pending"
    );

    const completedReminders = reminders.filter(
        (reminder) => getReminderStatus(reminder) === "completed"
    );

    return (
        <div className="reminder-page">
            <div className="reminder-header">
                <h1>RMA Reminder</h1>
                <p>Manage customer reminders and follow-ups.</p>

                {!showForm && (
                    <button
                        type="button"
                        className="reminder-submit-btn"
                        onClick={() => setShowForm(true)}
                    >
                        + Add Reminder
                    </button>
                )}
            </div>

            {error && (
                <div className="reminder-message reminder-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="reminder-message reminder-success">
                    {success}
                </div>
            )}

            {showForm && (
                <section className="reminder-form-card">
                    <h2>Add Reminder</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="reminder-field">
                            <label htmlFor="customerName">Customer Name</label>
                            <input
                                id="customerName"
                                type="text"
                                value={customerName}
                                onChange={(event) =>
                                    setCustomerName(event.target.value)
                                }
                                placeholder="Enter customer name"
                                required
                            />
                        </div>

                        <div className="reminder-field">
                            <label htmlFor="reminderNote">Note</label>
                            <textarea
                                id="reminderNote"
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                placeholder="Enter reminder note"
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
                                    min={getLocalDateString(currentTime)}
                                    value={reminderDate}
                                    onChange={(event) => {
                                        setReminderDate(event.target.value);
                                        setReminderTime("");
                                    }}
                                    required
                                />
                            </div>

                            <div className="reminder-field">
                                <label htmlFor="reminderTime">
                                    Reminder Time (24-hour format)
                                </label>

                                <select
                                    id="reminderTime"
                                    value={reminderTime}
                                    onChange={(event) =>
                                        setReminderTime(event.target.value)
                                    }
                                    required
                                >
                                    <option value="">Select Time</option>

                                    {timeOptions.map((time) => (
                                        <option
                                            key={time.value}
                                            value={time.value}
                                        >
                                            {time.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="reminder-field">
                            <label htmlFor="repeatMinutes">
                                Repeat Interval (minutes)
                            </label>

                            <input
                                id="repeatMinutes"
                                type="number"
                                min="1"
                                step="1"
                                value={repeatMinutes}
                                onChange={(event) =>
                                    setRepeatMinutes(event.target.value)
                                }
                                required
                            />

                            <p className="reminder-hint">
                                Set the repeat interval in minutes. Default: 15 minutes.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="reminder-submit-btn"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Add Reminder"}
                        </button>

                        <button
                            type="button"
                            className="reminder-add-btn"
                            onClick={() => setShowForm(false)}
                        >
                            Back to Reminders
                        </button>
                    </form>
                </section>
            )}

            <section className="reminder-summary">
                <div className="reminder-summary-card">
                    <span>Pending</span>
                    <strong>{pendingReminders.length}</strong>
                </div>

                <div className="reminder-summary-card">
                    <span>Active</span>
                    <strong>{activeReminders.length}</strong>
                </div>

                <div className="reminder-summary-card">
                    <span>Completed</span>
                    <strong>{completedReminders.length}</strong>
                </div>
            </section>

            <section className="reminder-section">
                <h2>Active Reminders</h2>

                {activeReminders.length === 0 ? (
                    <p className="reminder-empty">
                        No active reminders.
                    </p>
                ) : (
                    <div className="active-reminders-list">
                        {activeReminders.map((reminder) => {
                            const id = getReminderId(reminder);
                            const remainingSeconds =
                                getCountdownSeconds(reminder, currentTime);

                            return (
                                <div
                                    className="active-reminder-card"
                                    key={id}
                                >
                                    <div className="active-reminder-details">
                                        <h3>{reminder.customer_name}</h3>
                                        <p>
                                            {reminder.note || reminder.notes}
                                        </p>

                                        <p>
                                            Date:{" "}
                                            {formatDate(reminder.reminder_date)}
                                        </p>

                                        <p>
                                            Time:{" "}
                                            {formatTime(reminder.reminder_time)}
                                        </p>
                                    </div>

                                    <div className="active-reminder-timer">
                                        <span>Time Remaining</span>

                                        <strong>
                                            {formatCountdown(remainingSeconds)}
                                        </strong>

                                        <button
                                            type="button"
                                            className="reminder-done-btn"
                                            onClick={() => handleDone(id)}
                                        >
                                            ✓ Done
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="reminder-section">
                <h2>Customer Groups</h2>

                {loading && reminders.length === 0 ? (
                    <p>Loading reminders...</p>
                ) : customerGroups.length === 0 ? (
                    <p className="reminder-empty">
                        No customer reminders found.
                    </p>
                ) : (
                    <div className="reminder-table-wrapper">
                        <table className="reminder-table">
                            <thead>
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Notes</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {customerGroups.map((group) => {
                                    const latestReminder = [
                                        ...group.reminders,
                                    ].sort((a, b) => {
                                        const dateA =
                                            getReminderDateTime(a) || 0;
                                        const dateB =
                                            getReminderDateTime(b) || 0;

                                        return dateB - dateA;
                                    })[0];

                                    const status = getReminderStatus(
                                        latestReminder
                                    );

                                    return (
                                        <tr key={group.customer}>
                                            <td>{group.customer}</td>

                                            <td>
                                                {latestReminder?.note ||
                                                    latestReminder?.notes ||
                                                    "-"}
                                            </td>

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
                                                        status
                                                    )}`}
                                                >
                                                    {status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        status.slice(1)}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="reminder-actions">
                                                    <button
                                                        type="button"
                                                        className="reminder-add-btn"
                                                        onClick={() =>
                                                            handleAddForCustomer(
                                                                group.customer
                                                            )
                                                        }
                                                    >
                                                        + Add
                                                    </button>

      <button
    type="button"
    onClick={() => navigate("/reminder-history")}
    className="history-btn"
>
    History
</button>

                                                    <button
                                                        type="button"
                                                        className="reminder-delete-btn"
                                                        disabled={
                                                            deletingCustomer ===
                                                            group.customer
                                                        }
                                                        onClick={() =>
                                                            handleDeleteCustomer(
                                                                group.customer,
                                                                group.reminders
                                                            )
                                                        }
                                                    >
                                                        {deletingCustomer ===
                                                        group.customer
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="reminder-section">
                <h2>Completed Reminders</h2>

                {completedReminders.length === 0 ? (
                    <p className="reminder-empty">
                        No completed reminders.
                    </p>
                ) : (
                    <div className="reminder-table-wrapper">
                        <table className="reminder-table">
                            <thead>
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Note</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {completedReminders.map((reminder) => (
                                    <tr key={getReminderId(reminder)}>
                                        <td>{reminder.customer_name}</td>
                                        <td>
                                            {reminder.note ||
                                                reminder.notes ||
                                                "-"}
                                        </td>
                                        <td>
                                            {formatDate(reminder.reminder_date)}
                                        </td>
                                        <td>
                                            {formatTime(reminder.reminder_time)}
                                        </td>
                                        <td>
                                            <span className="reminder-status completed">
                                                Completed
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Reminder;
