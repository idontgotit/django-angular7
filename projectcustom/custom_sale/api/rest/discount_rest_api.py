from django.contrib.auth.models import User
from rest_framework import serializers, viewsets, generics, permissions

from custom_sale.models import DiscountPercentage, ManagerAdminClient
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response


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
    paginate_by = 10  # 10 records per page
    paginate_by_param = 'page_size'  # ?page_size=1
    max_paginate_by = 1000  # limit 1000
    queryset = DiscountPercentage.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if self.request.query_params.get('user'):
            user_id = self.request.query_params.get('user')
            queryset = queryset.filter(user_owner_id=user_id)
        elif self.request.query_params.get('user_relation'):
            user_relation = self.request.query_params.get('user_relation')
            current_user = User.objects.filter(pk=user_relation).first()
            if current_user:
                if current_user.is_superuser:
                    pass
                if current_user.is_staff:
                    all_relation_user = ManagerAdminClient.objects.filter(user_is_admin=user_relation).values_list('user_is_client',
                                                                                               flat=True)
                    queryset = queryset.filter(user_owner_id__in=all_relation_user)
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class DiscountPercentageDetailAPIView(viewsets.GenericViewSet, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DiscountPercentageSerializer
    queryset = DiscountPercentage.objects.all()
    renderer_classes = (JSONRenderer,)
