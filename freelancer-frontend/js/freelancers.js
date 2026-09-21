const container = document.getElementById("freelancersContainer");

let freelancers = [];

async function loadFreelancers() {

    try {

        const response = await fetch(
            "https://freelancer-backend-9cw6.onrender.com/api/users"
        );

        if (!response.ok) {
            throw new Error("Failed to load freelancers");
        }

        const users = await response.json();

        freelancers = users.filter(
            user => user.role === "FREELANCER"
        );

        displayFreelancers(freelancers);

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <p>
                Unable to load freelancers.
                Please make sure the backend is running.
            </p>
        `;
    }
}


function displayFreelancers(users) {

    if (users.length === 0) {

        container.innerHTML =
            "<p>No freelancers found.</p>";

        return;
    }

    container.innerHTML = "";

    users.forEach(user => {

        const card = document.createElement("div");

        card.className = "freelancer-card";

        card.innerHTML = `
            <h2>${user.name}</h2>

            <p>
                <strong>Email:</strong>
                ${user.email}
            </p>

            <p>
                <strong>Skills:</strong>
                ${user.skills || "Not added"}
            </p>

            <p>
                <strong>Experience:</strong>
                ${user.experience || "Not added"}
            </p>

            <p>
                <strong>About:</strong>
                ${user.bio || "No bio available"}
            </p>

            <button
                class="view-profile-btn"
                onclick="viewProfile('${user.email}')">
                View Profile
            </button>
        `;

        container.appendChild(card);
    });
}


function filterFreelancers() {

    const searchText =
        document.getElementById("freelancerSearch")
        .value
        .toLowerCase()
        .trim();

    const filtered = freelancers.filter(user => {

        const name =
            (user.name || "").toLowerCase();

        const skills =
            (user.skills || "").toLowerCase();

        return name.includes(searchText) ||
               skills.includes(searchText);
    });

    displayFreelancers(filtered);
}


function viewProfile(email) {

    window.location.href =
        `view-profile.html?email=${encodeURIComponent(email)}`;
}


loadFreelancers();
