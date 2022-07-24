from django.views.generic import DetailView, TemplateView
from django.shortcuts import render
from django.template.loader import render_to_string
from django.db.models import Q
from django.http import JsonResponse
from django.core.paginator import Paginator

import json, os
from datetime import timedelta, datetime

from single_page.models import Wiki, Block # Report



class WikiDV(DetailView):
    model = Wiki
    template_name = "single_page/wiki.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        tag_num = Wiki.objects.get(name__exact=self.object.name)
        context['sub_tag'] = Wiki.objects.filter(tag__exact=tag_num)
        return context



class WikiHomeView(TemplateView):
    template_name = "single_page/wiki_home.html"



def SearchPage(request):
    if request.method == 'POST':

        searchword = json.loads(request.body).get('searchword')

        wiki_list = Wiki.objects.filter(name__istartswith=searchword)

        if wiki_list:
            context = {
                'wiki_list': wiki_list
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

        condition = Q(date__range=[searchdate_start, searchdate_end])

        for word in searchword.split(" "):
            condition = condition & (Q(title__icontains=word) | Q(tag__name__icontains=word) | Q(speaker__name__icontains=word))

        block_list = Block.objects.filter(condition).distinct()

        paginator = Paginator(block_list, 6)
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
            data = "<div class='blockLoadingGif'></div> 검색결과가 없습니다."
            return JsonResponse(data, safe=False)

    else:
        return render(request, 'home/home.html', {})



def ChartData(request):
    if request.method == 'POST':

        stock_code = json.loads(request.body).get('stock_code')

        # 상대경로 직접 넣으면 에러남
        my_path = os.path.abspath(os.path.dirname(__file__))

        if '/' in stock_code:
            stock_code = stock_code.replace("/", "-")

        path = os.path.join(my_path, '../_static/prices/' + stock_code + '.json')
        
        with open(path) as stock_price:
            data = json.load(stock_price)

            return JsonResponse(data, safe=False)


