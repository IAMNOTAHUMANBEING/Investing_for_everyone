# Generated by Django 4.0.4 on 2022-06-30 18:26

from django.db import migrations
import markdownx.models


class Migration(migrations.Migration):

    dependencies = [
        ('single_page', '0005_alter_stock_code'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='content',
            field=markdownx.models.MarkdownxField(blank=True),
        ),
        migrations.AlterField(
            model_name='opinion',
            name='content',
            field=markdownx.models.MarkdownxField(blank=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='content',
            field=markdownx.models.MarkdownxField(blank=True),
        ),
        migrations.AlterField(
            model_name='stock',
            name='content',
            field=markdownx.models.MarkdownxField(blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='word',
            name='content',
            field=markdownx.models.MarkdownxField(blank=True),
        ),
    ]