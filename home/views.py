from django.views.generic import TemplateView, ListView
from home.models import Home

class HomeView(ListView):
    model = Home
    template_name = "home/home.html"

class AboutView(TemplateView):
    template_name = "home/about.html"