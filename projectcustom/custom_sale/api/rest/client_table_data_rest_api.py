from rest_framework import serializers, viewsets, generics, permissions, status
from rest_framework.response import Response

from custom_sale.business_logic.client_table_data_controller import ClientTableDataController
from custom_sale.models import ClientTableData
from rest_framework.renderers import JSONRenderer


class ClientTableDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientTableData
        fields = '__all__'


class ClientTableDataCollectionAPIView(viewsets.GenericViewSet, generics.ListCreateAPIView):
    serializer_class = ClientTableDataSerializer
    renderer_classes = (JSONRenderer,)
    paginate_by = 10  # 10 records per page
    paginate_by_param = 'page_size'  # ?page_size=1
    max_paginate_by = 1000  # limit 1000
    queryset = ClientTableData.objects.all()

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

    def create(self, request, *args, **kwargs):
        ower_request = request.data
        if self.request.query_params.get('user'):
            user_id = self.request.query_params.get('user')
            ower_request['user_owner'] = user_id
            calculate_controler = ClientTableDataController()
            ower_request = calculate_controler.calculate_client_table_data(data=ower_request)
        else:
            raise permissions.Http404
        serializer = self.get_serializer(data=ower_request)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ClientTableDataDetailAPIView(viewsets.GenericViewSet, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClientTableDataSerializer
    queryset = ClientTableData.objects.all()
    renderer_classes = (JSONRenderer,)
