from django.contrib.auth.models import User
from rest_framework import serializers, viewsets, generics, permissions
from rest_framework.response import Response
from custom_sale.models import ClientCredit, ManagerAdminClient
from rest_framework.renderers import JSONRenderer


class ClientCreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientCredit
        fields = '__all__'


class ClientCreditCollectionAPIView(viewsets.GenericViewSet, generics.ListAPIView):
    serializer_class = ClientCreditSerializer
    renderer_classes = (JSONRenderer,)
    paginate_by = 10  # 10 records per page
    paginate_by_param = 'page_size'  # ?page_size=1
    max_paginate_by = 1000  # limit 1000
    queryset = ClientCredit.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if self.request.query_params.get('user'):
            user_id = self.request.query_params.get('user')
            current_user = User.objects.filter(pk=user_id).first()
            if current_user:
                if current_user.is_superuser:
                    pass
                if current_user.is_staff:
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


class ClientCreditDetailAPIView(viewsets.GenericViewSet, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClientCreditSerializer
    queryset = ClientCredit.objects.all()
    renderer_classes = (JSONRenderer,)
