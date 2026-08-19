/* =========================================
   LOGIN PAGE
========================================= */

// Login Form

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        // ===============================
        // VALIDATION
        // ===============================

        if (email === "" || password === "") {

            alert("Please enter email and password.");

            return;
        }


        if (password.length < 6) {

            alert("Password must contain at least 6 characters.");

            return;
        }


        // ===============================
        // LOGIN DATA
        // ===============================

        const loginData = {

            email: email,
            password: password

        };


        // ===============================
        // CONNECT TO SPRING BOOT
        // ===============================

        try {

            const response = await fetch(
                "http://localhost:8080/api/users/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(loginData)
                }
            );


            // ===============================
            // LOGIN SUCCESS
            // ===============================

            if (response.ok) {

                const data = await response.json();

                console.log("Login successful:", data);


                // Store logged-in user
                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(data.user)
                );


                alert("Login successful! 🎉");

                window.location.href = "home.html";

            }


            // ===============================
            // LOGIN FAILED
            // ===============================

            else {

                const errorMessage = await response.text();

                alert(
                    errorMessage || "Invalid email or password."
                );

            }

        }

        catch (error) {

            console.error(
                "Backend connection error:",
                error
            );

            alert(
                "Cannot connect to the server. Please make sure Spring Boot is running."
            );

        }

    });

}


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

function togglePassword() {

    const password =
        document.getElementById("password");

    const button =
        document.querySelector(".show-password");


    if (password.type === "password") {

        password.type = "text";

        button.textContent = "🙈";

    } else {

        password.type = "password";

        button.textContent = "👁";

    }

}


// ===============================
// FORGOT PASSWORD
// ===============================

function forgotPassword() {

    alert(
        "Password reset feature will be connected later."
    );

}


// ===============================
// GOOGLE LOGIN
// ===============================

function googleLogin() {

    alert(
        "Google login will be connected later."
    );

}