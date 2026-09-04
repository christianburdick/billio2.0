const billsCard =
    document.getElementById("bills-card");

const updatePayButton =
    document.getElementById("update-pay-button");

const paycheckCard =
    document.getElementById("paycheck-card");

const updatePayModal =
    document.getElementById("update-pay-modal");


// ----------------------------------------
// Add a new bill inline
// ----------------------------------------

if (billsCard) {

    billsCard.addEventListener("click", function () {

        fetch("/bill/add/", {

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

            if (!data.success) {
                return;
            }

            updateDashboard(data);

        });

    });

}


// ----------------------------------------
// Show Update Paycheck form
// ----------------------------------------

if (updatePayModal) {

    function openUpdatePaycheck() {

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

            if (
                event.target.closest(".bill-delete") ||
                event.target.closest(".bill-name-input") ||
                event.target.closest(".bill-amount-input") ||
                event.target.closest(".bill-date-input") ||
                event.target.closest(".bill-frequency-input")
            ) {
                return;
            }


            if (bill.classList.contains("selected")) {

                bill.classList.remove("selected");


                const deleteButton =
                    bill.querySelector(".bill-delete");


                if (deleteButton) {

                    deleteButton.classList.remove(
                        "delete-confirm"
                    );

                    deleteButton.textContent = "×";

                }


                return;

            }


            document
                .querySelectorAll(".bill.selected")
                .forEach(function (selectedBill) {

                    selectedBill.classList.remove(
                        "selected"
                    );


                    const deleteButton =
                        selectedBill.querySelector(
                            ".bill-delete"
                        );


                    if (deleteButton) {

                        deleteButton.classList.remove(
                            "delete-confirm"
                        );

                        deleteButton.textContent = "×";

                    }

                });


            bill.classList.add("selected");

        });

    });

}


// ----------------------------------------
// Bill deletion
// ----------------------------------------

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


            if (!button.classList.contains("delete-confirm")) {

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


    // Remember the currently selected bill.

    const selectedBill =
        document.querySelector(".bill.selected");

    const selectedBillId =
        selectedBill
            ? selectedBill.dataset.billId
            : null;


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
            `$${parseFloat(data.total_bills).toFixed(2)}`;

    }


    // Replace bill list.

    const billsList =
        document.querySelector(".bills-list");


    if (!billsList) {
        return;
    }


    billsList.innerHTML =
        data.bills_html || "";


    // Reattach all bill event listeners.

    initializeBillEditing();
    initializeBillSorting();


    // ----------------------------------------
    // New bill creation flow
    // ----------------------------------------

    if (data.new_bill_id) {

        const newBill =
            document.querySelector(
                `.bill[data-bill-id="${data.new_bill_id}"]`
            );


        if (!newBill) {
            return;
        }


        // Select the new bill.

        newBill.classList.add("selected");


        const nameElement =
            newBill.querySelector(".bill-name");

        const nameInput =
            newBill.querySelector(".bill-name-input");


        if (!nameElement || !nameInput) {
            return;
        }


        // Open the name field.

        nameElement.classList.add("editing");

        nameInput.focus();

        nameInput.select();


        // ----------------------------------------
        // New bill: Name → Amount
        // ----------------------------------------

        nameInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key !== "Enter") {
                    return;
                }


                event.preventDefault();

                event.stopPropagation();


                const name =
                    nameInput.value.trim();


                if (!name) {
                    return;
                }


                nameInput.dataset.creationCompleted =
                    "true";


                const billId =
                    newBill.dataset.billId;


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

                .then(function (saveData) {

                    if (!saveData.success) {
                        return;
                    }


                    nameElement.classList.remove(
                        "editing"
                    );


                    const updatedBill =
                        document.querySelector(
                            `.bill[data-bill-id="${billId}"]`
                        );


                    if (!updatedBill) {
                        return;
                    }


                    updatedBill.classList.add("selected");


                    const amountElement =
                        updatedBill.querySelector(
                            ".bill-amount"
                        );

                    const amountInput =
                        updatedBill.querySelector(
                            ".bill-amount-input"
                        );


                    if (
                        amountElement &&
                        amountInput
                    ) {

                        amountElement.classList.add(
                            "editing"
                        );

                        amountInput.focus();

                        amountInput.select();


                        initializeCreationAmountFlow(
                            updatedBill,
                            amountInput
                        );

                    }

                });

            }
        );


        // ----------------------------------------
        // New bill: Empty name → Untitled
        // ----------------------------------------

        nameInput.addEventListener(
            "blur",
            function () {

                if (
                    nameInput.dataset.creationCompleted ===
                    "true"
                ) {
                    return;
                }


                const name =
                    nameInput.value.trim();


                if (!name) {

                    const billId =
                        newBill.dataset.billId;


                    nameInput.value =
                        "Untitled";

                    nameInput.defaultValue =
                        "Untitled";


                    nameElement.classList.remove(
                        "editing"
                    );


                    const display =
                        newBill.querySelector(
                            ".bill-name-display"
                        );


                    if (display) {

                        display.textContent =
                            "Untitled";

                    }


                    fetch(`/bill/${billId}/name/`, {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded",

                            "X-CSRFToken":
                                getCookie("csrftoken")
                        },

                        body:
                            `name=${encodeURIComponent(
                                "Untitled"
                            )}`

                    });

                }

            }
        );

    }


    // ----------------------------------------
    // Restore previous selected bill
    // ----------------------------------------

    else if (selectedBillId) {

        const updatedBill =
            document.querySelector(
                `.bill[data-bill-id="${selectedBillId}"]`
            );


        if (updatedBill) {

            updatedBill.classList.add("selected");

        }

    }

}


// ----------------------------------------
// Creation: Amount → Date
// ----------------------------------------

function initializeCreationAmountFlow(
    bill,
    amountInput
) {

    if (
        amountInput.dataset.creationFlowInitialized ===
        "true"
    ) {
        return;
    }


    amountInput.dataset.creationFlowInitialized =
        "true";


    amountInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Enter") {
                return;
            }


            event.preventDefault();

            event.stopPropagation();


            const amount =
                amountInput.value.trim();


            if (!amount) {
                return;
            }


            const billId =
                bill.dataset.billId;


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

            .then(function (saveData) {

                if (!saveData.success) {
                    return;
                }


                updateDashboard(saveData);


                const updatedBill =
                    document.querySelector(
                        `.bill[data-bill-id="${billId}"]`
                    );


                if (!updatedBill) {
                    return;
                }


                updatedBill.classList.add("selected");


                const dateElement =
                    updatedBill.querySelector(
                        ".bill-date"
                    );

                const dateInput =
                    updatedBill.querySelector(
                        ".bill-date-input"
                    );


                if (!dateElement || !dateInput) {
                    return;
                }


                dateElement.classList.add("editing");


                initializeCreationDateFlow(
                    updatedBill,
                    dateInput
                );


                dateInput.focus();

            });

        }
    );

}


// ----------------------------------------
// Creation: Date → Frequency
// ----------------------------------------

function initializeCreationDateFlow(
    bill,
    dateInput
) {

    if (
        dateInput.dataset.creationFlowInitialized ===
        "true"
    ) {
        return;
    }


    dateInput.dataset.creationFlowInitialized =
        "true";


    dateInput.addEventListener(
        "change",
        function () {

            const date =
                dateInput.value;


            if (!date) {
                return;
            }


            const billId =
                bill.dataset.billId;


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

            .then(function (saveData) {

                if (!saveData.success) {
                    return;
                }


                updateDashboard(saveData);


                const updatedBill =
                    document.querySelector(
                        `.bill[data-bill-id="${billId}"]`
                    );


                if (!updatedBill) {
                    return;
                }


                updatedBill.classList.add("selected");


                const frequencyElement =
                    updatedBill.querySelector(
                        ".bill-frequency"
                    );

                const frequencyInput =
                    updatedBill.querySelector(
                        ".bill-frequency-input"
                    );


                if (
                    !frequencyElement ||
                    !frequencyInput
                ) {
                    return;
                }


                initializeCreationFrequencyFlow(
                    updatedBill,
                    frequencyInput
                );


                frequencyElement.classList.add(
                    "editing"
                );


                frequencyInput.focus();

            });

        }
    );

}


// ----------------------------------------
// Creation: Frequency → Finish
// ----------------------------------------

function initializeCreationFrequencyFlow(
    bill,
    frequencyInput
) {

    if (
        frequencyInput.dataset.creationFlowInitialized ===
        "true"
    ) {
        return;
    }


    frequencyInput.dataset.creationFlowInitialized =
        "true";


    frequencyInput.addEventListener(
        "change",
        function () {

            const frequency =
                frequencyInput.value;


            if (!frequency) {
                return;
            }


            const billId =
                bill.dataset.billId;


            fetch(`/bill/${billId}/frequency/`, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",

                    "X-CSRFToken":
                        getCookie("csrftoken")
                },

                body:
                    `frequency=${encodeURIComponent(
                        frequency
                    )}`

            })

            .then(function (response) {

                return response.json();

            })

            .then(function (saveData) {

                if (!saveData.success) {
                    return;
                }


                updateDashboard(saveData);


                const finishedBill =
                    document.querySelector(
                        `.bill[data-bill-id="${billId}"]`
                    );


                if (finishedBill) {

                    finishedBill.classList.add(
                        "selected"
                    );

                }

            });

        }
    );

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
// Bill drag-and-drop ordering
// ----------------------------------------

function initializeBillSorting() {

    const currentBills =
        document.getElementById("current-bills");

    const upcomingBills =
        document.getElementById("upcoming-bills");


    if (currentBills) {

        new Sortable(currentBills, {

            animation: 200,

            delay: 200,

            draggable: ".bill",

            forceFallback: true,

            group: {
                name: "current-bills",
                pull: false,
                put: false,
            },

            onStart: function () {

                console.log(
                    "Started dragging current bill"
                );

            },

            onEnd: function () {

                console.log(
                    "Finished dragging current bill"
                );

                saveBillOrder(currentBills);

            },

        });

    }


    if (upcomingBills) {

        new Sortable(upcomingBills, {

            animation: 200,

            delay: 200,

            draggable: ".bill",

            forceFallback: true,

            group: {
                name: "upcoming-bills",
                pull: false,
                put: false,
            },

            onStart: function () {

                console.log(
                    "Started dragging upcoming bill"
                );

            },

            onEnd: function () {

                console.log(
                    "Finished dragging upcoming bill"
                );

                saveBillOrder(upcomingBills);

            },

        });

    }

}


// ----------------------------------------
// Save bill order
// ----------------------------------------

function saveBillOrder(container) {

    const billIds =
        Array.from(
            container.querySelectorAll(".bill")
        ).map(function (bill) {

            return bill.dataset.billId;

        });


    console.log(
        "Saving bill order:",
        billIds
    );


    fetch("/bill/reorder/", {

        method: "POST",

        headers: {
            "Content-Type":
                "application/json",

            "X-CSRFToken":
                getCookie("csrftoken"),

        },

        body: JSON.stringify({

            bill_ids: billIds,

        }),

    })
        .then(function (response) {

            return response.json();

        })
        .then(function (data) {

            console.log(
                "Reorder response:",
                data
            );

        })
        .catch(function (error) {

            console.error(
                "Reorder failed:",
                error
            );

        });

}


// ----------------------------------------
// Initial bill setup
// ----------------------------------------

initializeBillEditing();
initializeBillSorting();


// ----------------------------------------
// Close Update Paycheck modal
// ----------------------------------------

if (updatePayModal) {

    updatePayModal.addEventListener(
        "click",
        function (event) {

            if (event.target === updatePayModal) {

                updatePayModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


// ----------------------------------------
// Escape key closes Update Paycheck modal
// ----------------------------------------

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            if (updatePayModal) {

                updatePayModal.classList.remove(
                    "show"
                );

            }

        }

    }
);


// ----------------------------------------
// Deselect bill when clicking outside
// ----------------------------------------

document.addEventListener(
    "click",
    function (event) {

        if (!event.target.closest(".bill")) {

            document
                .querySelectorAll(".bill.selected")
                .forEach(function (bill) {

                    bill.classList.remove(
                        "selected"
                    );

                });

        }

    }
);
