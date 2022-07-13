import os
import sys
import django

import FinanceDataReader as fdr
import pandas as pd

import requests
from io import BytesIO

sys.path.append('../../Invest_for_everyone')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Invest_for_everyone.settings')
django.setup()

from single_page.models import Stock
from django.db.models.query_utils import Q

gen_url = 'http://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd'
gen_parms = {
    'mktId': 'ALL',
    'share': '1',
    'csvxls_isNo': 'false',
    'name': 'fileDown',
    'url': 'dbms/MDC/STAT/standard/MDCSTAT01901'
    }

headers = {
    'Referer': 'http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020101',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
    }

r = requests.get(url=gen_url, params=gen_parms, headers=headers)

down_url = 'http://data.krx.co.kr/comm/fileDn/download_csv/download.cmd'

data = {
    'code': r.content
}

r = requests.post(url=down_url, data=data, headers=headers)

stock_list = pd.read_csv(BytesIO(r.content), encoding='cp949')
stock_list = stock_list[["단축코드", "한글 종목약명"]]
stock_list.columns = ["Code", "Name"]
print(stock_list.head(5))

# 기업 목록 업데이트
for index, stock in stock_list.iterrows():
    exist = Stock.objects.filter(code=stock.Code)
    if exist:

        change = exist.filter(~Q(name=stock.Name))
        if change:
            print("변경")
            change.update(name=stock.Name)
    else:
        print("추가")
        new_record = Stock.objects.create(name=stock.Name, code=stock.Code)

print("목록 업데이트 완료")

# 주가 데이터 업데이트
for index, stock in stock_list.iterrows():
    data = fdr.DataReader(stock.Code)
    data = data.reset_index()
    data['Date'] = data['Date'].apply(lambda x : x.strftime("%Y-%m-%d"))
    data.to_json('../_static/prices/' + stock.Code + '.json', orient='records')

print("주가 업데이트 완료")