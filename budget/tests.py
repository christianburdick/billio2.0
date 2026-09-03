from datetime import date

from django.test import TestCase

from .models import Bill
from .calculations import (
    get_pay_period,
    get_bill_occurrences_for_period,
    calculate_remaining,
)

class PayPeriodTests(TestCase):

    def test_biweekly_pay_period(self):
        pay_date = date(2026, 9, 11)

        start, end = get_pay_period(
            pay_date,
            "biweekly"
        )

        self.assertEqual(
            start,
            date(2026, 9, 11)
        )

        self.assertEqual(
            end,
            date(2026, 9, 24)
        )


class BillOccurrenceTests(TestCase):

    def test_monthly_bill_in_pay_period(self):
        bill = Bill(
            name="Netflix",
            amount=15.99,
            due_date=date(2026, 9, 15),
            frequency="monthly",
        )

        occurrences = get_bill_occurrences_for_period(
            bill,
            date(2026, 9, 11),
            date(2026, 9, 24),
        )

        self.assertEqual(
            occurrences,
            [date(2026, 9, 15)]
        )

    def test_monthly_bill_outside_pay_period(self):
        bill = Bill(
            name="Netflix",
            amount=15.99,
            due_date=date(2026, 9, 28),
            frequency="monthly",
        )

        occurrences = get_bill_occurrences_for_period(
            bill,
            date(2026, 9, 11),
            date(2026, 9, 24),
        )

        self.assertEqual(
            occurrences,
            []
        )

    def test_weekly_bill_multiple_occurrences(self):
        bill = Bill(
            name="Weekly Subscription",
            amount=10.00,
            due_date=date(2026, 9, 5),
            frequency="weekly",
        )

        occurrences = get_bill_occurrences_for_period(
            bill,
            date(2026, 9, 11),
            date(2026, 9, 24),
        )

        self.assertEqual(
            occurrences,
            [
                date(2026, 9, 12),
                date(2026, 9, 19),
            ]
        )

    def test_biweekly_bill_occurrences(self):
        bill = Bill(
            name="Phone",
            amount=75.00,
            due_date=date(2026, 9, 4),
            frequency="biweekly",
        )

        occurrences = get_bill_occurrences_for_period(
            bill,
            date(2026, 9, 11),
            date(2026, 10, 8),
        )

        self.assertEqual(
            occurrences,
            [
                date(2026, 9, 18),
                date(2026, 10, 2),
            ]
        )

    def test_one_time_bill_in_pay_period(self):
        bill = Bill(
            name="Concert Ticket",
            amount=75.00,
            due_date=date(2026, 9, 20),
            frequency="one_time",
        )

        occurrences = get_bill_occurrences_for_period(
            bill,
            date(2026, 9, 11),
            date(2026, 9, 24),
        )

        self.assertEqual(
            occurrences,
            [date(2026, 9, 20)]
        )

    def test_one_time_bill_does_not_recur(self):
        bill = Bill(
            name="Concert Ticket",
            amount=75.00,
            due_date=date(2026, 9, 20),
            frequency="one_time",
        )

        occurrences = get_bill_occurrences_for_period(
            bill,
            date(2026, 9, 25),
            date(2026, 10, 8),
        )

        self.assertEqual(
            occurrences,
            []
        )

    def test_calculate_remaining(self):
        bill_1 = Bill(
            name="Rent",
            amount=950.00,
            due_date=date(2026, 9, 15),
            frequency="monthly",
        )

        bill_2 = Bill(
            name="Netflix",
            amount=15.99,
            due_date=date(2026, 9, 18),
            frequency="monthly",
        )

        bill_occurrences = [
            (bill_1, date(2026, 9, 15)),
            (bill_2, date(2026, 9, 18)),
        ]

        total_bills, remaining = calculate_remaining(
            1850.00,
            bill_occurrences
        )

        self.assertEqual(
            total_bills,
            965.99
        )

        self.assertEqual(
            remaining,
            884.01
        )

    def test_quarterly_bill_occurrences(self):
        bill = Bill(
            name="Car Insurance",
            amount=300.00,
            due_date=date(2026, 6, 15),
            frequency="quarterly",
        )

        occurrences = get_bill_occurrences_for_period(
            bill,
            date(2026, 9, 1),
            date(2026, 12, 31),
        )

        self.assertEqual(
            occurrences,
            [
                date(2026, 9, 15),
                date(2026, 12, 15),
            ]
        )

    def test_yearly_bill_occurrences(self):
        bill = Bill(
            name="Annual Subscription",
            amount=120.00,
            due_date=date(2025, 10, 15),
            frequency="yearly",
        )

        occurrences = get_bill_occurrences_for_period(
            bill,
            date(2026, 10, 1),
            date(2026, 10, 31),
        )

        self.assertEqual(
            occurrences,
            [
                date(2026, 10, 15),
            ]
        )

    def test_weekly_pay_period(self):
        start, end = get_pay_period(
            date(2026, 9, 3),
            "weekly",
        )

        self.assertEqual(
            start,
            date(2026, 9, 3)
        )

        self.assertEqual(
            end,
            date(2026, 9, 9)
        )

    def test_monthly_pay_period(self):
        start, end = get_pay_period(
            date(2026, 9, 15),
            "monthly",
        )

        self.assertEqual(
            start,
            date(2026, 9, 15)
        )

        self.assertEqual(
            end,
            date(2026, 10, 14)
        )

    def test_bill_on_pay_period_boundaries(self):
        bill = Bill(
            name="Electric",
            amount=100.00,
            due_date=date(2026, 9, 10),
            frequency="one_time",
        )

        # Pay period: September 3–10
        occurrences = get_bill_occurrences_for_period(
            bill,
            date(2026, 9, 3),
            date(2026, 9, 10),
        )

        self.assertEqual(
            occurrences,
            [
                date(2026, 9, 10),
            ]
        )

    def test_bill_on_first_day_of_pay_period(self):
        bill = Bill(
            name="Rent",
            amount=1200.00,
            due_date=date(2026, 9, 3),
            frequency="one_time",
        )

        occurrences = get_bill_occurrences_for_period(
            bill,
            date(2026, 9, 3),
            date(2026, 9, 10),
        )

        self.assertEqual(
            occurrences,
            [
                date(2026, 9, 3),
            ]
        )
