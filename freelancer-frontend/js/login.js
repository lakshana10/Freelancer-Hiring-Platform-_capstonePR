console.log("LOGIN SCRIPT STARTED");

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
            "http://localhost:8080/api/users/login",
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

        // Save logged-in user
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

        alert("Login successful!");

        // Redirect according to role
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

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        alert("Unable to connect to the backend.");

    }

});


// Show / hide password
function togglePassword() {

    const passwordInput =
        document.getElementById("password");

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

    } else {

        passwordInput.type = "password";
    }
}


// Forgot password
function forgotPassword() {

    alert("Please contact the administrator to reset their password.");

}


// Google login placeholder
function googleLogin() {

    alert("Google login will be available soon.");

}