from django.contrib import admin
from django.urls import path
from budget.views import (
    home,
    delete_bill,
    edit_bill,
    update_bill_amount,
    update_bill_frequency,
    update_bill_name,
    update_bill_date,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home, name="home"),

    path(
        "bill/<int:bill_id>/delete/",
        delete_bill,
        name="delete_bill",
    ),

    path(
        "bill/<int:bill_id>/edit/",
        edit_bill,
        name="edit_bill",
    ),
    path(
    "bill/<int:bill_id>/amount/",
    update_bill_amount,
    name="update_bill_amount",
    ),
    path(
    "bill/<int:bill_id>/frequency/",
    update_bill_frequency,
    name="update_bill_frequency",
    ),
    path(
    "bill/<int:bill_id>/name/",
    update_bill_name,
    name="update_bill_name",
    ),
    path(
    "bill/<int:bill_id>/date/",
    update_bill_date,
    name="update_bill_date",
    ),
]
