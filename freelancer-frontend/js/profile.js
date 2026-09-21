const userEmail = localStorage.getItem("userEmail");

if (!userEmail) {
    window.location.href = "login.html";
}

async function loadProfile() {

    try {

        const response = await fetch(
            "https://freelancer-backend-9cw6.onrender.com/api/users"
        );

        const users = await response.json();

        const user = users.find(
            u => u.email === userEmail
        );

        if (!user) {
            document.getElementById("message").innerText =
                "User not found.";
            return;
        }

        document.getElementById("skills").value =
            user.skills || "";

        document.getElementById("experience").value =
            user.experience || "";

        document.getElementById("bio").value =
            user.bio || "";

    } catch (error) {

        console.error(error);

        document.getElementById("message").innerText =
            "Unable to load profile.";
    }
}

loadProfile();
async function updateProfile() {

    const skills = document.getElementById("skills").value;
    const experience = document.getElementById("experience").value;
    const bio = document.getElementById("bio").value;

    try {

        const response = await fetch(
            `https://freelancer-backend-9cw6.onrender.com/api/users/${encodeURIComponent(userEmail)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    skills: skills,
                    experience: experience,
                    bio: bio
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update profile");
        }

        document.getElementById("message").innerText =
            "Profile updated successfully!";

    } catch (error) {

        console.error(error);

        document.getElementById("message").innerText =
            "Unable to update profile.";
    }
}
