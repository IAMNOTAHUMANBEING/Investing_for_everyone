from django.views.generic import DetailView, ListView
from django.shortcuts import render
from django.template.loader import render_to_string
from django.db.models import Q
from django.http import JsonResponse
from django.core.paginator import Paginator

import json, os
from datetime import timedelta, datetime

from single_page.models import Stock, Person, Word, Event, Opinion, Report

class StockDV(DetailView):
    model = Stock
    template_name = "single_page/stock.html"

class WikiHomeView(ListView):
    model = Stock
    template_name = "single_page/wiki_home.html"

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
                'wiki_list': search_result
            }
            data = render_to_string('single_page/wiki_search_result.html', context)

            return JsonResponse(data, safe=False)

        else:
            data = ""
            return JsonResponse(data, safe=False)

    else:
        return render(request, 'home/home.html', {})


def SearchBlock(request):
    if request.method == 'POST':

        searchword = json.loads(request.body).get('searchword')
        searchdate_start = datetime.strptime(json.loads(request.body).get('searchdate_start'), "%Y-%m-%d").date()
        searchdate_end = datetime.strptime(json.loads(request.body).get('searchdate_end'),
                                           "%Y-%m-%d").date() + timedelta(days=1)

        # condition = Q(date__range=[searchdate_start, searchdate_end]) & (Q(short__icontains=searchword) | Q(
        #     stock_tag__name__icontains=searchword) |
        # Q(word_tag__name__icontains=searchword) | Q(
        #     name__name__icontains=searchword))

        condition = Q(date__range=[searchdate_start, searchdate_end])

        for word in searchword.split(" "):
            condition = condition & (Q(title__icontains=word) | Q(stock_tag__name__icontains=word) |
                                     Q(word_tag__name__icontains=word) | Q(person_tag__name__icontains=word))

        event_list = Event.objects.filter(condition).distinct()
        opinion_list = Opinion.objects.filter(condition).distinct()
        # report_list = Report.objects.filter(condition).distinct()

        search_result = list(event_list) + list(opinion_list) # + list(report_list)
        search_result = sorted(search_result, key=lambda x: x.date, reverse=True)

        paginator = Paginator(search_result, 6)
        page_number = json.loads(request.body).get('page')
        search_result = paginator.get_page(page_number)

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
        return render(request, 'home/home.html', {})


def ChartData(request):
    if request.method == 'POST':

        stock_code = json.loads(request.body).get('stock_code')

        # 상대경로 직접 넣으면 에러남
        my_path = os.path.abspath(os.path.dirname(__file__))
        path = os.path.join(my_path, '../_static/prices/' + stock_code + '.json')
        
        with open(path) as stock_price:
            data = json.load(stock_price)

            return JsonResponse(data, safe=False)


