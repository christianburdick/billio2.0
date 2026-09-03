from django import forms
from .models import Income, Bill


class IncomeForm(forms.ModelForm):

    class Meta:
        model = Income
        fields = ["amount", "pay_date", "frequency"]

        widgets = {
            "pay_date": forms.DateInput(
                attrs={
                    "type": "date"
                }
            ),
        }


class BillForm(forms.ModelForm):

    class Meta:
        model = Bill
        fields = ["name", "amount", "due_date", "frequency"]

        widgets = {
            "due_date": forms.DateInput(
                attrs={
                    "type": "date"
                }
            ),
        }
