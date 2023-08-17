import os
import sys
import django

import FinanceDataReader as fdr
import pandas as pd

import requests
from io import BytesIO

sys.path.append(os.path.join(os.path.abspath('../'), 'app'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Invest_for_everyone.settings')
django.setup()

from single_page.models import Wiki
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
print("한국 상장 기업 목록 가져기 완료")

# 한국 상장 기업 목록 업데이트
for index, stock in stock_list.iterrows():
    exist = Wiki.objects.filter(code=stock.Code)
    # 코드 존재
    if exist:
        change = exist.filter(~Q(name=stock.Name))
        # 코드 존재,  기업명은 미존재
        if change:
            # 코드가 존재하는 종목이 이미 존재하는 회사명으로 변경된 경우(합병, 분할 등)
            if Wiki.objects.filter(name=stock.Name):
                Wiki.objects.filter(name=stock.Name).update(name=stock.Name+"(구)") # 반복될 경우 충돌 가능성
                print(stock.Name + "(구) 회사명 변경")
            # 코드가 존재하는 종목이 새로운 회사명으로 변경된 경우
            change.update(name=stock.Name)
            print(stock.Name + "(회사명 변경)")
    # 코드가 미존재
    else:
        name_exist = Wiki.objects.filter(name=stock.Name)
        if name_exist:
            name_exist.update(name=stock.Name+"(구)")
            print(stock.Name + "(구) 회사명 변경")
        new_record = Wiki.objects.create(name=stock.Name, code=stock.Code)
        print(stock.Name + "(추가)")

print("한국 상장 기업 목록 업데이트 완료")

# 상장폐지 기업추가 필요

df = pd.DataFrame(list(Wiki.objects.exclude(code="").values('code')))

# 전체 상장 기업  주가  업데이트
if os.path.isdir(os.path.join(os.path.abspath('../'), 'app/_static/prices/')) == False:
    os.mkdir(os.path.join(os.path.abspath('../'), 'app/_static/prices/'))

for index, stock_row in df.iterrows():
    data = fdr.DataReader(stock_row.code)
    data = data.reset_index()
    try:
        data['Date'] = data['Date'].apply(lambda x : x.strftime("%Y-%m-%d"))
    except KeyError:
        continue
    if '/' in stock_row.code:
        stock_row.code = stock_row.code.replace("/", "-")
    data.to_json(os.path.join(os.path.abspath('../'), 'app/_static/prices/' + stock_row.code + '.json'), orient='records')

print("전체 상장 기업 주가 업데이트 완료")


