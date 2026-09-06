/* =========================================
   LOGIN PAGE
========================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // ===============================
        // GET LOGIN VALUES
        // ===============================

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;


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

                // Get logged-in user
                const user = data.user;

                // Check that user data exists
                if (!user) {
                    alert("Login successful, but user data was not received.");
                    return;
                }

                // Store user information
                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(user)
                );

                alert("Login successful! 🎉");


                // ===============================
                // ROLE-BASED REDIRECT
                // ===============================

                if (user.role &&
                    user.role.toUpperCase() === "ADMIN") {

                    // Admin → Admin Dashboard
                    window.location.href = "admin.html";

                } else {

                    // Freelancer → Home Page
                    window.location.href = "home.html";
                }

            }


            // ===============================
            // LOGIN FAILED
            // ===============================

            else {

                let errorMessage = "Invalid email or password.";

                try {
                    const errorData = await response.json();

                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }

                } catch (error) {
                    // Response was not JSON
                    const text = await response.text();

                    if (text) {
                        errorMessage = text;
                    }
                }

                alert(errorMessage);
            }

        }


        // ===============================
        // BACKEND CONNECTION ERROR
        // ===============================

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


/* =========================================
   SHOW / HIDE PASSWORD
========================================= */

function togglePassword() {

    const password =
        document.getElementById("password");

    const button =
        document.querySelector(".show-password");


    if (!password) {
        return;
    }


    if (password.type === "password") {

        password.type = "text";

        if (button) {
            button.textContent = "🙈";
        }

    } else {

        password.type = "password";

        if (button) {
            button.textContent = "👁";
        }
    }
}


/* =========================================
   FORGOT PASSWORD
========================================= */

function forgotPassword() {

    alert(
        "Password reset feature will be connected later."
    );
}


/* =========================================
   GOOGLE LOGIN
========================================= */

function googleLogin() {

    alert(
        "Google login will be connected later."
    );
}