from django.contrib import admin
from single_page.models import Stock, Person, Event, Report, Opinion, Word

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    prepopulated_fields = {'slug': ('name',)}

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

@admin.register(Opinion)
class OpinionAdmin(admin.ModelAdmin):
    list_display = ('short', 'date', 'name')
    list_filter = ('modified_at',)
    search_fields = ('short', 'name', 'content')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'institution', 'date')
    list_filter = ('date',)
    search_fields = ('title', 'author', 'institution')
