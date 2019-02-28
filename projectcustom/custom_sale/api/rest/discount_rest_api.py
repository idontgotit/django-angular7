import dateutil
from django.contrib.auth.models import User
from   django.utils import timezone
from rest_framework import serializers, viewsets, generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from custom_sale.models import DiscountPercentage, ManagerAdminClient


class DiscountPercentageSerializer(serializers.ModelSerializer):
    current_user_name = serializers.SerializerMethodField()

    def get_current_user_name(self, item):
        return item.user_owner.username

    class Meta:
        model = DiscountPercentage
        fields = '__all__'


class DiscountPercentageCollectionAPIView(viewsets.GenericViewSet, generics.ListAPIView):
    serializer_class = DiscountPercentageSerializer
    renderer_classes = (JSONRenderer,)
    paginate_by = 1000  # 10 records per page
    paginate_by_param = 'page_size'  # ?page_size=1
    max_paginate_by = 1000  # limit 1000
    queryset = DiscountPercentage.objects.all().order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        user_relation = self.request.query_params.get('user_relation')
        user_id = self.request.query_params.get('user')
        if user_id:
            user_id = self.request.query_params.get('user')
            queryset = queryset.filter(user_owner_id=user_id)
        elif user_relation:
            current_user = User.objects.filter(pk=user_relation).first()
            if current_user:
                if current_user.is_superuser:
                    all_relation_user = User.objects.filter(is_staff=True, is_superuser=False).values_list(
                        'id',
                        flat=True)
                    queryset = queryset.filter(user_owner_id__in=all_relation_user)
                elif current_user.is_staff:
                    all_relation_user = ManagerAdminClient.objects.filter(user_is_admin=user_relation).values_list(
                        'user_is_client',
                        flat=True)
                    queryset = queryset.filter(user_owner_id__in=all_relation_user)
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        # get latest created for show update credit
        results = []
        list_filter_data = []
        if user_relation:
            for item in data:
                temp = {
                    'mobile_network': item.get('mobile_network'),
                    'user_owner': item.get('user_owner')
                }
                if temp not in list_filter_data:
                    list_filter_data.append(temp)
                    results.append(item)
        if user_id:
            for item in data:
                created_at = item.get('created_at')
                # if len(data) != 3 and dateutil.parser.parse(created_at).date() == timezone.now().date():
                #     continue
                temp = {
                    'mobile_network': item.get('mobile_network'),
                    'user_owner': item.get('user_owner')
                }
                if temp not in list_filter_data:
                    list_filter_data.append(temp)
                    results.append(item)
        return Response(results)


class DiscountPercentageDetailAPIView(viewsets.GenericViewSet, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DiscountPercentageSerializer
    queryset = DiscountPercentage.objects.all()
    renderer_classes = (JSONRenderer,)

    def perform_update(self, serializer):
        current_id = self.kwargs.get('pk')
        old_item = DiscountPercentage.objects.filter(id=current_id).first()
        finding_admin_id = ManagerAdminClient.objects.filter(user_is_client=old_item.user_owner_id).values_list(
            'user_is_admin',
            flat=True)
        if finding_admin_id and len(finding_admin_id)==1:
            value_discount =  self.request.data.get('discount')
            mobile_network = self.request.data.get('mobile_network')
            admin_discount = DiscountPercentage.objects.filter(user_owner_id__in=finding_admin_id, mobile_network=mobile_network).order_by('-created_at').first().discount
            if float(value_discount) > float(admin_discount):
                raise PermissionDenied
        if old_item:
            if old_item.created_at.date() == timezone.now().date():
                serializer.save()
            else:
                new_data = {
                    'mobile_network': self.request.data.get('mobile_network'),
                    'user_owner': old_item.user_owner,
                    'discount': self.request.data.get('discount')
                }
                DiscountPercentage.objects.create(**new_data)
