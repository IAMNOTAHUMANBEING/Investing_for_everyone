# Generated by Django 4.0.4 on 2022-07-18 16:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='home',
            old_name='Notice',
            new_name='TextField',
        ),
        migrations.RemoveField(
            model_name='home',
            name='Project',
        ),
        migrations.RemoveField(
            model_name='home',
            name='ToDoList',
        ),
    ]