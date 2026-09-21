// ===============================
// VIEW FREELANCER PROFILE
// ===============================

const container =
    document.getElementById("profileContainer");


// ===============================
// GET FREELANCER EMAIL
// ===============================

const params =
    new URLSearchParams(window.location.search);

const email =
    params.get("email");


// ===============================
// GET LOGGED-IN USER
// ===============================

const loggedInUser =
    JSON.parse(
        localStorage.getItem("loggedInUser")
    );


// ===============================
// LOAD PROFILE
// ===============================

async function loadProfile() {

    if (!email) {

        container.innerHTML =
            "<p>Freelancer not selected.</p>";

        return;
    }


    try {

        const response =
            await fetch(
                "https://freelancer-backend-9cw6.onrender.com/api/users"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load profile"
            );

        }


        const users =
            await response.json();


        const freelancer =
            users.find(
                user =>
                    user.email === email &&
                    user.role === "FREELANCER"
            );


        if (!freelancer) {

            container.innerHTML =
                "<p>Freelancer not found.</p>";

            return;
        }


        // ===============================
        // MESSAGE BUTTON
        // ===============================

        let messageButton = "";


        if (
            loggedInUser &&
            loggedInUser.email &&
            loggedInUser.role === "CLIENT"
        ) {

            messageButton = `
                <button
                    class="message-btn"
                    onclick="openMessage('${freelancer.email}')">

                    💬 Message Freelancer

                </button>
            `;

        }


        // ===============================
        // DISPLAY PROFILE
        // ===============================

        container.innerHTML = `

            <div class="view-profile-card">

                <div class="profile-icon">
                    ✣
                </div>


                <h1>
                    ${escapeHTML(freelancer.name)}
                </h1>


                <p class="profile-email">
                    ${escapeHTML(freelancer.email)}
                </p>


                <div class="profile-details">

                    <div>
                        <h3>Skills</h3>

                        <p>
                            ${escapeHTML(
                                freelancer.skills ||
                                "Not added"
                            )}
                        </p>
                    </div>


                    <div>
                        <h3>Experience</h3>

                        <p>
                            ${escapeHTML(
                                freelancer.experience ||
                                "Not added"
                            )}
                        </p>
                    </div>


                    <div>
                        <h3>About</h3>

                        <p>
                            ${escapeHTML(
                                freelancer.bio ||
                                "No bio available"
                            )}
                        </p>
                    </div>

                </div>


                <div class="profile-actions">

                    ${messageButton}


                    <button
                        onclick="window.location.href='freelancers.html'">

                        ← Back to Freelancers

                    </button>

                </div>

            </div>

        `;


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        container.innerHTML = `
            <p>
                Unable to load freelancer profile.
            </p>
        `;

    }

}


// ===============================
// OPEN MESSAGE PAGE
// ===============================

function openMessage(receiverEmail) {

    if (
        !loggedInUser ||
        !loggedInUser.email
    ) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;
    }


    if (loggedInUser.role !== "CLIENT") {

        alert(
            "Only clients can message freelancers."
        );

        return;
    }


    window.location.href =
        `messages.html?receiver=${encodeURIComponent(
            receiverEmail
        )}`;

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


// ===============================
// START
// ===============================

loadProfile();
