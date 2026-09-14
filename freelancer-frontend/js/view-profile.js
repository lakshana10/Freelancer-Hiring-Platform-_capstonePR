const container = document.getElementById("profileContainer");

const params = new URLSearchParams(window.location.search);
const email = params.get("email");

async function loadProfile() {

    if (!email) {
        container.innerHTML = "<p>Freelancer not selected.</p>";
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:8080/api/users"
        );

        if (!response.ok) {
            throw new Error("Failed to load profile");
        }

        const users = await response.json();

        const freelancer = users.find(
            user => user.email === email &&
                    user.role === "FREELANCER"
        );

        if (!freelancer) {
            container.innerHTML =
                "<p>Freelancer not found.</p>";
            return;
        }

        container.innerHTML = `
            <div class="view-profile-card">

                <div class="profile-icon">
                    ✣
                </div>

                <h1>${freelancer.name}</h1>

                <p class="profile-email">
                    ${freelancer.email}
                </p>

                <div class="profile-details">

                    <div>
                        <h3>Skills</h3>
                        <p>
                            ${freelancer.skills || "Not added"}
                        </p>
                    </div>

                    <div>
                        <h3>Experience</h3>
                        <p>
                            ${freelancer.experience || "Not added"}
                        </p>
                    </div>

                    <div>
                        <h3>About</h3>
                        <p>
                            ${freelancer.bio || "No bio available"}
                        </p>
                    </div>

                </div>

                <button
                    onclick="window.location.href='freelancers.html'">
                    ← Back to Freelancers
                </button>

            </div>
        `;

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <p>
                Unable to load freelancer profile.
            </p>
        `;
    }
}

loadProfile();