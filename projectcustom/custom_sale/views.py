from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import User

from custom_sale.business_logic.export_excel_controller import ExportExcelController
from custom_sale.models import ManagerAdminClient


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")


@csrf_exempt
def login_authenticate(request):
    if request.method == "POST":
        data = json.loads((request.body).decode())
        username = data['username']
        password = data['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            data = {
                'user': user.id,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'username': user.username
            }
            return HttpResponse(json.dumps(data))
        else:
            raise PermissionDenied
    else:
        raise PermissionDenied


@csrf_exempt
def create_client_user(request):
    if request.method == "POST":
        data = json.loads((request.body).decode())['data']
        username = data['username']
        password = data['password']
        email = data['email']
        current_admin_id = data['current_admin_id']
        exists_user = User.objects.filter(username=username)
        if exists_user or not current_admin_id:
            raise PermissionDenied
        user = User.objects.create_user(username=username, email=email, password=password)
        if user is not None:
            if current_admin_id:
                manager_admin = ManagerAdminClient.objects.create(user_is_client=user.id,
                                                                  user_is_admin=current_admin_id)
            data = {
                'user': user.id,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }
            return HttpResponse(json.dumps(data))
        else:
            raise PermissionDenied
    else:
        raise PermissionDenied





@csrf_exempt
def export_excel(request):
    data_input = json.loads((request.body).decode())['data']
    controller = ExportExcelController()
    output = controller.export_excel(data_input)
    response_data = HttpResponse(output.read(),
                                 content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response_data['Content-Disposition'] = 'attachment; filename=%s' % 'results.xlsx'
    return response_data