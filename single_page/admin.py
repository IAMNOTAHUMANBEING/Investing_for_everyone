from django.contrib import admin
from single_page.models import Wiki, Block

@admin.register(Wiki)
class StockAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')
    filter_horizontal = ('tag',)

@admin.register(Block)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'created_at', 'modified_at', 'author', 'category')
    list_filter = ('modified_at',)
    search_fields = ('title', 'tag', 'speaker')
    autocomplete_fields = ('speaker',)
    filter_horizontal = ('tag',)

