from django.urls import path
from single_page import views

app_name = 'single_page'

urlpatterns = [
    path('', views.WikiHomeView.as_view(), name='wiki_home'),
    path('<int:pk>/', views.WikiDV.as_view(), name='wiki'),
    # re_path(r'^person/(?P<slug>[-\w]+)/$', views.PersonDV.as_view(), name='person'),
    # re_path(r'^word/(?P<slug>[-\w]+)/$', views.WordDV.as_view(), name='word'),
    path('search/block/', views.SearchBlock, name='searchblock'),
    path('search/', views.SearchPage, name='searchpage'),
    path('chartdata/', views.ChartData, name='chartdata'),
]