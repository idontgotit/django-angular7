from django.contrib.auth.models import User
from rest_framework import serializers, viewsets, generics, permissions, status
from rest_framework.decorators import list_route
from rest_framework.exceptions import PermissionDenied
from django.http import HttpResponse

from custom_sale.business_logic.client_table_data_controller import ClientTableDataController
from custom_sale.models import ClientTableData, ClientCredit, ManagerAdminClient, STATUS_DONE, STATUS_NEW
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response


class ClientTableDataSerializer(serializers.ModelSerializer):
    current_user_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    def get_current_user_name(self, item):
        return item.user_owner.username

    def get_status_display(self, item):
        if item.status == STATUS_DONE:
            return 'Hoàn thành'
        if item.status == STATUS_NEW:
            return 'Chưa xử lý'

    class Meta:
        model = ClientTableData
        fields = '__all__'


class ClientTableDataCollectionAPIView(viewsets.GenericViewSet, generics.ListCreateAPIView):
    serializer_class = ClientTableDataSerializer
    renderer_classes = (JSONRenderer,)
    paginate_by = 1000  # 10 records per page
    paginate_by_param = 'page_size'  # ?page_size=1
    max_paginate_by = 1000  # limit 1000
    queryset = ClientTableData.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if self.request.query_params.get('user'):
            user_id = self.request.query_params.get('user')
            current_user = User.objects.filter(pk=user_id).first()
            if current_user:
                if current_user.is_superuser:
                    pass
                elif current_user.is_staff:
                    all_relation_user = ManagerAdminClient.objects.filter(user_is_admin=user_id).values_list(
                        'user_is_client',
                        flat=True)
                    queryset = queryset.filter(user_owner_id__in=all_relation_user)
                else:
                    queryset = queryset.filter(user_owner_id=user_id)
        if self.request.query_params.get('status') == 'not_done':
            queryset = queryset.exclude(status=STATUS_DONE)
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        ower_request = request.data
        calculate_controler = ClientTableDataController()
        if self.request.query_params.get('user'):
            user_id = self.request.query_params.get('user')
            ower_request['user_owner'] = user_id
            ower_request = calculate_controler.calculate_client_table_data(data=ower_request)
        else:
            raise permissions.Http404
        serializer = self.get_serializer(data=ower_request)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        data = serializer.data
        new_money_output = serializer.data.get('money_output')
        calculate_controler.update_client_credit_after_save(self.request.query_params.get('user'), new_money_output)
        headers = self.get_success_headers(data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

    @list_route(methods=['post'])
    def complete_execute(self, request, *args, **kwargs):
        params = self.request.data.get('params')
        if params and params.get('user'):
            user_id = params.get('user')
            list_id_complete = params.get('list_id_complete')
            current_user = User.objects.filter(pk=int(user_id)).first()
            if current_user and (current_user.is_staff):
                calculate_controler = ClientTableDataController()
                list_client_table_complete = ClientTableData.objects.filter(id__in=list_id_complete)
                list_client_table_complete.update(status=STATUS_DONE)
                for item in list_client_table_complete:
                    calculate_controler.update_admin_credit_revenue(item)
            else:
                raise PermissionDenied
            return HttpResponse({'data': 'accepted'})
        raise PermissionDenied


class ClientTableDataDetailAPIView(viewsets.GenericViewSet, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClientTableDataSerializer
    queryset = ClientTableData.objects.all()
    renderer_classes = (JSONRenderer,)
