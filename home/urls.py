from django.urls import path
from home import views

app_name = 'home'

urlpatterns = [
    path('about/', views.AboutView.as_view(), name='about'),
    path('', views.HomeView.as_view(), name='home'),
]