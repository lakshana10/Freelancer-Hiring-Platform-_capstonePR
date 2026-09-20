// =========================================
// CONTRACTS
// =========================================

const API_URL =
    "http://localhost:8080/api/contracts";

const PAYMENT_API_URL =
    "http://localhost:8080/api/payments";


// =========================================
// GET LOGGED-IN USER
// =========================================

const loggedInUser =
    JSON.parse(
        localStorage.getItem("loggedInUser")
    );

const userEmail =
    localStorage.getItem("userEmail") ||
    (loggedInUser
        ? loggedInUser.email
        : null);


const container =
    document.getElementById(
        "contractsContainer"
    );


// =========================================
// LOAD CONTRACTS
// =========================================

async function loadContracts() {

    if (!userEmail) {

        container.innerHTML = `
            <div class="no-contracts">

                <div class="empty-icon">
                    🔐
                </div>

                <h2>
                    Please Login
                </h2>

                <p>
                    You need to login to view your contracts.
                </p>

                <a
                    href="login.html"
                    class="jobs-btn">

                    Login

                </a>

            </div>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/freelancer/${encodeURIComponent(
                    userEmail
                )}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load contracts"
            );

        }


        const contracts =
            await response.json();


        // =========================================
        // NO CONTRACTS
        // =========================================

        if (contracts.length === 0) {

            container.innerHTML = `
                <div class="no-contracts">

                    <div class="empty-icon">
                        📄
                    </div>

                    <h2>
                        No Contracts Yet
                    </h2>

                    <p>
                        You don't have any contracts yet.
                        Apply for jobs and start working with clients.
                    </p>

                    <a
                        href="jobs.html"
                        class="jobs-btn">

                        Find Jobs →

                    </a>

                </div>
            `;

            return;
        }


        container.innerHTML = "";


        // =========================================
        // DISPLAY CONTRACTS
        // =========================================

        contracts.forEach(contract => {

            const card =
                document.createElement("div");


            card.className =
                "contract-card";


            const status =
                contract.status || "ACTIVE";


            card.innerHTML = `

                <div class="contract-top">

                    <div class="contract-title-section">

                        <div class="contract-icon">
                            📄
                        </div>

                        <div>

                            <h3>
                                ${escapeHTML(
                                    contract.jobTitle ||
                                    "Untitled Job"
                                )}
                            </h3>

                            <div class="contract-number">
                                Contract #${contract.id}
                            </div>

                        </div>

                    </div>


                    <div class="status">

                        <span class="status-dot"></span>

                        ${escapeHTML(status)}

                    </div>

                </div>


                <div class="contract-details">

                    <div class="detail-box">

                        <span class="detail-label">
                            Job ID
                        </span>

                        <span class="detail-value">
                            #${contract.jobId}
                        </span>

                    </div>


                    <div class="detail-box">

                        <span class="detail-label">
                            Client
                        </span>

                        <span class="detail-value">
                            ${escapeHTML(
                                contract.clientEmail
                            )}
                        </span>

                    </div>


                    <div class="detail-box">

                        <span class="detail-label">
                            Freelancer
                        </span>

                        <span class="detail-value">
                            ${escapeHTML(
                                contract.freelancerEmail
                            )}
                        </span>

                    </div>


                    <div class="detail-box">

                        <span class="detail-label">
                            Contract Status
                        </span>

                        <span class="detail-value">
                            ${escapeHTML(status)}
                        </span>

                    </div>

                </div>


                <div class="contract-footer">

                    <div class="contract-info">

                        Contract ID:

                        <strong>
                            #${contract.id}
                        </strong>

                    </div>


                    <div class="contract-actions">

                        <button
                            class="details-btn"
                            onclick="showContractDetails(
                                ${contract.id}
                            )">

                            View Details

                        </button>


                        <button
                            class="payment-btn"
                            onclick="createPayment(
                                ${contract.id},
                                ${contract.jobId},
                                '${escapeValue(contract.jobTitle)}',
                                '${escapeValue(contract.clientEmail)}',
                                '${escapeValue(contract.freelancerEmail)}'
                            )">

                            💳 Payment

                        </button>


                        <button
                            class="message-btn"
                            onclick="openMessage(
                                '${escapeValue(contract.clientEmail)}'
                            )">

                            💬 Message Client

                        </button>

                    </div>

                </div>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Contract loading error:",
            error
        );


        container.innerHTML = `
            <div class="no-contracts">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Contracts
                </h2>

                <p>
                    Please make sure the backend is running.
                </p>

                <button
                    class="jobs-btn"
                    onclick="loadContracts()">

                    Try Again

                </button>

            </div>
        `;

    }

}


// =========================================
// MESSAGE CLIENT
// =========================================

function openMessage(clientEmail) {

    if (!clientEmail) {

        alert(
            "Client email not found."
        );

        return;
    }


    if (
        !loggedInUser ||
        !loggedInUser.email
    ) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;
    }


    if (
        loggedInUser.role &&
        loggedInUser.role !== "FREELANCER"
    ) {

        alert(
            "Only freelancers can message clients from this page."
        );

        return;
    }


    window.location.href =
        `messages.html?receiver=${encodeURIComponent(
            clientEmail
        )}`;

}


// =========================================
// SAFE HTML
// =========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// =========================================
// SAFE VALUE FOR BUTTON
// =========================================

function escapeValue(value) {

    if (!value) {

        return "";

    }


    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}


// =========================================
// CONTRACT DETAILS
// =========================================

function showContractDetails(id) {

    const cards =
        document.querySelectorAll(
            ".contract-card"
        );


    let selectedContract =
        null;


    cards.forEach(card => {

        const number =
            card.querySelector(
                ".contract-number"
            );


        if (
            number &&
            number.textContent.includes(
                `Contract #${id}`
            )
        ) {

            selectedContract =
                card;

        }

    });


    if (!selectedContract) {

        alert(
            "Contract details not found."
        );

        return;
    }


    const title =
        selectedContract.querySelector(
            "h3"
        ).textContent;


    const details =
        selectedContract.querySelectorAll(
            ".detail-value"
        );


    const jobId =
        details[0]
            ? details[0].textContent
            : "-";


    const client =
        details[1]
            ? details[1].textContent
            : "-";


    const freelancer =
        details[2]
            ? details[2].textContent
            : "-";


    const status =
        details[3]
            ? details[3].textContent
            : "-";


    alert(
        "Contract Details\n\n" +

        "Contract ID: #" +
        id +

        "\nJob Title: " +
        title +

        "\nJob ID: " +
        jobId +

        "\nClient: " +
        client +

        "\nFreelancer: " +
        freelancer +

        "\nStatus: " +
        status
    );

}


// =========================================
// CREATE PAYMENT
// =========================================

async function createPayment(
    contractId,
    jobId,
    jobTitle,
    clientEmail,
    freelancerEmail
) {

    const amountInput =
        prompt(
            "Enter payment amount (₹):"
        );


    if (amountInput === null) {

        return;

    }


    const amount =
        Number(amountInput);


    if (
        isNaN(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid amount."
        );

        return;
    }


    try {

        const existingResponse =
            await fetch(
                `${PAYMENT_API_URL}/contract/${contractId}`
            );


        if (!existingResponse.ok) {

            throw new Error(
                "Failed to check existing payment"
            );

        }


        const existingPayments =
            await existingResponse.json();


        if (
            existingPayments.length > 0
        ) {

            alert(
                "A payment already exists for this contract."
            );

            return;

        }


        const payment = {

            contractId:
                contractId,

            jobId:
                jobId,

            jobTitle:
                jobTitle,

            clientEmail:
                clientEmail,

            freelancerEmail:
                freelancerEmail,

            amount:
                amount,

            status:
                "PENDING"

        };


        const response =
            await fetch(
                PAYMENT_API_URL,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            payment
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to create payment"
            );

        }


        alert(
            "Payment created successfully! 💳"
        );


        window.location.href =
            "my-payments.html";


    } catch (error) {

        console.error(
            "Payment error:",
            error
        );


        alert(
            "Unable to create payment. Please check the backend."
        );

    }

}


// =========================================
// DARK MODE
// =========================================

const themeBtn =
    document.getElementById(
        "themeBtn"
    );


if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        function () {

            document.body
                .classList
                .toggle("dark");


            if (
                document.body
                    .classList
                    .contains("dark")
            ) {

                themeBtn.textContent =
                    "☀";

            } else {

                themeBtn.textContent =
                    "☾";

            }

        }
    );

}


// =========================================
// START
// =========================================

loadContracts();