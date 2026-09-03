const addButton = document.getElementById("add-button");
const actionMenu = document.getElementById("action-menu");

const addBillButton = document.getElementById("add-bill-button");
const addBillForm = document.getElementById("add-bill-form");

const updatePayButton = document.getElementById("update-pay-button");
const updatePayForm = document.getElementById("update-pay-form");


// ----------------------------------------
// Floating action menu
// ----------------------------------------

addButton.addEventListener("click", function () {

    actionMenu.classList.toggle("show");
    addButton.classList.toggle("open");

});


// ----------------------------------------
// Show Add Bill form
// ----------------------------------------

addBillButton.addEventListener("click", function () {

    actionMenu.classList.remove("show");
    addButton.classList.remove("open");

    addBillForm.style.display = "block";

});


// ----------------------------------------
// Show Update Paycheck form
// ----------------------------------------

updatePayButton.addEventListener("click", function () {

    actionMenu.classList.remove("show");
    addButton.classList.remove("open");

    updatePayForm.style.display = "block";

});


// ----------------------------------------
// Bill amount inline editing
// ----------------------------------------

const billAmounts = document.querySelectorAll(".bill-amount");

billAmounts.forEach(function (billAmount) {

    const display =
        billAmount.querySelector(".bill-amount-display");

    const input =
        billAmount.querySelector(".bill-amount-input");


    // Click the displayed amount to edit it

    display.addEventListener("click", function (event) {

        event.stopPropagation();

        billAmount.classList.add("editing");

        input.focus();
        input.select();

    });


    // Press Enter to save

    input.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            saveBillAmount();
        }


        // Press Escape to cancel

        if (event.key === "Escape") {

            input.value = input.defaultValue;

            billAmount.classList.remove("editing");

        }

    });


    // Clicking away saves the amount

    input.addEventListener("blur", function () {

        saveBillAmount();

    });


    function saveBillAmount() {

        const amount = input.value;


        // Don't save an empty value

        if (!amount) {

            input.value = input.defaultValue;

            billAmount.classList.remove("editing");

            return;

        }


        const billId = billAmount.dataset.billId;


        fetch(`/bill/${billId}/amount/`, {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",

                "X-CSRFToken":
                    getCookie("csrftoken")
            },

            body:
                `amount=${encodeURIComponent(amount)}`

        })

        .then(function (response) {

            return response.json();

        })

        .then(function (data) {

            if (data.success) {

                display.textContent =
                    `$${parseFloat(amount).toFixed(2)}`;

                input.defaultValue = amount;

                updateDashboard(data);

            }

            billAmount.classList.remove("editing");

        });

    }

});


// ----------------------------------------
// Get Django CSRF cookie
// ----------------------------------------

function getCookie(name) {

    const cookies =
        document.cookie.split(";");


    for (let cookie of cookies) {

        cookie = cookie.trim();


        if (cookie.startsWith(name + "=")) {

            return decodeURIComponent(
                cookie.substring(name.length + 1)
            );

        }

    }


    return null;

}

// ----------------------------------------
// Bill due date inline editing
// ----------------------------------------

const billDates = document.querySelectorAll(".bill-date");

billDates.forEach(function (billDate) {

    const display =
        billDate.querySelector(".bill-date-display");

    const input =
        billDate.querySelector(".bill-date-input");


    display.addEventListener("click", function (event) {

        event.stopPropagation();

        billDate.classList.add("editing");

        input.focus();

        // Open the native date picker when supported
        if (input.showPicker) {
            input.showPicker();
        }

    });


    input.addEventListener("change", function () {

        saveBillDate();

    });


    input.addEventListener("blur", function () {

        billDate.classList.remove("editing");

    });


    function saveBillDate() {

        const date = input.value;

        if (!date) {
            return;
        }


        const billId = billDate.dataset.billId;


        fetch(`/bill/${billId}/date/`, {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",

                "X-CSRFToken":
                    getCookie("csrftoken")
            },

            body:
                `due_date=${encodeURIComponent(date)}`

        })

        .then(function (response) {

            return response.json();

        })

        .then(function (data) {

            if (data.success) {

                const parts = date.split("-");

                const localDate = new Date(
                    parts[0],
                    parts[1] - 1,
                    parts[2]
                );

                const formattedDate =
                    localDate.toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        }
                    );

                display.textContent =
                    `Due ${formattedDate}`;

                updateDashboard(data);

            }

            billDate.classList.remove("editing");

        });

    }

});

// ----------------------------------------
// Bill frequency inline editing
// ----------------------------------------

const billFrequencies =
    document.querySelectorAll(".bill-frequency");

billFrequencies.forEach(function (billFrequency) {

    const display =
        billFrequency.querySelector(
            ".bill-frequency-display"
        );

    const input =
        billFrequency.querySelector(
            ".bill-frequency-input"
        );


    display.addEventListener("click", function (event) {

        event.stopPropagation();

        billFrequency.classList.add("editing");

        input.focus();

    });


    input.addEventListener("change", function () {

        saveBillFrequency();

    });


    input.addEventListener("blur", function () {

        billFrequency.classList.remove("editing");

    });


    function saveBillFrequency() {

        const frequency = input.value;

        const billId =
            billFrequency.dataset.billId;


        fetch(`/bill/${billId}/frequency/`, {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",

                "X-CSRFToken":
                    getCookie("csrftoken")
            },

            body:
                `frequency=${encodeURIComponent(frequency)}`

        })

        .then(function (response) {

            return response.json();

        })

        .then(function (data) {

            if (data.success) {

                display.textContent =
                    input.options[input.selectedIndex].text;

                updateDashboard(data);

            }

            billFrequency.classList.remove("editing");

        });

    }

});

// ----------------------------------------
// Bill name inline editing
// ----------------------------------------

const billNames =
    document.querySelectorAll(".bill-name");

billNames.forEach(function (billName) {

    const display =
        billName.querySelector(".bill-name-display");

    const input =
        billName.querySelector(".bill-name-input");


    // Click the name to edit

    display.addEventListener("click", function (event) {

        event.stopPropagation();

        billName.classList.add("editing");

        input.focus();
        input.select();

    });


    // Press Enter to save

    input.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            saveBillName();
        }


        // Escape cancels

        if (event.key === "Escape") {

            input.value = input.defaultValue;

            billName.classList.remove("editing");

        }

    });


    // Clicking away saves

    input.addEventListener("blur", function () {

        saveBillName();

    });


    function saveBillName() {

        const name = input.value.trim();


        // Don't allow an empty name

        if (!name) {

            input.value = input.defaultValue;

            billName.classList.remove("editing");

            return;

        }


        const billId =
            billName.dataset.billId;


        fetch(`/bill/${billId}/name/`, {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",

                "X-CSRFToken":
                    getCookie("csrftoken")
            },

            body:
                `name=${encodeURIComponent(name)}`

        })

        .then(function (response) {

            return response.json();

        })

        .then(function (data) {

            if (data.success) {

                display.textContent = name;

                input.defaultValue = name;

            }

            billName.classList.remove("editing");

        });

    }

});

// ----------------------------------------
// Update dashboard totals
// ----------------------------------------

function updateDashboard(data) {

    if (!data.success) {
        return;
    }


    const remainingAmount =
        document.querySelector(".hero-amount");

    if (remainingAmount) {

        remainingAmount.textContent =
            `$${parseFloat(data.remaining).toFixed(2)}`;

    }


    const totalBills =
        document.querySelector(".bills-total");

    if (totalBills) {

        totalBills.textContent =
            `-$${parseFloat(data.total_bills).toFixed(2)}`;

    }

}
