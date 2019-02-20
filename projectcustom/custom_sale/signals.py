from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from custom_sale.models import DiscountPercentage


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        list_name = ['Viettel', 'Mobifone', 'Vinaphone']
        for item in list_name:
            DiscountPercentage.objects.create(user_owner=instance, mobile_network=item)
