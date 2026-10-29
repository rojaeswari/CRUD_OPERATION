
self.addEventListener("push", (event) => {
    let data = {};

    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = {
            title: "RMA Reminder",
            body: event.data ? event.data.text() : "You have a reminder."
        };
    }

    const title = data.title || "RMA Reminder";

    const options = {
        body: data.body || "A reminder is active.",
        icon: "/logo192.png",
        badge: "/favicon.ico",
        tag: data.tag || ("rma-reminder-" + Date.now()),
        data: {
            url: data.url || "/"
        },
        requireInteraction: true
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((windowClients) => {
            for (const client of windowClients) {
                if ("focus" in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }

            return clients.openWindow(targetUrl);
        })
    );
});
