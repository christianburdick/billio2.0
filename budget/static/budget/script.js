const addButton = document.getElementById("add-button");
const actionMenu = document.getElementById("action-menu");

const addBillButton = document.getElementById("add-bill-button");
const addBillForm = document.getElementById("add-bill-form");

const updatePayButton = document.getElementById("update-pay-button");
const updatePayForm = document.getElementById("update-pay-form");


// Open / close action menu

addButton.addEventListener("click", function () {
    actionMenu.classList.toggle("show");
    addButton.classList.toggle("open");
});


// Show Add Bill form

addBillButton.addEventListener("click", function () {
    actionMenu.classList.remove("show");

    addBillForm.style.display = "block";
});


// Show Update Paycheck form

updatePayButton.addEventListener("click", function () {
    actionMenu.classList.remove("show");

    updatePayForm.style.display = "block";
});


// Expand / collapse bill actions

const bills = document.querySelectorAll(".bill");

bills.forEach(function (bill) {

    bill.addEventListener("click", function () {
        bill.classList.toggle("selected");
    });

});


// Prevent Edit / Delete clicks from toggling the bill

const billDetailActions = document.querySelectorAll(".bill-detail-actions");

billDetailActions.forEach(function (actions) {

    actions.addEventListener("click", function (event) {
        event.stopPropagation();
    });

});
