from rest_framework import serializers, viewsets, generics
from rest_framework.renderers import JSONRenderer

from custom_sale.models import ClientCreditRevenue
from django.contrib.auth.models import User
from django.http import HttpResponse
from rest_framework import serializers, viewsets, generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from custom_sale.models import ClientCredit, ManagerAdminClient
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import list_route


class ClientCreditRevenueSerializer(serializers.ModelSerializer):
    current_user_name = serializers.SerializerMethodField()

    def get_current_user_name(self, item):
        return item.user_owner.username

    class Meta:
        model = ClientCreditRevenue
        fields = '__all__'


class ClientCreditRevenueCollectionAPIView(viewsets.GenericViewSet, generics.ListCreateAPIView):
    serializer_class = ClientCreditRevenueSerializer
    renderer_classes = (JSONRenderer,)
    paginate_by = 1000  # 10 records per page
    paginate_by_param = 'page_size'  # ?page_size=1
    max_paginate_by = 1000  # limit 1000
    queryset = ClientCreditRevenue.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if self.request.query_params.get('user'):
            user_id = self.request.query_params.get('user')
            queryset = queryset.filter(user_owner_id=user_id)
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ClientTableDataDetailAPIView(viewsets.GenericViewSet, generics.RetrieveAPIView):
    serializer_class = ClientCreditRevenueSerializer
    queryset = ClientCreditRevenue.objects.all()
    renderer_classes = (JSONRenderer,)
