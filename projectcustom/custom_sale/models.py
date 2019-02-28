from django.contrib.auth.models import User

# Create your models here.

from django.db import models

PAYMENT_CONSTANT = (
    (0, 'Prepay'),
    (1, 'Postpay'),
)

STATUS_DONE = 2
STATUS_NEW = 0
STATUS_CONSTANT = (
    (STATUS_NEW, 'NEW'),
    (1, 'WAIT'),
    (STATUS_DONE, 'DONE'),
    (3, 'REJECT'),
)


class FileImportCientTableData(models.Model):
    file_name = models.TextField()


class DiscountPercentage(models.Model):
    mobile_network = models.TextField()
    discount = models.TextField(default=10)
    user_owner = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ClientTableData(models.Model):
    tel = models.TextField()
    money_input = models.TextField()
    money_output = models.TextField()
    status = models.IntegerField(choices=STATUS_CONSTANT, null=True, default=0)
    note = models.TextField(blank=True, null=True)
    user_owner = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)
    report_change = models.BooleanField(default=False)
    file_import = models.ForeignKey(FileImportCientTableData, blank=True, null=True, on_delete=models.CASCADE)
    payment_type = models.IntegerField(choices=PAYMENT_CONSTANT, null=True, blank=True, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    discount_client = models.ForeignKey(DiscountPercentage, blank=True, null=True, on_delete=models.SET_NULL, related_name='discount_client')
    discount_admin = models.ForeignKey(DiscountPercentage, blank=True, null=True, on_delete=models.SET_NULL, related_name='discount_admin')


class ClientCredit(models.Model):
    user_owner = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)
    money_input = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ManagerAdminClient(models.Model):
    user_is_client = models.IntegerField(null=True)
    user_is_admin = models.IntegerField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ClientCreditRevenue(models.Model):
    user_owner = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)
    money_input = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
