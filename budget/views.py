from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.http import JsonResponse
import json
from datetime import date
from decimal import Decimal, InvalidOperation

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
            "bills_in_period": [],
            "bills_outside_period": bills,
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

    bills_in_period = {
        bill.id
        for bill, occurrence_date in bill_occurrences
    }

    bills_in_period_list = sorted(
        [
            (bill, occurrence_date)
            for bill, occurrence_date in bill_occurrences
        ],
        key=lambda item: item[0].sort_order
    )

    # Group occurrences by bill for the UI.

    bill_occurrences_by_bill = {}

    for bill, occurrence_date in bill_occurrences:

        if bill.id not in bill_occurrences_by_bill:

            bill_occurrences_by_bill[bill.id] = {
                "bill": bill,
                "occurrence_dates": [],
            }

        bill_occurrences_by_bill[
            bill.id
        ]["occurrence_dates"].append(
            occurrence_date
        )

    grouped_bill_occurrences = sorted(
        bill_occurrences_by_bill.values(),
        key=lambda item: item["bill"].sort_order
    )

    bills_outside_period = sorted(
        [
            bill
            for bill in bills
            if bill.id not in bills_in_period
        ],
        key=lambda bill: bill.sort_order
    )

    return {
        "income": income,
        "bills": bills,
        "period_start": period_start,
        "period_end": period_end,

        # Original occurrence structure.
        "bill_occurrences": bills_in_period_list,

        # Grouped structure for the UI.
        "grouped_bill_occurrences": grouped_bill_occurrences,

        "bills_in_period": bills_in_period,
        "bills_outside_period": bills_outside_period,
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
            ),
            "grouped_bill_occurrences": dashboard.get(
                "grouped_bill_occurrences",
                []
            ),
            "bills_outside_period": dashboard.get(
                "bills_outside_period",
                []
            ),
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

    bills_in_period = {
        bill.id
        for bill, occurrence_date
        in dashboard.get("bill_occurrences", [])
    }

    # Use the existing income as the form instance
    # so the Update Paycheck form contains
    # the current paycheck information.

    if dashboard["income"]:
        income_form = IncomeForm(
            instance=dashboard["income"]
        )
    else:
        income_form = IncomeForm()

    context = {
        "income": dashboard["income"],
        "bills": dashboard["bills"],
        "bills_in_period": bills_in_period,
        "income_form": income_form,
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

        return JsonResponse({
            "success": True,
            **dashboard_json(),
        })

    return JsonResponse({
        "success": False,
    }, status=405)


def update_bill_amount(request, bill_id):

    if request.method == "POST":

        bill = Bill.objects.get(id=bill_id)

        amount = request.POST.get("amount", "").strip()

        try:
            amount = Decimal(amount)
        except (InvalidOperation, ValueError):
            return JsonResponse({
                "success": False,
                "error": "Invalid amount"
            })

        if amount < Decimal("0"):
            return JsonResponse({
                "success": False,
                "error": "Amount cannot be negative"
            })

        if amount > Decimal("99999999.99"):
            return JsonResponse({
                "success": False,
                "error": "Amount is too large"
            })

        if amount.as_tuple().exponent < -2:
            return JsonResponse({
                "success": False,
                "error": "Amount can have at most 2 decimal places"
            })

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


def add_bill(request):

    if request.method == "POST":

        bill = Bill.objects.create(
            name="",
            amount=Decimal("0.00"),
            due_date=date.today(),
            frequency="one_time",
        )

        return JsonResponse({
            "success": True,
            **dashboard_json(),
            "new_bill_id": bill.id,
        })

    return JsonResponse({
        "success": False,
    }, status=405)

def reorder_bills(request):

    if request.method != "POST":
        return JsonResponse({
            "success": False,
        }, status=405)

    try:
        data = json.loads(request.body)
        bill_ids = data.get("bill_ids", [])

    except (json.JSONDecodeError, AttributeError):
        return JsonResponse({
            "success": False,
            "error": "Invalid request",
        }, status=400)

    if not isinstance(bill_ids, list):
        return JsonResponse({
            "success": False,
            "error": "Invalid bill order",
        }, status=400)

    bills = Bill.objects.filter(id__in=bill_ids)

    if bills.count() != len(bill_ids):
        return JsonResponse({
            "success": False,
            "error": "Invalid bill IDs",
        }, status=400)

    bills_by_id = {
        str(bill.id): bill
        for bill in bills
    }

    for index, bill_id in enumerate(bill_ids):

        bill = bills_by_id[str(bill_id)]

        bill.sort_order = index
        bill.save(update_fields=["sort_order"])

    return JsonResponse({
        "success": True,
    })
