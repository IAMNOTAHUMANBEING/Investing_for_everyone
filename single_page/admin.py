from django.contrib import admin
from single_page.models import Stock, Person, Event, Report, Opinion, Word

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'created_at', 'modified_at', 'author')
    list_filter = ('modified_at',)
    search_fields = ('title', 'content')
    filter_horizontal = ('stock_tag', 'word_tag', 'person_tag')

@admin.register(Opinion)
class OpinionAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'person_tag')
    list_filter = ('modified_at',)
    search_fields = ('title', 'person_tag', 'content')
    filter_horizontal = ('stock_tag', 'word_tag')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'institution', 'date')
    list_filter = ('date',)
    search_fields = ('title', 'author', 'institution')
