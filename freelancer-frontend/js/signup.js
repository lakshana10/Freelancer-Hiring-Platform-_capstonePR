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

document.getElementById("signupForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

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
    // SEND DATA TO SPRING BOOT
    // ===============================

    const userData = {

        name: name,
        email: email,
        password: password,
        role: "FREELANCER"

    };


    try {

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

            const data = await response.json();

            console.log("Signup successful:", data);

            alert(
                "Account created successfully! Welcome to FreelanceHub 🎉"
            );

            window.location.href = "login.html";

        }


        // ===============================
        // ERROR
        // ===============================

        else {

            const errorMessage = await response.text();

            alert(errorMessage || "Signup failed. Please try again.");

        }

    }

    catch (error) {

        console.error("Backend connection error:", error);

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
        "Google signup will be connected later."
    );

}