// ===============================
// EMAILJS CONFIGURATION
// ===============================

const EMAILJS_SERVICE_ID = "service_iw6n4c3";
const EMAILJS_TEMPLATE_ID = "template_q3itx8p";


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

function togglePassword(inputId, button) {

    const input = document.getElementById(inputId);

    if (input.type === "password") {

        input.type = "text";
        button.textContent = "🙈";

    } else {

        input.type = "password";
        button.textContent = "👁";

    }
}


// ===============================
// SIGNUP FORM
// ===============================

document
    .getElementById("signupForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        // ===============================
        // GET FORM VALUES
        // ===============================

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const terms =
            document.getElementById("terms").checked;


        // ===============================
        // VALIDATION
        // ===============================

        if (name.length < 2) {

            alert("Please enter your full name.");
            return;

        }


        if (!email.includes("@")) {

            alert("Please enter a valid email address.");
            return;

        }


        if (password.length < 6) {

            alert("Password must contain at least 6 characters.");
            return;

        }


        if (password !== confirmPassword) {

            alert("Passwords do not match.");
            return;

        }


        if (!terms) {

            alert("Please accept the Terms & Conditions.");
            return;

        }


        // ===============================
        // USER DATA
        // ===============================

        const userData = {

            name: name,
            email: email,
            password: password,
            role: "FREELANCER"

        };


        try {

            // ===============================
            // SAVE USER TO SPRING BOOT
            // ===============================

            const response = await fetch(
                "http://localhost:8080/api/users/signup",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(userData)
                }
            );


            // ===============================
            // SUCCESS
            // ===============================

            if (response.ok) {

                console.log("Signup successful.");


                // ===============================
                // SEND WELCOME EMAIL
                // ===============================

                try {

                    await emailjs.send(
                        EMAILJS_SERVICE_ID,
                        EMAILJS_TEMPLATE_ID,
                        {
                            to_name: name,
                            to_email: email,
                            user_role: "Freelancer"
                        }
                    );


                    console.log(
                        "Welcome email sent successfully."
                    );


                } catch (emailError) {

                    console.error(
                        "Welcome email failed:",
                        emailError
                    );

                }


                // ===============================
                // SUCCESS MESSAGE
                // ===============================

                alert(
                    "Account created successfully! Welcome to FreelanceHub 🎉"
                );


                window.location.href = "login.html";

            }


            // ===============================
            // SIGNUP ERROR
            // ===============================

            else {

                let errorMessage =
                    "Signup failed. Please try again.";


                try {

                    const errorData =
                        await response.json();


                    if (errorData.message) {

                        errorMessage =
                            errorData.message;

                    }

                } catch (error) {

                    console.error(
                        "Could not read error response:",
                        error
                    );

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


// ===============================
// GOOGLE SIGNUP
// ===============================

function googleSignup() {

    alert(
        "Google Sign-Up is not configured for this project. Please create your FreelanceHub account using your name, email, and password."
    );

}