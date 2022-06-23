from django.urls import re_path, path
from single_page import views

app_name = 'single_page'
urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    # path('', views.) 홈페이지 만들어야함
    re_path(r'^stock/(?P<slug>[-\w]+)/$', views.StockDV.as_view(), name='stock'), # code로 바꿔야 차트가져오기편함
    re_path(r'^person/(?P<slug>[-\w]+)/$', views.PersonDV.as_view(), name='person'),
    re_path(r'^word/(?P<slug>[-\w]+)/$', views.WordDV.as_view(), name='word'),
    path('search/block/', views.SearchBlock, name='searchblock'),
    # path('chartdata/', views.ChartData, name='chartdata')
    # path('search/page/', views.SearchPage, name='searchpage'),
]