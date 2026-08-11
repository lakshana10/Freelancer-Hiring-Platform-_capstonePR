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
    .addEventListener("submit", function(event) {

        event.preventDefault();

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


        // Password check

        if (password.length < 6) {

            alert("Password must contain at least 6 characters.");

            return;
        }


        // Confirm password

        if (password !== confirmPassword) {

            alert("Passwords do not match.");

            return;
        }


        // Terms

        if (!terms) {

            alert("Please accept the Terms & Conditions.");

            return;
        }


        // Temporary frontend signup

        localStorage.setItem("freelanceUser", JSON.stringify({
            name: name,
            email: email
        }));


        alert(
            "Account created successfully! Welcome to FreelanceHub 🎉"
        );


        // Go to login

        window.location.href = "login.html";

    });


// ===============================
// GOOGLE SIGNUP
// ===============================

function googleSignup() {

    alert(
        "Google signup will be connected when we add backend authentication."
    );

}