/* =========================================
   LOGIN PAGE
========================================= */


/* Login Form */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value.trim();


        if (email === "" || password === "") {

            alert("Please enter email and password.");

            return;
        }


        if (password.length < 6) {

            alert("Password must contain at least 6 characters.");

            return;
        }


        /*
         * Frontend testing only.
         *
         * Later we will replace this with:
         *
         * POST http://localhost:8080/api/auth/login
         *
         * to connect with Spring Boot.
         */

        alert("Login successful!");
        window.location.href = "home.html";

    });

}


/* Show / Hide Password */

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


/* Forgot Password */

function forgotPassword() {

    alert(
        "Password reset feature will be connected to the backend soon."
    );

}


/* Google Login */

function googleLogin() {

    alert(
        "Google login will be connected later."
    );

}