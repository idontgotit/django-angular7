from django.contrib.auth.models import User
from django.http import HttpResponse
from rest_framework import serializers, viewsets, generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from custom_sale.models import ClientCredit, ManagerAdminClient
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import list_route


class ClientCreditSerializer(serializers.ModelSerializer):
    current_user_name = serializers.SerializerMethodField()

    def get_current_user_name(self, item):
        return item.user_owner.username

    class Meta:
        model = ClientCredit
        fields = '__all__'


class ClientCreditCollectionAPIView(viewsets.GenericViewSet, generics.ListAPIView):
    serializer_class = ClientCreditSerializer
    renderer_classes = (JSONRenderer,)
    paginate_by = 1000  # 10 records per page
    paginate_by_param = 'page_size'  # ?page_size=1
    max_paginate_by = 1000  # limit 1000
    queryset = ClientCredit.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if self.request.query_params.get('user'):
            user_id = self.request.query_params.get('user')
            current_user = User.objects.filter(pk=int(user_id)).first()
            queryset = queryset.filter(user_owner_id=current_user.id)
        elif self.request.query_params.get('user_relation'):
            user_id = self.request.query_params.get('user_relation')
            current_user = User.objects.filter(pk=int(user_id)).first()
            if current_user:
                if current_user.is_superuser:
                    all_relation_user = User.objects.filter(is_staff=True, is_superuser=False).values_list(
                        'id',
                        flat=True)
                    queryset = queryset.filter(user_owner_id__in=all_relation_user)
                elif current_user.is_staff:
                    all_relation_user = ManagerAdminClient.objects.filter(user_is_admin=user_id).values_list(
                        'user_is_client',
                        flat=True)
                    queryset = queryset.filter(user_owner_id__in=all_relation_user)
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @list_route(methods=['get'])
    def check_budget(self, request, *args, **kwargs):
        user_id = self.request.query_params.get('user')
        total = self.request.query_params.get('total')
        if float(total) <= 0:
            raise PermissionDenied
        current_user = User.objects.filter(pk=int(user_id)).first()
        if current_user and current_user.is_superuser:
            return HttpResponse({'data': 'accepted'})
        client_credit = ClientCredit.objects.filter(user_owner_id=user_id).first()
        if client_credit:
            if float(client_credit.money_input) >= float(total):
                return HttpResponse({'data':'accepted'})
        raise PermissionDenied


class ClientCreditDetailAPIView(viewsets.GenericViewSet, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClientCreditSerializer
    queryset = ClientCredit.objects.all()
    renderer_classes = (JSONRenderer,)

    def perform_update(self, serializer):
        current_id = self.kwargs.get('pk')
        new_money = self.request.data.get('money_add')
        old_item = ClientCredit.objects.filter(id=current_id).first()
        old_money = old_item.money_input
        old_item.money_input = float(old_money) + float(new_money)
        old_item.save()
        user_owner_id = old_item.user_owner_id
        if old_item.user_owner.is_staff:
            pass
        else:
            user_admin_id = ManagerAdminClient.objects.filter(user_is_client=user_owner_id).first().user_is_admin
            current_admin_credit = ClientCredit.objects.filter(user_owner_id=user_admin_id).first()
            current_admin_credit.money_input = float(current_admin_credit.money_input) - float(new_money) + float(old_money)
            current_admin_credit.save()

