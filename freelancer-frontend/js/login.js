console.log("LOGIN SCRIPT STARTED");


// ===============================
// LOGIN SUCCESS POPUP
// ===============================

function showLoginSuccess(user) {

    const popup = document.createElement("div");

    popup.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        ">

            <div style="
                width: 360px;
                background: white;
                padding: 30px;
                border-radius: 18px;
                text-align: center;
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
            ">

                <div style="
                    width: 65px;
                    height: 65px;
                    margin: 0 auto 18px;
                    border-radius: 50%;
                    background: #7045DF;
                    color: white;
                    font-size: 38px;
                    font-weight: bold;
                    line-height: 65px;
                ">
                    ✓
                </div>

                <h2 style="
                    margin: 0 0 10px;
                    color: #17132D;
                    font-size: 24px;
                ">
                    Login Successful
                </h2>

                <p style="
                    margin: 0;
                    color: #555;
                    font-size: 16px;
                ">
                    Welcome back, ${user.name || "User"}!
                </p>

                <p style="
                    margin-top: 18px;
                    color: #7045DF;
                    font-size: 14px;
                ">
                    Redirecting to your dashboard...
                </p>

                <div style="
                    width: 100%;
                    height: 5px;
                    background: #eee7ff;
                    border-radius: 10px;
                    margin-top: 15px;
                    overflow: hidden;
                ">
                    <div style="
                        width: 100%;
                        height: 100%;
                        background: #7045DF;
                        border-radius: 10px;
                        animation: loginProgress 3s linear forwards;
                    "></div>
                </div>

            </div>
        </div>

        <style>
            @keyframes loginProgress {
                from {
                    width: 100%;
                }
                to {
                    width: 0%;
                }
            }
        </style>
    `;

    document.body.appendChild(popup);
}


// ===============================
// LOGIN
// ===============================

const form = document.getElementById("loginForm");

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("Please enter email and password.");
        return;
    }

    try {

        const response = await fetch(
            "https://freelancer-backend-9cw6.onrender.com/api/users/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const responseText = await response.text();

        console.log("STATUS:", response.status);
        console.log("RESPONSE:", responseText);

        if (!response.ok) {
            alert(responseText);
            return;
        }

        const data = JSON.parse(responseText);

        console.log("LOGIN SUCCESS:", data);

        const user = data.user;

        if (!user) {
            alert("Login successful, but user data was not received.");
            return;
        }


        // ===============================
        // SAVE LOGGED-IN USER
        // ===============================

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "userEmail",
            user.email
        );

        localStorage.setItem(
            "userRole",
            user.role
        );


        // ===============================
        // SHOW LOGIN SUCCESS POPUP
        // ===============================

        showLoginSuccess(user);


        // ===============================
        // REDIRECT AFTER 3 SECONDS
        // ===============================

        setTimeout(function() {

            const role = user.role
                ? user.role.toUpperCase()
                : "";

            if (role === "ADMIN") {

                window.location.href = "admin.html";

            } else if (role === "CLIENT") {

                window.location.href = "client-dashboard.html";

            } else if (role === "FREELANCER") {

                window.location.href = "freelancer-dashboard.html";

            } else {

                window.location.href = "home.html";
            }

        }, 3000);

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        alert("Unable to connect to the backend.");

    }

});


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

function togglePassword() {

    const passwordInput =
        document.getElementById("password");

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

    } else {

        passwordInput.type = "password";
    }
}


// ===============================
// FORGOT PASSWORD
// ===============================

function forgotPassword() {

    alert("Please contact the administrator to reset their password.");

}


// ===============================
// GOOGLE LOGIN PLACEHOLDER
// ===============================

function googleLogin() {

    alert("Google login will be available soon.");

}
