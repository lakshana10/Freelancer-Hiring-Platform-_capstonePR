// ===============================
// EMAILJS CONFIGURATION
// ===============================

const EMAILJS_SERVICE_ID = "service_iw6n4c3";
const EMAILJS_TEMPLATE_ID = "template_q3itx8p";


// ===============================
// OTP STATUS
// Backend OTP (Gmail SMTP) is the single source of truth.
// Signup is blocked until the SAME email is verified.
// ===============================

let otpVerified = false;

let verifiedEmail = "";

let otpCooldownUntil = 0;


function setOtpMessage(text, color) {

    const otpMessage =
        document.getElementById("otpMessage");

    if (!otpMessage) {
        return;
    }

    otpMessage.textContent = text;
    otpMessage.style.color = color;
}


// Changing the email invalidates any previous verification.
document.addEventListener("DOMContentLoaded", function () {

    const emailInput =
        document.getElementById("email");

    if (!emailInput) {
        return;
    }

    emailInput.addEventListener("input", function () {

        otpVerified = false;
        verifiedEmail = "";
        setOtpMessage("", "green");

    });

});


// ===============================
// STRONG PASSWORD (mirrors backend SignupRequest)
// ===============================

function isStrongPassword(password) {

    if (!password || password.length < 8) {
        return false;
    }

    return /[a-z]/.test(password)
        && /[A-Z]/.test(password)
        && /\d/.test(password)
        && /[@$!%*?&^#_+\-=:;.]/.test(password);

}


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


        // Resend cooldown: backend allows 5 OTPs per 10 min.
        const now = Date.now();

        if (now < otpCooldownUntil) {

            const waitSec = Math.ceil(
                (otpCooldownUntil - now) / 1000);

            alert(
                "Please wait " + waitSec +
                "s before requesting a new OTP."
            );
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


            let data = {};

            try {
                data = await response.json();
            } catch (parseError) {
                data = {};
            }


            if (!response.ok) {

                if (response.status === 429) {

                    otpCooldownUntil =
                        Date.now() + 60000;

                    alert(
                        data.message ||
                        "Too many OTP requests. " +
                        "Please wait a minute and try again."
                    );

                } else if (response.status >= 500) {

                    alert(
                        data.message ||
                        "Email service is temporarily unavailable. " +
                        "Please try again in a minute."
                    );

                } else {

                    alert(
                        data.message ||
                        "Failed to send OTP."
                    );

                }

                return;
            }


            // ===============================
            // OTP SENT SUCCESSFULLY
            // ===============================

            alert(
                "OTP sent successfully to your email. Please check your Gmail."
            );


            setOtpMessage(
                "✓ OTP sent successfully. Please check your email.",
                "green");

            otpVerified = false;
            verifiedEmail = "";

            // 60s resend cooldown.
            otpCooldownUntil = Date.now() + 60000;


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
                verifiedEmail = email.toLowerCase();


                setOtpMessage(
                    "✓ Email verified successfully.",
                    "green");


                alert(
                    "OTP verified successfully!"
                );


            } else {

                otpVerified = false;
                verifiedEmail = "";


                setOtpMessage(
                    "Invalid or expired OTP.",
                    "red");


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


        // OTP verification is required and synced with the
        // backend: the user must verify the SAME email via
        // /api/otp/verify before the account is created.

        if (!otpVerified
                || verifiedEmail !== email.toLowerCase()) {

            alert(
                "Please verify your email with the OTP first."
            );
            return;

        }


        if (!role) {

            alert(
                "Please select whether you are a Freelancer or Client."
            );

            return;

        }


        // Must mirror backend SignupRequest: 8+ chars with
        // upper, lower, digit and special character.

        if (!isStrongPassword(password)) {

            alert(
                "Password must be 8+ characters with uppercase, " +
                "lowercase, digit and special character."
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
