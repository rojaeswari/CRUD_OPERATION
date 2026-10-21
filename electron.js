
const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const axios = require("axios");

const API = "https://smazo.onrender.com/api/reminders";

let popupWindow = null;
let lastActiveId = null;
let dismissedIds = new Set();
let polling = false;

function parseDate(value) {
    if (!value) return null;

    const text = String(value);

    // PostgreSQL timestamp without timezone is treated as UTC.
    const normalized =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(text)
            ? `${text}Z`
            : text;

    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

function createPopup(reminder) {
    if (popupWindow && !popupWindow.isDestroyed()) {
        popupWindow.webContents.send("reminder-data", reminder);
        popupWindow.show();
        popupWindow.focus();
        return;
    }

    const area = screen.getPrimaryDisplay().workArea;

    popupWindow = new BrowserWindow({
        width: 380,
        height: 270,
        x: area.x + area.width - 400,
        y: area.y + 20,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: false,
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    popupWindow.loadFile(path.join(__dirname, "popup.html"));

    popupWindow.webContents.once("did-finish-load", () => {
        if (popupWindow && !popupWindow.isDestroyed()) {
            popupWindow.webContents.send("reminder-data", reminder);
        }
    });

    popupWindow.on("closed", () => {
        popupWindow = null;
    });

    popupWindow.setAlwaysOnTop(true, "screen-saver");
}

ipcMain.on("close-reminder-popup", () => {
    if (popupWindow && !popupWindow.isDestroyed()) {
        popupWindow.close();
    }
});

async function checkReminders() {
    if (polling) return;
    polling = true;

    try {
        const response = await axios.get(API, { timeout: 20000 });

        const reminders = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.data)
                ? response.data.data
                : [];

        const active = reminders.find(
            item => String(item.status || "").toLowerCase() === "active"
        );

        if (!active) {
            lastActiveId = null;
            return;
        }

        if (String(active.id) !== String(lastActiveId)) {
            lastActiveId = active.id;

            if (!dismissedIds.has(String(active.id))) {
                createPopup(active);
            }
        } else if (
            popupWindow &&
            !popupWindow.isDestroyed()
        ) {
            popupWindow.webContents.send("reminder-data", active);
        }
    } catch (error) {
        console.error(
            "Reminder API error:",
            error.response?.status || error.message
        );
    } finally {
        polling = false;
    }
}

app.whenReady().then(() => {
    checkReminders();
    setInterval(checkReminders, 5000);
});

app.on("window-all-closed", event => {
    // Keep the desktop reminder checker running when popup is closed.
    // Quit the app explicitly using Task Manager if needed.
});
