// ===============================
// EMAILJS CONFIGURATION
// ===============================

const EMAILJS_SERVICE_ID = "service_iw6n4c3";
const EMAILJS_TEMPLATE_ID = "template_q3itx8p";


// ===============================
// OTP STATUS
// ===============================

let otpVerified = false;


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
// GET OTP
// ===============================

document
    .getElementById("generateOtpBtn")
    .addEventListener("click", async function () {

        const email =
            document.getElementById("email").value.trim();

        const otpMessage =
            document.getElementById("otpMessage");


        if (!email || !email.includes("@")) {

            alert("Please enter a valid email address first.");
            return;

        }


        try {

            this.disabled = true;
            this.textContent = "Sending...";


            const response = await fetch(
                "https://freelancer-backend-9cw6.onrender.com/api/otp/generate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to send OTP."
                );

                return;
            }


            // ===============================
            // OTP SENT SUCCESSFULLY
            // ===============================

            alert(
                "OTP sent successfully to your email. Please check your Gmail."
            );


            otpMessage.textContent =
                "✓ OTP sent successfully. Please check your email.";

            otpMessage.style.color = "green";

            otpVerified = false;


        } catch (error) {

            console.error(
                "OTP generation error:",
                error
            );


            alert(
                "Cannot connect to the server. Please make sure Spring Boot is running."
            );

        } finally {

            this.disabled = false;
            this.textContent = "Get OTP";

        }

    });


// ===============================
// VERIFY OTP
// ===============================

document
    .getElementById("verifyOtpBtn")
    .addEventListener("click", async function () {

        const email =
            document.getElementById("email").value.trim();

        const otp =
            document.getElementById("otp").value.trim();

        const otpMessage =
            document.getElementById("otpMessage");


        if (!email) {

            alert("Please enter your email address.");
            return;

        }


        if (!otp || otp.length !== 6) {

            alert("Please enter the 6-digit OTP.");
            return;

        }


        try {

            this.disabled = true;
            this.textContent = "Verifying...";


            const response = await fetch(
                "https://freelancer-backend-9cw6.onrender.com/api/otp/verify",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        otp: otp
                    })
                }
            );


            const result =
                await response.text();


            if (response.ok) {

                otpVerified = true;


                otpMessage.textContent =
                    "✓ Email verified successfully.";

                otpMessage.style.color = "green";


                alert(
                    "OTP verified successfully!"
                );


            } else {

                otpVerified = false;


                otpMessage.textContent =
                    "Invalid or expired OTP.";

                otpMessage.style.color = "red";


                alert(result);

            }


        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );


            alert(
                "Cannot connect to the server. Please make sure Spring Boot is running."
            );

        } finally {

            this.disabled = false;
            this.textContent = "Verify OTP";

        }

    });


// ===============================
// SIGNUP FORM
// ===============================

document
    .getElementById("signupForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        // ===============================
        // GET FORM VALUES
        // ===============================

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const selectedRole =
            document.querySelector(
                'input[name="role"]:checked'
            );

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const terms =
            document.getElementById("terms").checked;


        const role =
            selectedRole
                ? selectedRole.value
                : "";


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


        if (!otpVerified) {

            alert(
                "Please generate and verify your OTP before creating your account."
            );

            return;

        }


        if (!role) {

            alert(
                "Please select whether you are a Freelancer or Client."
            );

            return;

        }


        if (password.length < 6) {

            alert(
                "Password must contain at least 6 characters."
            );

            return;

        }


        if (password !== confirmPassword) {

            alert("Passwords do not match.");
            return;

        }


        if (!terms) {

            alert(
                "Please accept the Terms & Conditions."
            );

            return;

        }


        // ===============================
        // USER DATA
        // ===============================

        const userData = {

            name: name,
            email: email,
            password: password,
            role: role

        };


        try {

            // ===============================
            // SAVE USER TO SPRING BOOT
            // ===============================

            const response = await fetch(
                "https://freelancer-backend-9cw6.onrender.com/api/users/signup",
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

                console.log(
                    "Signup successful."
                );


                // ===============================
                // ROLE NAME FOR EMAIL
                // ===============================

                const roleName =
                    role === "CLIENT"
                        ? "Client"
                        : "Freelancer";


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
                            user_role: roleName
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
                    `Account created successfully as ${roleName}! Welcome to FreelanceHub 🎉`
                );


                window.location.href =
                    "login.html";

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
        "Google Sign-Up is not configured for this project. Please create your FreelanceHub account using your name, email, role, and password."
    );

}
