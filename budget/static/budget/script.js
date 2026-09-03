const addButton = document.getElementById("add-button");
const actionMenu = document.getElementById("action-menu");

const addBillButton =
    document.getElementById("add-bill-button");

const addBillForm =
    document.getElementById("add-bill-form");

const addBillModal =
    document.getElementById("add-bill-modal");

const updatePayButton =
    document.getElementById("update-pay-button");

const paycheckCard =
    document.getElementById("paycheck-card");

const updatePayForm =
    document.getElementById("update-pay-form");

const updatePayModal =
    document.getElementById("update-pay-modal");


// ----------------------------------------
// Floating action menu
// ----------------------------------------

if (addButton && actionMenu) {

    addButton.addEventListener("click", function (event) {

        event.stopPropagation();

        actionMenu.classList.toggle("show");
        addButton.classList.toggle("open");

    });


    actionMenu.addEventListener("click", function (event) {

        event.stopPropagation();

    });


    document.addEventListener("click", function () {

        actionMenu.classList.remove("show");
        addButton.classList.remove("open");

    });

}


// ----------------------------------------
// Show Add Bill form
// ----------------------------------------

if (addBillButton && addBillModal) {

    addBillButton.addEventListener("click", function () {

        actionMenu.classList.remove("show");
        addButton.classList.remove("open");

        addBillModal.classList.add("show");

    });

}


// ----------------------------------------
// Show Update Paycheck form
// ----------------------------------------

if (updatePayModal) {

    function openUpdatePaycheck() {

        if (actionMenu) {
            actionMenu.classList.remove("show");
        }

        if (addButton) {
            addButton.classList.remove("open");
        }

        updatePayModal.classList.add("show");

    }


    if (updatePayButton) {

        updatePayButton.addEventListener(
            "click",
            openUpdatePaycheck
        );

    }


    if (paycheckCard) {

        paycheckCard.addEventListener(
            "click",
            openUpdatePaycheck
        );

    }

}


// ----------------------------------------
// Initialize bill editing
// ----------------------------------------

function initializeBillEditing() {

    initializeBillSelection();

    initializeBillDeletion();

    initializeBillAmounts();

    initializeBillDates();

    initializeBillFrequencies();

    initializeBillNames();

}


// ----------------------------------------
// Bill selection
// ----------------------------------------

function initializeBillSelection() {

    const bills =
        document.querySelectorAll(".bill");


    bills.forEach(function (bill) {

        bill.addEventListener("click", function (event) {

            // Do not let clicking the delete X
            // trigger row selection.

            if (event.target.closest(".bill-delete")) {
                return;
            }


            // If this bill is already selected,
            // clicking it again deselects it.

            if (bill.classList.contains("selected")) {

                bill.classList.remove("selected");

                return;
            }


            // Remove selection from every other bill.

            document
                .querySelectorAll(".bill.selected")
                .forEach(function (selectedBill) {

                    selectedBill.classList.remove("selected");

                });


            // Select this bill.

            bill.classList.add("selected");

        });

    });

}

function initializeBillDeletion() {

    const deleteButtons =
        document.querySelectorAll(".bill-delete");


    deleteButtons.forEach(function (button) {

        button.addEventListener("click", function (event) {

            event.stopPropagation();


            const bill =
                button.closest(".bill");


            if (!bill) {
                return;
            }


            // First click arms the delete button.

            if (!button.classList.contains("delete-confirm")) {

                // Remove confirmation from any other bill.

                document
                    .querySelectorAll(".bill-delete.delete-confirm")
                    .forEach(function (otherButton) {

                        otherButton.classList.remove(
                            "delete-confirm"
                        );

                        otherButton.textContent = "×";

                    });


                button.classList.add("delete-confirm");

                button.textContent = "✓";

                return;
            }


            // Second click actually deletes the bill.

            const billId =
                bill.dataset.billId;


            fetch(`/bill/${billId}/delete/`, {

                method: "POST",

                headers: {
                    "X-CSRFToken": getCookie("csrftoken"),
                    "X-Requested-With": "XMLHttpRequest",
                },

            })

            .then(function (response) {

                return response.json();

            })

            .then(function (data) {

                if (data.success) {

                    updateDashboard(data);

                }

            });

        });

    });

}

// ----------------------------------------
// Bill amount editing
// ----------------------------------------

function initializeBillAmounts() {

    const billAmounts =
        document.querySelectorAll(".bill-amount");


    billAmounts.forEach(function (billAmount) {

        const display =
            billAmount.querySelector(
                ".bill-amount-display"
            );

        const input =
            billAmount.querySelector(
                ".bill-amount-input"
            );


        if (!display || !input) {
            return;
        }


        display.addEventListener("click", function (event) {

            event.stopPropagation();


            // Select the bill when editing.

            selectBill(billAmount);


            billAmount.classList.add("editing");

            input.focus();

            input.select();

        });


        input.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                saveBillAmount();

            }


            if (event.key === "Escape") {

                input.value = input.defaultValue;

                billAmount.classList.remove("editing");

            }

        });


        input.addEventListener("blur", function () {

            saveBillAmount();

        });


        function saveBillAmount() {

            const amount = input.value;


            if (!amount) {

                input.value = input.defaultValue;

                billAmount.classList.remove("editing");

                return;

            }


            const billId =
                billAmount.dataset.billId;


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

                    updateDashboard(data);

                }

                billAmount.classList.remove("editing");

            });

        }

    });

}


// ----------------------------------------
// Bill due date editing
// ----------------------------------------

function initializeBillDates() {

    const billDates =
        document.querySelectorAll(".bill-date");


    billDates.forEach(function (billDate) {

        const display =
            billDate.querySelector(
                ".bill-date-display"
            );

        const input =
            billDate.querySelector(
                ".bill-date-input"
            );


        if (!display || !input) {
            return;
        }


        display.addEventListener("click", function (event) {

            event.stopPropagation();


            // Select the bill when editing.

            selectBill(billDate);


            billDate.classList.add("editing");

            input.focus();


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


            const billId =
                billDate.dataset.billId;


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

                    updateDashboard(data);

                }

                billDate.classList.remove("editing");

            });

        }

    });

}


// ----------------------------------------
// Bill frequency editing
// ----------------------------------------

function initializeBillFrequencies() {

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


        if (!display || !input) {
            return;
        }


        display.addEventListener("click", function (event) {

            event.stopPropagation();


            // Select the bill when editing.

            selectBill(billFrequency);


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

                    updateDashboard(data);

                }

                billFrequency.classList.remove("editing");

            });

        }

    });

}


// ----------------------------------------
// Bill name editing
// ----------------------------------------

function initializeBillNames() {

    const billNames =
        document.querySelectorAll(".bill-name");


    billNames.forEach(function (billName) {

        const display =
            billName.querySelector(
                ".bill-name-display"
            );

        const input =
            billName.querySelector(
                ".bill-name-input"
            );


        if (!display || !input) {
            return;
        }


        display.addEventListener("click", function (event) {

            event.stopPropagation();


            // Select the bill when editing.

            selectBill(billName);


            billName.classList.add("editing");

            input.focus();

            input.select();

            resizeNameInput();

        });


        input.addEventListener("input", function () {

            resizeNameInput();

        });


        input.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                saveBillName();

            }


            if (event.key === "Escape") {

                input.value = input.defaultValue;

                billName.classList.remove("editing");

            }

        });


        input.addEventListener("blur", function () {

            saveBillName();

        });


        function resizeNameInput() {

            const textLength =
                Math.max(input.value.length, 1);


            input.style.width =
                `${textLength}ch`;

        }


        function saveBillName() {

            const name =
                input.value.trim();


            if (!name) {

                input.value =
                    input.defaultValue;

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

}


// ----------------------------------------
// Select a bill
// ----------------------------------------

function selectBill(element) {

    const bill =
        element.closest(".bill");


    if (!bill) {
        return;
    }


    document
        .querySelectorAll(".bill.selected")
        .forEach(function (selectedBill) {

            selectedBill.classList.remove("selected");

        });


    bill.classList.add("selected");

}


// ----------------------------------------
// Update dashboard
// ----------------------------------------

function updateDashboard(data) {

    if (!data.success) {
        return;
    }


    // Update remaining amount.

    const remainingAmount =
        document.querySelector(".hero-amount");


    if (remainingAmount) {

        remainingAmount.textContent =
            `$${parseFloat(data.remaining).toFixed(2)}`;

    }


    // Update total bills.

    const totalBills =
        document.querySelector(".bills-total");


    if (totalBills) {

        totalBills.textContent =
            `-$${parseFloat(data.total_bills).toFixed(2)}`;

    }


    // Replace bill list.

    const billsList =
        document.querySelector(".bills-list");


    if (billsList) {

        billsList.innerHTML =
            data.bills_html || "";

        initializeBillEditing();

    }

}


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
// Initial bill setup
// ----------------------------------------

initializeBillEditing();


// ----------------------------------------
// Close Add Bill modal
// ----------------------------------------

if (addBillModal) {

    addBillModal.addEventListener("click", function (event) {

        if (event.target === addBillModal) {

            addBillModal.classList.remove("show");

        }

    });

}


// ----------------------------------------
// Close Update Paycheck modal
// ----------------------------------------

if (updatePayModal) {

    updatePayModal.addEventListener("click", function (event) {

        if (event.target === updatePayModal) {

            updatePayModal.classList.remove("show");

        }

    });

}


// ----------------------------------------
// Escape key closes modal
// ----------------------------------------

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        if (addBillModal) {
            addBillModal.classList.remove("show");
        }

        if (updatePayModal) {
            updatePayModal.classList.remove("show");
        }

    }

});


// ----------------------------------------
// Deselect bill when clicking outside
// ----------------------------------------

document.addEventListener("click", function (event) {

    if (!event.target.closest(".bill")) {

        document
            .querySelectorAll(".bill.selected")
            .forEach(function (bill) {

                bill.classList.remove("selected");

            });

    }

});
