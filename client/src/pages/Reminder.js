// Reminder.js

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Reminder.css";

const API = "https://smazo.onrender.com/api/reminders";
const DEFAULT_REPEAT_MINUTES = 15;

const getRows = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.reminders)) return data.reminders;

    return [];
};

const getLocalDateString = (timestamp = Date.now()) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10);
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatTime = (value) => {
    if (!value) return "-";

    const time = String(value).slice(0, 5);
    const [hours, minutes] = time.split(":").map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const getReminderId = (reminder) =>
    reminder?.id ?? reminder?.reminder_id ?? reminder?.reminderId;

const getReminderStatus = (reminder) =>
    String(reminder?.status || "pending").trim().toLowerCase();

const getReminderDateTime = (reminder) => {
    const date = String(reminder?.reminder_date || "").slice(0, 10);
    const time = String(reminder?.reminder_time || "00:00").slice(0, 8);

    if (!date) return null;

    const parsed = new Date(`${date}T${time}`);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatCountdown = (seconds) => {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};

const getErrorMessage = (error) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again.";

function Reminder() {
    const [customerName, setCustomerName] = useState("");
    const [note, setNote] = useState("");
    const [reminderDate, setReminderDate] = useState(
        getLocalDateString(Date.now())
    );
    const [reminderTime, setReminderTime] = useState("");
    const [repeatMinutes, setRepeatMinutes] = useState(
        String(DEFAULT_REPEAT_MINUTES)
    );

    const [reminders, setReminders] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingCustomer, setDeletingCustomer] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);

    // Load reminders from the existing backend API.
    const loadReminders = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);

        try {
            const response = await axios.get(API);
            setReminders(getRows(response));
            setError("");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            if (showLoader) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReminders(true);

        // Automatically refresh the dashboard data.
        const refreshInterval = setInterval(() => {
            loadReminders(false);
        }, 10000);

        // Update countdowns once per second.
        const clockInterval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => {
            clearInterval(refreshInterval);
            clearInterval(clockInterval);
        };
    }, [loadReminders]);

    const timeOptions = useMemo(() => {
        if (!reminderDate) return [];

        const options = [];
        const now = new Date(currentTime);
        const today = getLocalDateString(currentTime);

        for (let totalMinutes = 0; totalMinutes < 24 * 60; totalMinutes += 10) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const value = `${String(hours).padStart(2, "0")}:${String(
                minutes
            ).padStart(2, "0")}`;

            const optionDate = new Date(
                `${reminderDate}T${value}:00`
            );

            if (
                reminderDate === today &&
                optionDate.getTime() <= now.getTime()
            ) {
                continue;
            }

            options.push({
                value,
                label: formatTime(value),
            });
        }

        return options;
    }, [reminderDate, currentTime]);

    // Clear a selected time if it is no longer in the future.
    useEffect(() => {
        if (!reminderTime || !reminderDate) return;

        const selectedDateTime = new Date(
            `${reminderDate}T${reminderTime}:00`
        );

        if (selectedDateTime.getTime() <= currentTime) {
            setReminderTime("");
        }
    }, [currentTime, reminderDate, reminderTime]);

    const resetForm = (name = "") => {
        setCustomerName(name);
        setNote("");
        setReminderDate(getLocalDateString(Date.now()));
        setReminderTime("");
        setRepeatMinutes(String(DEFAULT_REPEAT_MINUTES));
    };

    const openNewReminderForm = () => {
        resetForm();
        setError("");
        setSuccess("");
        setShowAddForm(true);
    };

    const handleAddForCustomer = (customer) => {
        resetForm(customer);
        setError("");
        setSuccess("");
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelForm = () => {
        setShowAddForm(false);
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const name = customerName.trim();
        const reminderNote = note.trim();
        const interval = Number(repeatMinutes);

        if (!name || !reminderNote || !reminderDate || !reminderTime) {
            setError("Please fill in all required fields.");
            return;
        }

        if (!Number.isInteger(interval) || interval < 1) {
            setError("Repeat minutes must be at least 1.");
            return;
        }

        const scheduledDateTime = new Date(
            `${reminderDate}T${reminderTime}:00`
        );

        if (
            Number.isNaN(scheduledDateTime.getTime()) ||
            scheduledDateTime.getTime() <= Date.now()
        ) {
            setError("Please select a future date and time.");
            return;
        }

        setSaving(true);

        try {
            await axios.post(API, {
                customer_name: name,
                note: reminderNote,
                reminder_date: reminderDate,
                reminder_time: reminderTime,
                repeat_minutes: interval,
            });

            await loadReminders(false);

            setShowAddForm(false);
            resetForm();
            setSuccess("Reminder added successfully.");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDone = async (id) => {
        if (!id) {
            setError("Reminder ID is missing.");
            return;
        }

        if (!window.confirm("Mark this reminder as Done?")) return;

        setError("");
        setSuccess("");

        try {
            await axios.post(`${API}/${id}/done`);
            await loadReminders(false);
            setSuccess("Reminder completed successfully.");
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleDeleteCustomer = async (customer, customerReminders) => {
        if (
            !window.confirm(
                `Delete all reminders for ${customer}? This action cannot be undone.`
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

            await loadReminders(false);
            setSuccess(`Reminders for ${customer} deleted successfully.`);
        } catch (err) {
            setError(getErrorMessage(err));
            await loadReminders(false);
        } finally {
            setDeletingCustomer("");
        }
    };

    const customerGroups = useMemo(() => {
        const groups = new Map();

        reminders.forEach((reminder) => {
            const customer = String(
                reminder?.customer_name || "Unknown Customer"
            ).trim();

            if (!groups.has(customer)) {
                groups.set(customer, []);
            }

            groups.get(customer).push(reminder);
        });

        return Array.from(groups.entries())
            .map(([customer, items]) => {
                const sorted = [...items].sort((a, b) => {
                    const dateA = getReminderDateTime(a)?.getTime() || 0;
                    const dateB = getReminderDateTime(b)?.getTime() || 0;
                    return dateB - dateA;
                });

                return {
                    customer,
                    items: sorted,
                    latest: sorted[0],
                    notes: sorted
                        .map((item) => item.note || item.notes)
                        .filter(Boolean)
                        .join(", "),
                };
            })
            .sort((a, b) => a.customer.localeCompare(b.customer));
    }, [reminders]);

    const activeReminders = useMemo(
        () =>
            reminders.filter((reminder) => {
                const status = getReminderStatus(reminder);
                return status === "active";
            }),
        [reminders]
    );

    const pendingReminders = useMemo(
        () =>
            reminders.filter((reminder) => {
                const status = getReminderStatus(reminder);
                return status === "pending";
            }),
        [reminders]
    );

    const completedReminders = useMemo(
        () =>
            reminders.filter((reminder) => {
                const status = getReminderStatus(reminder);
                return ["completed", "done"].includes(status);
            }),
        [reminders]
    );

    const getCountdown = (reminder) => {
        const startTime = getReminderDateTime(reminder);

        if (!startTime) return 0;

        const repeat = Number(
            reminder?.repeat_minutes || DEFAULT_REPEAT_MINUTES
        );

        const endTime = startTime.getTime() + repeat * 60 * 1000;

        return Math.max(0, Math.ceil((endTime - currentTime) / 1000));
    };

    return (
        <div className="reminder-page">
            <div className="reminder-header">
                <div>
                    <h1>RMA Reminder</h1>
                    <p>Manage customer reminders and follow-ups.</p>
                </div>

                {!showAddForm && (
                    <button
                        type="button"
                        className="reminder-header-add-btn"
                        onClick={openNewReminderForm}
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

            {/* ADD REMINDER VIEW */}
            {showAddForm && (
                <section className="reminder-form-card">
                    <h2>Add Reminder</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="reminder-field">
                            <label htmlFor="customerName">
                                Customer Name
                            </label>
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
                            <label htmlFor="note">Note</label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(event) =>
                                    setNote(event.target.value)
                                }
                                placeholder="Enter reminder note"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="reminder-date-time">
                            <div className="reminder-field">
                                <label htmlFor="reminderDate">Date</label>
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
                                <label htmlFor="reminderTime">Time</label>
                                <select
                                    id="reminderTime"
                                    value={reminderTime}
                                    onChange={(event) =>
                                        setReminderTime(event.target.value)
                                    }
                                    required
                                >
                                    <option value="">Select time</option>

                                    {timeOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="reminder-field">
                            <label htmlFor="repeatMinutes">
                                Reminder Duration (Minutes)
                            </label>
                            <input
                                id="repeatMinutes"
                                type="number"
                                min="1"
                                value={repeatMinutes}
                                onChange={(event) =>
                                    setRepeatMinutes(event.target.value)
                                }
                                required
                            />
                            <p className="reminder-hint">
                                Default duration is 15 minutes.
                            </p>
                        </div>

                        <div className="reminder-form-actions">
                            <button
                                type="button"
                                className="reminder-cancel-btn"
                                onClick={handleCancelForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="reminder-submit-btn"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Reminder"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* DASHBOARD VIEW */}
            {!showAddForm && (
                <>
                    <div className="reminder-summary">
                        <div className="reminder-summary-card">
                            <span>Total Reminders</span>
                            <strong>{reminders.length}</strong>
                        </div>

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
                    </div>

                    {/* ACTIVE REMINDERS */}
                    <section className="reminder-section">
                        <h2>Active Reminders</h2>

                        {loading ? (
                            <p className="reminder-empty">
                                Loading reminders...
                            </p>
                        ) : activeReminders.length === 0 ? (
                            <p className="reminder-empty">
                                No active reminders right now.
                            </p>
                        ) : (
                            <div className="active-reminders-list">
                                {activeReminders.map((reminder, index) => {
                                    const id = getReminderId(reminder);
                                    const countdown = getCountdown(reminder);

                                    return (
                                        <div
                                            className="active-reminder-card"
                                            key={id ?? index}
                                        >
                                            <div className="active-reminder-details">
                                                <h3>
                                                    {reminder.customer_name}
                                                </h3>
                                                <p>
                                                    {reminder.note ||
                                                        reminder.notes ||
                                                        "-"}
                                                </p>
                                                <span>
                                                    {formatDate(
                                                        reminder.reminder_date
                                                    )}{" "}
                                                    ·{" "}
                                                    {formatTime(
                                                        reminder.reminder_time
                                                    )}
                                                </span>
                                            </div>

                                            <div className="active-reminder-timer">
                                                <span>Time remaining</span>
                                                <strong
                                                    className={
                                                        countdown <= 60
                                                            ? "timer-warning"
                                                            : ""
                                                    }
                                                >
                                                    {formatCountdown(countdown)}
                                                </strong>
                                            </div>

                                            <button
                                                type="button"
                                                className="reminder-done-btn"
                                                onClick={() =>
                                                    handleDone(id)
                                                }
                                            >
                                                ✓ Done
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* CUSTOMER GROUPS */}
                    <section className="reminder-section">
                        <h2>Customer Groups</h2>

                        {loading ? (
                            <p className="reminder-empty">
                                Loading customer groups...
                            </p>
                        ) : customerGroups.length === 0 ? (
                            <p className="reminder-empty">
                                No customer reminders found. Click + Add
                                Reminder to create one.
                            </p>
                        ) : (
                            <div className="reminder-table-wrapper">
                                <table className="reminder-table">
                                    <thead>
                                        <tr>
                                            <th>Customer Name</th>
                                            <th>Notes</th>
                                            <th>Reminder Date</th>
                                            <th>Reminder Time</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {customerGroups.map((group) => (
                                            <tr key={group.customer}>
                                                <td>
                                                    <strong>
                                                        {group.customer}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {group.notes || "-"}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        group.latest?.reminder_date
                                                    )}
                                                </td>

                                                <td>
                                                    {formatTime(
                                                        group.latest?.reminder_time
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`reminder-status reminder-status-${getReminderStatus(
                                                            group.latest
                                                        )}`}
                                                    >
                                                        {getReminderStatus(
                                                            group.latest
                                                        )}
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
                                                            className="reminder-delete-btn"
                                                            disabled={
                                                                deletingCustomer ===
                                                                group.customer
                                                            }
                                                            onClick={() =>
                                                                handleDeleteCustomer(
                                                                    group.customer,
                                                                    group.items
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* PENDING REMINDERS */}
                    <section className="reminder-section">
                        <h2>Pending Reminders</h2>

                        {pendingReminders.length === 0 ? (
                            <p className="reminder-empty">
                                No pending reminders.
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
                                        {pendingReminders.map(
                                            (reminder, index) => (
                                                <tr
                                                    key={
                                                        getReminderId(
                                                            reminder
                                                        ) ?? index
                                                    }
                                                >
                                                    <td>
                                                        {reminder.customer_name}
                                                    </td>
                                                    <td>
                                                        {reminder.note ||
                                                            reminder.notes ||
                                                            "-"}
                                                    </td>
                                                    <td>
                                                        {formatDate(
                                                            reminder.reminder_date
                                                        )}
                                                    </td>
                                                    <td>
                                                        {formatTime(
                                                            reminder.reminder_time
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="reminder-status reminder-status-pending">
                                                            Pending
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* COMPLETED REMINDERS */}
                    <section className="reminder-section">
                        <h2>Completed Reminders</h2>

                        {completedReminders.length === 0 ? (
                            <p className="reminder-empty">
                                No completed reminders yet.
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
                                        {completedReminders.map(
                                            (reminder, index) => (
                                                <tr
                                                    key={
                                                        getReminderId(
                                                            reminder
                                                        ) ?? index
                                                    }
                                                >
                                                    <td>
                                                        {reminder.customer_name}
                                                    </td>
                                                    <td>
                                                        {reminder.note ||
                                                            reminder.notes ||
                                                            "-"}
                                                    </td>
                                                    <td>
                                                        {formatDate(
                                                            reminder.reminder_date
                                                        )}
                                                    </td>
                                                    <td>
                                                        {formatTime(
                                                            reminder.reminder_time
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="reminder-status reminder-status-completed">
                                                            Completed
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default Reminder;