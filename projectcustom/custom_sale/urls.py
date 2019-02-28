from django.conf.urls import url
from django.urls import path, include
from rest_framework import routers

from custom_sale.api.rest.client_credit_rest_api import ClientCreditCollectionAPIView, ClientCreditDetailAPIView
from custom_sale.api.rest.client_credit_revenue_rest_api import ClientCreditRevenueCollectionAPIView
from custom_sale.api.rest.client_table_data_rest_api import ClientTableDataCollectionAPIView, \
    ClientTableDataDetailAPIView
from custom_sale.api.rest.discount_rest_api import DiscountPercentageDetailAPIView, DiscountPercentageCollectionAPIView
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login_authenticate', views.login_authenticate, name='login_authenticate'),
    path('create_client_user', views.create_client_user, name='create_client_user'),
    path('export_excel', views.export_excel, name='export_excel'),
]

router = routers.DefaultRouter()
router.register(r'api/discount-percentage', DiscountPercentageCollectionAPIView)
router.register(r'api/discount-percentage', DiscountPercentageDetailAPIView)

router.register(r'api/client-credit', ClientCreditCollectionAPIView)
router.register(r'api/client-credit', ClientCreditDetailAPIView)

router.register(r'api/client-table-data', ClientTableDataCollectionAPIView)
router.register(r'api/client-table-data', ClientTableDataDetailAPIView)

router.register(r'api/client-credit-revenue', ClientCreditRevenueCollectionAPIView)
router.register(r'api/client-credit-revenue', ClientTableDataDetailAPIView)

urlpatterns += router.urls
