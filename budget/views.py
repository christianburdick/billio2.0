from django.shortcuts import render, redirect

from .models import Income, Bill
from .forms import IncomeForm, BillForm
from .calculations import (
    get_pay_period,
    get_all_bill_occurrences,
    calculate_remaining,
)


def home(request):

    if request.method == "POST":

        if request.POST.get("form_type") == "income":

            income = Income.objects.order_by("-pay_date").first()

            if income:
                form = IncomeForm(request.POST, instance=income)
            else:
                form = IncomeForm(request.POST)

            if form.is_valid():
                form.save()
                return redirect("home")

        elif request.POST.get("form_type") == "bill":

            form = BillForm(request.POST)

            if form.is_valid():
                form.save()
                return redirect("home")

    income = Income.objects.order_by("-pay_date").first()
    bills = Bill.objects.all()

    income_form = IncomeForm()
    bill_form = BillForm()

    context = {
        "income": income,
        "bills": bills,
        "income_form": income_form,
        "bill_form": bill_form,
    }

    if income:

        period_start, period_end = get_pay_period(
            income.pay_date,
            income.frequency
        )

        bill_occurrences = get_all_bill_occurrences(
            bills,
            period_start,
            period_end
        )

        total_bills, remaining = calculate_remaining(
            income.amount,
            bill_occurrences
        )

        context.update({
            "period_start": period_start,
            "period_end": period_end,
            "bill_occurrences": bill_occurrences,
            "total_bills": total_bills,
            "remaining": remaining,
        })

    return render(
        request,
        "budget/home.html",
        context
    )

def delete_bill(request, bill_id):

    if request.method == "POST":
        bill = Bill.objects.get(id=bill_id)
        bill.delete()

    return redirect("home")


def edit_bill(request, bill_id):

    bill = Bill.objects.get(id=bill_id)

    if request.method == "POST":

        form = BillForm(
            request.POST,
            instance=bill
        )

        if form.is_valid():
            form.save()
            return redirect("home")

    else:
        form = BillForm(instance=bill)

    return render(
        request,
        "budget/edit_bill.html",
        {
            "form": form,
            "bill": bill,
        }
    )
