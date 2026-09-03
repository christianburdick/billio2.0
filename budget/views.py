from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.http import JsonResponse

from .models import Income, Bill
from .forms import IncomeForm, BillForm
from .calculations import (
    get_pay_period,
    get_all_bill_occurrences,
    calculate_remaining,
)

def get_dashboard_data():

    income = Income.objects.order_by("-pay_date").first()
    bills = Bill.objects.all()

    if not income:
        return {
            "income": None,
            "bills": bills,
        }

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

    return {
        "income": income,
        "bills": bills,
        "period_start": period_start,
        "period_end": period_end,
        "bill_occurrences": bill_occurrences,
        "total_bills": total_bills,
        "remaining": remaining,
    }

def dashboard_json():

    dashboard = get_dashboard_data()

    bills_html = render_to_string(
        "budget/_bill_list.html",
        {
            "bill_occurrences": dashboard.get(
                "bill_occurrences",
                []
            )
        }
    )

    return {
        "total_bills": str(
            dashboard.get("total_bills", 0)
        ),
        "remaining": str(
            dashboard.get("remaining", 0)
        ),
        "bills_html": bills_html,
    }

def home(request):

    if request.method == "POST":

        if request.POST.get("form_type") == "income":

            income = Income.objects.order_by("-pay_date").first()

            if income:
                form = IncomeForm(
                    request.POST,
                    instance=income
                )
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

    dashboard = get_dashboard_data()

    context = {
        "income": dashboard["income"],
        "bills": dashboard["bills"],
        "income_form": IncomeForm(),
        "bill_form": BillForm(),
    }

    context.update({
        key: value
        for key, value in dashboard.items()
        if key not in ["income", "bills"]
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

def update_bill_amount(request, bill_id):

    if request.method == "POST":

        bill = Bill.objects.get(id=bill_id)

        amount = request.POST.get("amount")

        if amount:

            bill.amount = amount
            bill.save()

            return JsonResponse({
                "success": True,
                **dashboard_json(),
            })

    return JsonResponse({
        "success": False
    })

def update_bill_frequency(request, bill_id):

    if request.method == "POST":

        bill = Bill.objects.get(id=bill_id)

        frequency = request.POST.get("frequency")

        valid_frequencies = {
            choice[0]
            for choice in Bill.FREQUENCY_CHOICES
        }

        if frequency in valid_frequencies:

            bill.frequency = frequency
            bill.save()

            return JsonResponse({
                "success": True,
                **dashboard_json(),
            })

    return JsonResponse({
        "success": False
    })

def update_bill_name(request, bill_id):

    if request.method == "POST":

        bill = Bill.objects.get(id=bill_id)

        name = request.POST.get("name", "").strip()

        if name:

            bill.name = name
            bill.save()

            return JsonResponse({
                "success": True
            })

    return JsonResponse({
        "success": False
    })

def update_bill_date(request, bill_id):

    if request.method == "POST":

        bill = Bill.objects.get(id=bill_id)

        due_date = request.POST.get("due_date")

        if due_date:

            bill.due_date = due_date
            bill.save()

            return JsonResponse({
                "success": True,
                **dashboard_json(),
            })

    return JsonResponse({
        "success": False
    })
