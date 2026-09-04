from django.db import models


class Income(models.Model):

    FREQUENCY_CHOICES = [
        ("weekly", "Weekly"),
        ("biweekly", "Every 2 weeks"),
        ("monthly", "Monthly"),
    ]

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    pay_date = models.DateField()
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES
    )

    def __str__(self):
        return f"${self.amount} - {self.pay_date}"
    

class Bill(models.Model):

    FREQUENCY_CHOICES = [
        ("one_time", "One time"),
        ("weekly", "Weekly"),
        ("biweekly", "Every 2 weeks"),
        ("monthly", "Monthly"),
        ("quarterly", "Every 3 months"),
        ("yearly", "Yearly"),
    ]

    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    sort_order = models.PositiveIntegerField(default=0)

    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES
    )

    def __str__(self):
        return f"{self.name} - ${self.amount}"

class Allocation(models.Model):

    name = models.CharField(max_length=100)

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    sort_order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} - ${self.amount}"
