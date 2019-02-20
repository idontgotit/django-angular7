from collections import OrderedDict
from io import BytesIO  # for modern python

import pandas as pd
from pandas import ExcelWriter


class ExportExcelController:
    def export_excel(self, data_input):
        output = BytesIO()
        # Create a Pandas Excel writer using XlsxWriter as the engine.
        data_input = self.build_data(data_input)
        df = pd.DataFrame(data_input)
        writer = ExcelWriter(output, engine='xlsxwriter')
        df.to_excel(writer, 'Sheet1', index=False)
        writer.save()

        # data_input.df_filter8.to_excel(writer, '8', index=False, header=False)
        workbook = writer.book
        worksheet = workbook.add_worksheet(name='total')
        writer.save()
        output.seek(0)
        return output

    def build_data(self, data):
        header_field = ['ID', 'Tel', 'Money']
        input_data = OrderedDict()
        for header in header_field:
            input_data[header] = []
        for item in data:
            input_data['ID'].append(item['id'])
            input_data['Tel'].append(item['tel'])
            input_data['Money'].append(item['money_input'])
        return input_data