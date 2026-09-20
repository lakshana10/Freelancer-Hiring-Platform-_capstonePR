// ===============================
// NOTIFICATIONS
// ===============================

const API_URL = "http://localhost:8080/api/notifications";

const container =
    document.getElementById("notificationsContainer");


// ===============================
// GET LOGGED-IN USER
// ===============================

const loggedInUser =
    JSON.parse(localStorage.getItem("loggedInUser"));


// ===============================
// CHECK LOGIN
// ===============================

if (!loggedInUser || !loggedInUser.email) {

    container.innerHTML = `
        <div class="empty">
            Please login to view your notifications.
        </div>
    `;

} else {

    loadNotifications(loggedInUser.email);

}


// ===============================
// LOAD NOTIFICATIONS
// ===============================

async function loadNotifications(email) {

    try {

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(email)}`
        );

        if (!response.ok) {
            throw new Error("Failed to load notifications");
        }

        const notifications =
            await response.json();


        // No notifications
        if (notifications.length === 0) {

            container.innerHTML = `
                <div class="empty">
                    🔔 No notifications yet.
                </div>
            `;

            return;
        }


        // Clear old notifications
        container.innerHTML = "";


        // Display notifications
        notifications.forEach(notification => {

            const notificationDiv =
                document.createElement("div");

            notificationDiv.className =
                notification.read
                    ? "notification"
                    : "notification unread";


            notificationDiv.innerHTML = `

                <div class="notification-content">

                    <div class="message">
                        ${notification.message}
                    </div>

                    <div class="date">
                        ${formatDate(notification.createdAt)}
                    </div>

                </div>

                ${
                    notification.read
                        ? `
                            <span class="read-status">
                                ✓ Read
                            </span>
                          `
                        : `
                            <button
                                class="read-btn"
                                onclick="markAsRead(${notification.id})">
                                Mark as Read
                            </button>
                          `
                }

            `;


            container.appendChild(notificationDiv);

        });


    } catch (error) {

        console.error(
            "Notification error:",
            error
        );

        container.innerHTML = `
            <div class="empty">
                Unable to load notifications.
            </div>
        `;

    }

}


// ===============================
// MARK NOTIFICATION AS READ
// ===============================

async function markAsRead(id) {

    try {

        const response = await fetch(
            `${API_URL}/${id}/read`,
            {
                method: "PUT"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Failed to mark notification as read"
            );

        }


        // Reload notifications
        await loadNotifications(
            loggedInUser.email
        );


    } catch (error) {

        console.error(
            "Mark as read error:",
            error
        );

        alert(
            "Unable to mark notification as read."
        );

    }

}


// ===============================
// FORMAT DATE
// ===============================

function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleString();

}