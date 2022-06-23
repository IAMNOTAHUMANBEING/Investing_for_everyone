from django.views.generic import DetailView, TemplateView
from django.shortcuts import render
from django.template.loader import render_to_string
from django.db.models import Q
from django.http import JsonResponse

import json

from single_page.models import Stock, Person, Word, Event, Opinion, Report


class HomeView(TemplateView):
    template_name = "single_page/home.html"


class StockDV(DetailView):
    model = Stock
    template_name = "single_page/stock.html"


class PersonDV(DetailView):
    model = Person
    template_name = "single_page/person.html"


class WordDV(DetailView):
    model = Word
    template_name = "single_page/word.html"


def SearchStock(request):
    if request.method == 'POST':
        searchword = json.loads(request.body).get('searchword')
        stock_list = Stock.objects.filter(name__starts_with=searchword)
        data = stock_list.values()



def SearchBlock(request):
    if request.method == 'POST':
        searchword = json.loads(request.body).get('searchword', '')

        if searchword:
            event_list = Event.objects.filter(
                Q(title__icontains=searchword) | Q(stock_tag__name__icontains=searchword) |
                Q(word_tag__name__icontains=searchword) | Q(
                    person_tag__name__icontains=searchword)).distinct()
            opinion_list = Opinion.objects.filter(
                Q(short__icontains=searchword) | Q(stock_tag__name__icontains=searchword) |
                Q(word_tag__name__icontains=searchword) | Q(
                    name__name__icontains=searchword)).distinct()
            report_list = Report.objects.filter(Q(title__icontains=searchword) | Q(author__name__icontains=searchword) |
                                                Q(institution__icontains=searchword)).distinct()

            data = list(event_list) + list(opinion_list) + list(report_list)
            data = sorted(data, key=lambda x: x.date, reverse=True)

            if data:
                context = {
                    'list': data
                }

                data = render_to_string('single_page/side_search_result.html', context)

                return JsonResponse(data, safe=False)

            data = "검색결과가 없습니다."
            return JsonResponse(data, safe=False)

        else:
            data = "검색결과가 없습니다."
            return JsonResponse(data, safe=False)

    else:
        return render(request, 'home.html', {})


# def ChartData(request):
#     if request.method == 'POST':

