
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("reminderAPI", {
    onReminderData: (callback) => {
        ipcRenderer.removeAllListeners("reminder-data");

        ipcRenderer.on("reminder-data", (_event, reminder) => {
            callback(reminder);
        });
    },

    closePopup: () => {
        ipcRenderer.send("close-reminder-popup");
    }
});
