from django.apps import AppConfig


class CustomSaleConfig(AppConfig):
    name = 'custom_sale'

    def ready(self):
        import custom_sale.signals
