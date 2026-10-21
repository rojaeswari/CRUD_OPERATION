
let reminderData = null;
let countdownInterval = null;

const customerElement = document.getElementById("customer");
const noteElement = document.getElementById("note");
const countdownElement = document.getElementById("countdown");
const closeButton = document.getElementById("closeBtn");

function parseDate(value) {
    if (!value) return null;

    const text = String(value);

    const normalized =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(text)
            ? `${text}Z`
            : text;

    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? null : date;
}

function updateCountdown() {
    if (!reminderData) return;

    const repeatMinutes = Number(reminderData.repeat_minutes) || 15;
    const startedAt = parseDate(reminderData.started_at);

    if (!startedAt) {
        countdownElement.textContent = `${String(repeatMinutes).padStart(2, "0")}:00`;
        return;
    }

    const deadline = startedAt.getTime() + repeatMinutes * 60 * 1000;
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    countdownElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    countdownElement.style.color = remaining <= 60 ? "#dc2626" : "#198754";
}

function showReminder(reminder) {
    if (!reminder) return;

    reminderData = reminder;

    customerElement.textContent = reminder.customer_name || "Unknown customer";
    noteElement.textContent = reminder.note || reminder.notes || "No note";

    updateCountdown();

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    countdownInterval = setInterval(updateCountdown, 1000);
}

if (window.reminderAPI) {
    window.reminderAPI.onReminderData(showReminder);
}

closeButton.addEventListener("click", () => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    if (window.reminderAPI) {
        window.reminderAPI.closePopup();
    }
});
