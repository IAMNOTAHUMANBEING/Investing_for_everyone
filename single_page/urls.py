from django.urls import re_path, path
from single_page import views

app_name = 'single_page'

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('stock/', views.StockHomeView.as_view(), name='stock_home'),
    path('stock/<int:pk>', views.StockDV.as_view(), name='stock'),
    re_path(r'^person/(?P<slug>[-\w]+)/$', views.PersonDV.as_view(), name='person'),
    re_path(r'^word/(?P<slug>[-\w]+)/$', views.WordDV.as_view(), name='word'),
    path('about/', views.AboutView.as_view(), name='about'),
    path('search/block/', views.SearchBlock, name='searchblock'),
    path('search/', views.SearchPage, name='searchpage'),
    path('chartdata/', views.ChartData, name='chartdata'),
]