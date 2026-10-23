import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for browser push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration =
        await navigator.serviceWorker.register(
          '/service-worker.js'
        );

      console.log(
        'Service Worker registered successfully:',
        registration.scope
      );
    } catch (error) {
      console.error(
        'Service Worker registration failed:',
        error
      );
    }
  });
}


async function registerPushNotifications() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push notifications are not supported.");
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    if (!("Notification" in window)) {
      console.log("Notifications are not supported.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission was not granted.");
      return;
    }

    const response = await fetch(
      "https://smazo.onrender.com/api/push/vapid-public-key"
    );

    if (!response.ok) {
      throw new Error("Could not get VAPID public key.");
    }

    const { publicKey } = await response.json();

    if (!publicKey) {
      throw new Error("VAPID public key is missing.");
    }

    const base64 = publicKey
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padding = "=".repeat((4 - (base64.length % 4)) % 4);

    const applicationServerKey = Uint8Array.from(
      atob(base64 + padding),
      (char) => char.charCodeAt(0)
    );

    let subscription =
      await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }

    const saveResponse = await fetch(
      "https://smazo.onrender.com/api/push/subscribe",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(subscription)
      }
    );

    if (!saveResponse.ok) {
      throw new Error("Could not save push subscription.");
    }

    console.log("Push subscription saved successfully.");
  } catch (error) {
    console.error("Push notification setup failed:", error);
  }
}

console.log("RMA Push Debug: Browser page loaded.");

if ("Notification" in window) {
    console.log("Notification permission:", Notification.permission);
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
        console.log("Service Worker ready:", registration.scope);

        registration.pushManager.getSubscription().then((subscription) => {
            console.log(
                "Push subscription exists:",
                Boolean(subscription)
            );
        });
    });
}

registerPushNotifications();


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
