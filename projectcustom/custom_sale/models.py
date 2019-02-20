from django.contrib.auth.models import User

# Create your models here.

from django.db import models


class FileImportCientTableData(models.Model):
    file_name = models.TextField()


class ClientTableData(models.Model):
    tel = models.TextField()
    money_input = models.TextField()
    money_output = models.TextField()
    status = models.IntegerField(default=False)
    note = models.TextField(blank=True, null=True)
    user_owner = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)
    report_change = models.BooleanField(default=False)
    file_import = models.ForeignKey(FileImportCientTableData, blank=True, null=True, on_delete=models.CASCADE)


class ClientCredit(models.Model):
    user_owner = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)
    money_input = models.TextField()


class DiscountPercentage(models.Model):
    mobile_network = models.TextField()
    discount = models.TextField(default=10)
    user_owner = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)


class ManagerAdminClient(models.Model):
    user_is_client = models.IntegerField(null=True)
    user_is_admin = models.IntegerField(null=True)
