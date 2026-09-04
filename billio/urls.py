from django.contrib import admin
from django.urls import path

from budget.views import (
    home,
    add_bill,
    delete_bill,
    update_bill_amount,
    update_bill_frequency,
    update_bill_name,
    update_bill_date,
    reorder_bills,
)

urlpatterns = [

    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "",
        home,
        name="home",
    ),

    path(
        "bill/<int:bill_id>/delete/",
        delete_bill,
        name="delete_bill",
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

    path(
        "bill/add/",
        add_bill,
        name="add_bill",
    ),

    path(
        "bill/reorder/",
        reorder_bills,
        name="reorder_bills",
    ),

]
