# Generated by Django 4.0.4 on 2022-06-30 18:57

from django.db import migrations
import markdownx.models


class Migration(migrations.Migration):

    dependencies = [
        ('single_page', '0006_alter_event_content_alter_opinion_content_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stock',
            name='content',
            field=markdownx.models.MarkdownxField(blank=True, default=''),
        ),
    ]
