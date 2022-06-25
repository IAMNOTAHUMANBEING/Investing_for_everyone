from django.views.generic import DetailView, TemplateView
from django.shortcuts import render
from django.template.loader import render_to_string
from django.db.models import Q
from django.http import JsonResponse

import json
from datetime import timedelta, datetime

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


def SearchPage(request):
    if request.method == 'POST':

        searchword = json.loads(request.body).get('searchword')

        stock_list = Stock.objects.filter(name__istartswith=searchword)
        word_list = Word.objects.filter(name__istartswith=searchword)
        person_list = Person.objects.filter(name__istartswith=searchword)

        search_result = list(stock_list) + list(word_list) + list(person_list)
        search_result = sorted(search_result, key=lambda x: x.name)

        if search_result:
            context = {
                'page_list': search_result
            }
            data = render_to_string('single_page/page_search_result.html', context)

            return JsonResponse(data, safe=False)

        else:
            data = ""
            return JsonResponse(data, safe=False)

    else:
        return render(request, 'single_page/home.html', {})


def SearchBlock(request):
    if request.method == 'POST':

        searchword = json.loads(request.body).get('searchword')
        searchdate_start = datetime.strptime(json.loads(request.body).get('searchdate_start'), "%Y-%m-%d").date()
        searchdate_end = datetime.strptime(json.loads(request.body).get('searchdate_end'), "%Y-%m-%d").date() + timedelta(days=1)

        event_list = Event.objects.filter(
            Q(date__range=[searchdate_start, searchdate_end]) & (Q(title__icontains=searchword) | Q(
                stock_tag__name__icontains=searchword) |
            Q(word_tag__name__icontains=searchword) | Q(
                person_tag__name__icontains=searchword))).distinct()
        opinion_list = Opinion.objects.filter(
            Q(date__range=[searchdate_start, searchdate_end]) & (Q(short__icontains=searchword) | Q(
                stock_tag__name__icontains=searchword) |
            Q(word_tag__name__icontains=searchword) | Q(
                name__name__icontains=searchword))).distinct()
        report_list = Report.objects.filter(
            Q(date__range=[searchdate_start, searchdate_end]) & (Q(title__icontains=searchword) | Q(
                author__name__icontains=searchword) |
            Q(institution__icontains=searchword))).distinct()
        search_result = list(event_list) + list(opinion_list) + list(report_list)
        search_result = sorted(search_result, key=lambda x: x.date, reverse=True)

        # 검색결과 유무에 따라 구분
        if search_result:
            context = {
                'block_list': search_result
            }
            data = render_to_string('single_page/side_search_result.html', context)

            return JsonResponse(data, safe=False)

        else:
            data = "검색결과가 없습니다."
            return JsonResponse(data, safe=False)

    else:
        return render(request, 'single_page/home.html', {})

# def ChartData(request):
#     if request.method == 'POST':
