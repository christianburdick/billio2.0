from django.contrib import admin
from django.urls import path
from budget.views import home, delete_bill, edit_bill


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
]
