from custom_sale.models import DiscountPercentage


class ClientTableDataController:
    def __init__(self):
        pass

    def find_correct_network(self, tel):
        return DiscountPercentage.objects.get(pk=1)

    def calculate_money_output(self, data, mobile_network):
        return int(data.get('money_input')) - int(mobile_network.discount) * int(data.get('money_input'))/100

    def calculate_client_table_data(self, data):
        mobile_network = self.find_correct_network(tel=data.get('tel'))
        data['money_output'] = self.calculate_money_output(data=data, mobile_network=mobile_network)
        return data
