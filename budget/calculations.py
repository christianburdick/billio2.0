from datetime import date, timedelta
from calendar import monthrange


def add_months(original_date, months):
    month = original_date.month - 1 + months
    year = original_date.year + month // 12
    month = month % 12 + 1

    day = min(
        original_date.day,
        monthrange(year, month)[1]
    )

    return date(year, month, day)


def get_next_pay_date(pay_date, frequency):
    if frequency == "weekly":
        return pay_date + timedelta(days=7)

    if frequency == "biweekly":
        return pay_date + timedelta(days=14)

    if frequency == "monthly":
        return add_months(pay_date, 1)

    raise ValueError("Invalid pay frequency")


def get_pay_period(pay_date, frequency):
    next_pay_date = get_next_pay_date(pay_date, frequency)

    period_start = pay_date
    period_end = next_pay_date - timedelta(days=1)

    return period_start, period_end


def get_bill_occurrences_for_period(bill, period_start, period_end):

    if bill.frequency == "one_time":
        if period_start <= bill.due_date <= period_end:
            return [bill.due_date]

        return []

    occurrences = []

    if bill.frequency == "weekly":
        interval_days = 7

        occurrence = bill.due_date

        while occurrence < period_start:
            occurrence += timedelta(days=interval_days)

        while occurrence <= period_end:
            occurrences.append(occurrence)
            occurrence += timedelta(days=interval_days)

    elif bill.frequency == "biweekly":
        interval_days = 14

        occurrence = bill.due_date

        while occurrence < period_start:
            occurrence += timedelta(days=interval_days)

        while occurrence <= period_end:
            occurrences.append(occurrence)
            occurrence += timedelta(days=interval_days)

    elif bill.frequency in ("monthly", "quarterly", "yearly"):
        if bill.frequency == "monthly":
            interval_months = 1
        elif bill.frequency == "quarterly":
            interval_months = 3
        else:
            interval_months = 12

        month_number = 0

        occurrence = add_months(
            bill.due_date,
            month_number
        )

        while occurrence < period_start:
            month_number += interval_months

            occurrence = add_months(
                bill.due_date,
                month_number
            )

        while occurrence <= period_end:
            occurrences.append(occurrence)

            month_number += interval_months

            occurrence = add_months(
                bill.due_date,
                month_number
            )

    return occurrences


def calculate_remaining(paycheck, bill_occurrences):
    total_bills = sum(
        bill.amount
        for bill, occurrence_date in bill_occurrences
    )

    remaining = paycheck - total_bills

    return total_bills, remaining


def get_all_bill_occurrences(bills, period_start, period_end):
    all_occurrences = []

    for bill in bills:
        occurrence_dates = get_bill_occurrences_for_period(
            bill,
            period_start,
            period_end
        )

        for occurrence_date in occurrence_dates:
            all_occurrences.append(
                (bill, occurrence_date)
            )

    return all_occurrences
