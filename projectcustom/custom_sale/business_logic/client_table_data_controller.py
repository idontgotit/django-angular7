from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from custom_sale.models import DiscountPercentage, ClientCredit, ManagerAdminClient, ClientCreditRevenue

VIETTEL = ['032', '033', '034', '035', '036', '037', '038', '039', '096', '097', '098', '086']
MOBIFONE = ['070', '079', '077', '076', '078', '089', '090', '093']
VINAPHONE = ['083', '084', '085', '081', '082', '088', '091', '094']


class ClientTableDataController:
    def __init__(self):
        pass

    def find_correct_network_discount(self, tel, user_owner, mobile_network_discount_client=None):
        mobile_network = None
        if any([tel.startswith(s) for s in VIETTEL]):
            mobile_network = 'Viettel'
        elif any([tel.startswith(s) for s in MOBIFONE]):
            mobile_network = 'Mobifone'
        elif any([tel.startswith(s) for s in VINAPHONE]):
            mobile_network = 'Vinaphone'
        if mobile_network:
            list_discount = DiscountPercentage.objects.filter(user_owner_id=user_owner, mobile_network=mobile_network).order_by(
                '-created_at')
            if len(list_discount) == 1:
                return list_discount.first()
            if mobile_network_discount_client:
                time_compare = mobile_network_discount_client.created_at.date()
            else:
                time_compare = timezone.now().date()
            for item in list_discount:
                return item
                if item.created_at.date() == time_compare:
                    continue
                else:
                    return item
            return DiscountPercentage.objects.filter(user_owner_id=user_owner, mobile_network=mobile_network).order_by('-created_at').first()

    def calculate_money_output(self, data, mobile_network):
        if not mobile_network:
            raise Exception('Cant found mobile network')
        else:
            discount = mobile_network.discount
        return int(data.get('money_input')) - int(discount) * int(data.get('money_input')) / 100

    def calculate_client_table_data(self, data):
        client_credit = ClientCredit.objects.filter(user_owner_id=data.get('user_owner')).first()
        if data.get('money_input') and client_credit:
            if float(data.get('money_input')) < float(client_credit.money_input):
                mobile_network_discount_client = self.find_correct_network_discount(tel=data.get('tel'), user_owner=data.get('user_owner'))
                money_output = self.calculate_money_output(data=data, mobile_network=mobile_network_discount_client)
                id_admin = self.find_admin_from_client_user(data.get('user_owner'))
                if len(id_admin) == 1:
                    mobile_network_discount_admin = self.find_correct_network_discount(tel=data.get('tel'),
                                                                                       user_owner=id_admin[0],
                                                                                       mobile_network_discount_client=mobile_network_discount_client)
                    data['discount_admin'] = mobile_network_discount_admin.id
                else:
                    raise PermissionDenied
                data['discount_client'] = mobile_network_discount_client.id
                data['money_output'] = money_output
                return data
        raise PermissionDenied

    def update_client_credit_after_save(self, user_id, new_money_output):
        client_credit = ClientCredit.objects.filter(user_owner_id=user_id).first()
        client_credit.money_input = float(client_credit.money_input) - float(new_money_output)
        client_credit.save()

    def find_admin_from_client_user(self, user_owner):
        return ManagerAdminClient.objects.filter(user_is_client=user_owner).values_list(
            'user_is_admin',
            flat=True)

    def update_admin_credit_revenue(self, client_table_complete):
        discount_admin = client_table_complete.discount_admin
        revenue_increase = (-float(client_table_complete.discount_client.discount) + float(
            client_table_complete.discount_admin.discount)) * float(client_table_complete.money_input) / 100
        admin_revenue = ClientCreditRevenue.objects.filter(user_owner=discount_admin.user_owner).first()
        admin_revenue.money_input = float(admin_revenue.money_input) + float(revenue_increase)
        admin_revenue.save()
