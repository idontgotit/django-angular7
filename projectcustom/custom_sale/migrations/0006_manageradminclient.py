# Generated by Django 2.1.7 on 2019-02-19 15:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('custom_sale', '0005_auto_20190218_2227'),
    ]

    operations = [
        migrations.CreateModel(
            name='ManagerAdminClient',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_is_client', models.IntegerField(null=True)),
                ('user_is_admin', models.IntegerField(null=True)),
            ],
        ),
    ]