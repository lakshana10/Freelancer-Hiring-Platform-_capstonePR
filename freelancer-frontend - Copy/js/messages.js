// ===============================
// MESSAGES
// ===============================

const API_URL =
    "http://localhost:8080/api/messages";


// ===============================
// GET LOGGED-IN USER
// ===============================

const loggedInUser =
    JSON.parse(
        localStorage.getItem("loggedInUser")
    );


// ===============================
// GET CHAT USER FROM URL
// ===============================

const params =
    new URLSearchParams(
        window.location.search
    );

const receiverEmail =
    params.get("receiver");


// ===============================
// PAGE ELEMENTS
// ===============================

const messagesContainer =
    document.getElementById(
        "messagesContainer"
    );

const messageInput =
    document.getElementById(
        "messageInput"
    );

const chatHeader =
    document.getElementById(
        "chatHeader"
    );


// ===============================
// LOGIN + RECEIVER CHECK
// ===============================

if (
    !loggedInUser ||
    !loggedInUser.email
) {

    messagesContainer.innerHTML = `
        <div class="empty-message">
            Please login first.
        </div>
    `;

    messageInput.disabled = true;

} else if (!receiverEmail) {

    messagesContainer.innerHTML = `
        <div class="empty-message">
            No user selected for messaging.
        </div>
    `;

    messageInput.disabled = true;

} else if (
    loggedInUser.email.toLowerCase() ===
    receiverEmail.toLowerCase()
) {

    messagesContainer.innerHTML = `
        <div class="empty-message">
            You cannot message yourself.
        </div>
    `;

    messageInput.disabled = true;

} else {

    chatHeader.textContent =
        `Chat with ${receiverEmail}`;

    loadMessages();

}


// ===============================
// LOAD MESSAGES
// ===============================

async function loadMessages() {

    try {

        const response =
            await fetch(
                `${API_URL}/conversation?` +
                `senderEmail=${encodeURIComponent(
                    loggedInUser.email
                )}` +
                `&receiverEmail=${encodeURIComponent(
                    receiverEmail
                )}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load messages"
            );

        }


        const messages =
            await response.json();


        displayMessages(messages);


        await markReceivedMessagesAsRead(
            messages
        );


    } catch (error) {

        console.error(
            "Message loading error:",
            error
        );


        messagesContainer.innerHTML = `
            <div class="empty-message">
                Unable to load messages.
            </div>
        `;

    }

}


// ===============================
// DISPLAY MESSAGES
// ===============================

function displayMessages(messages) {

    if (messages.length === 0) {

        messagesContainer.innerHTML = `
            <div class="empty-message">
                No messages yet.
            </div>
        `;

        return;
    }


    messagesContainer.innerHTML = "";


    messages.forEach(message => {

        const row =
            document.createElement("div");


        const isSent =
            message.senderEmail.toLowerCase() ===
            loggedInUser.email.toLowerCase();


        row.className =
            isSent
                ? "message-row sent"
                : "message-row received";


        row.innerHTML = `

            <div class="message">

                <div class="message-text">
                    ${escapeHTML(
                        message.message
                    )}
                </div>

                <div class="message-time">
                    ${formatDate(
                        message.createdAt
                    )}
                </div>

            </div>

        `;


        messagesContainer.appendChild(row);

    });


    // Scroll to latest message
    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

}


// ===============================
// MARK RECEIVED MESSAGES AS READ
// ===============================

async function markReceivedMessagesAsRead(
    messages
) {

    for (const message of messages) {

        const isReceived =
            message.receiverEmail &&
            message.receiverEmail.toLowerCase() ===
            loggedInUser.email.toLowerCase();


        const isUnread =
            message.read === false ||
            message.isRead === false;


        if (
            isReceived &&
            isUnread
        ) {

            try {

                await fetch(
                    `${API_URL}/${message.id}/read`,
                    {
                        method: "PUT"
                    }
                );

            } catch (error) {

                console.error(
                    "Unable to mark message as read:",
                    error
                );

            }

        }

    }

}


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

    const messageText =
        messageInput.value.trim();


    if (messageText === "") {

        alert(
            "Please enter a message."
        );

        return;
    }


    if (
        !loggedInUser ||
        !loggedInUser.email
    ) {

        alert(
            "Please login first."
        );

        return;
    }


    if (!receiverEmail) {

        alert(
            "No receiver selected."
        );

        return;
    }


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        senderEmail:
                            loggedInUser.email,

                        receiverEmail:
                            receiverEmail,

                        message:
                            messageText

                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to send message"
            );

        }


        messageInput.value = "";


        await loadMessages();


    } catch (error) {

        console.error(
            "Send message error:",
            error
        );


        alert(
            "Unable to send message."
        );

    }

}


// ===============================
// ENTER KEY TO SEND
// ===============================

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ===============================
// FORMAT DATE
// ===============================

function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleString();

}


// ===============================
// SECURITY
// ===============================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}