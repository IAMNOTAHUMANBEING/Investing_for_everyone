# Generated by Django 4.0.4 on 2022-06-30 19:02

from django.db import migrations
import markdownx.models


class Migration(migrations.Migration):

    dependencies = [
        ('single_page', '0007_alter_stock_content'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='content',
            field=markdownx.models.MarkdownxField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='opinion',
            name='content',
            field=markdownx.models.MarkdownxField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='person',
            name='content',
            field=markdownx.models.MarkdownxField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='word',
            name='content',
            field=markdownx.models.MarkdownxField(blank=True, default=''),
        ),
    ]
