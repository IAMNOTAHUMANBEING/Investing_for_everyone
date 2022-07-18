//// query the element
const resizer = document.getElementById('resizer');
const leftSide = document.getElementById('left');
const rightSide = document.getElementById('side');



//// 창 열릴 때 세팅
window.addEventListener("load", () => {
  // 최근 1년, 해당 wiki 단어들어간 block 자동검색
  let searchblock_form = document.getElementById("searchblock");
  let searchblock_input = document.getElementById("searchblock_input");
  let stock_name = document.getElementById("searchwiki").value;

  let today =  new Date();
  let searchblock_date_end = today.toISOString().substring(0, 10);
  today.setFullYear(today.getFullYear() - 1);
  let searchblock_date_start = today.toISOString().substring(0, 10);

  document.getElementById('searchblock_date_start').value = searchblock_date_start;
  document.getElementById('searchblock_date_end').value = searchblock_date_end;

  searchblock_input.value = stock_name;
  searchblock_form.searchblock_button.click(); // submit(); 하면 에러남
});



//// left
// search wiki autocomplete ajax, 성능 문제시 디바운스 구현 필요
document.getElementById("searchwiki").addEventListener("keyup", (e) => {

    searchword = e.target.value;

    if(searchword.trim().length > 0){
        fetch('../search/', {
          method: 'POST',
          credentials: "same-origin",
          headers: {"X-CSRFToken": csrftoken,
                    "X-Requested-With": "XMLHttpRequest"},
          body: JSON.stringify({ "searchword": searchword }),
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector(".searchwiki_list").innerHTML = data;
        })
        .catch(error => {
            console.log(error);
        });
    }
    // 입력값 없을 때 검색목록 사라지게
    if (searchword.trim().length === 0) {
        document.querySelector(".searchwiki_list").innerHTML = "";
    }
});



////resizer
// 현재 마우스 위치
let x = 0;
let y = 0;

let leftWidth = 0;

const mouseDownHandler = function (e) {
    // 현재 마우스 위치 가져오기
    x = e.clientX;
    y = e.clientY;
    leftWidth = leftSide.getBoundingClientRect().width;

    // 움직일 때와 땔 때 이벤트 추가
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function (e) {
    // 마우스 이동거리
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
    leftSide.style.width = `${newLeftWidth}%`;
    candlestickChart.draw();

    resizer.style.cursor = 'col-resize';
    document.body.style.cursor = 'col-resize';

    leftSide.style.userSelect = 'none';
    leftSide.style.pointerEvents = 'none';

    rightSide.style.userSelect = 'none';
    rightSide.style.pointerEvents = 'none'
};

const mouseUpHandler = function () {
    resizer.style.removeProperty('cursor');
    document.body.style.removeProperty('cursor');

    leftSide.style.removeProperty('user-select');
    leftSide.style.removeProperty('pointer-events');

    rightSide.style.removeProperty('user-select');
    rightSide.style.removeProperty('pointer-events');

    // 움직일 때와 땔 때 이벤트 추가 제거
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
};

resizer.addEventListener('mousedown', mouseDownHandler);



//// side
// 엔터키 눌러도 검색 되도록
function enterkey () {
    if(window.event.keyCode == 13){
        let form = document.getElementById("searchblock");
        form.searchblock_button.click();
    }
}

// side nav btn
document.querySelector(".side_nav_search_wrapper").addEventListener("click", (e) => {
    document.querySelector(".side_chat").style.display = "none";
    document.querySelector(".side_search").style.display = "block";
})

document.querySelector(".side_nav_chat_wrapper").addEventListener("click", (e) => {
    document.querySelector(".side_chat").style.display = "block";
    document.querySelector(".side_search").style.display = "none";
})

// search block ajax
document.getElementById("searchblock").addEventListener("submit", (e) => {
    e.preventDefault();

    let searchword = document.getElementById("searchblock_input").value;
    let searchdate_start = document.getElementById("searchblock_date_start").value;
    let searchdate_end = document.getElementById("searchblock_date_end").value;
    let page = 1;

    search_block_ajax(searchword, searchdate_start, searchdate_end, 1);
});

function search_block_ajax(searchword, searchdate_start, searchdate_end, page)
{
    if(searchword.trim().length > 0){
        fetch('../search/block/', {
          method: 'POST',
          credentials: "same-origin",
          headers: {"X-CSRFToken": csrftoken,
                    "X-Requested-With": "XMLHttpRequest"},
          body: JSON.stringify({ "searchword": searchword,
                                 "searchdate_start": searchdate_start,
                                 "searchdate_end": searchdate_end,
                                 "page": page,
           }),
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("side_block_container").innerHTML = data;
            document.getElementById("side_block_container").addEventListener("click", changeBlockContentTab);

            // pagination 필요 있는지 여부
            if(document.getElementById("block_pagination") !== null)
            {
                document.getElementById("block_pagination").addEventListener("click", changeBlockSearchResultPage);
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
    // 빈 칸으로 검색 하면
    else{
        document.getElementById("side_block_container").innerHTML = "검색결과가 없습니다.";
    }
}

// block click



// block content tab
function changeBlockContentTab (e)
{
   let target = e.target;

   if( target.className !== 'block_content_tab') return;

   if (window.getComputedStyle(target.previousElementSibling).display === 'none'){
       target.previousElementSibling.style.display = 'block';
       target.innerHTML = "닫기";
   }
   else{
       target.previousElementSibling.style.display = 'none';
       target.innerHTML = "더보기";
   }
}

// block pagination btn
function changeBlockSearchResultPage (e)
{
    let target = e.target;

    if( target.className !== 'block_pagination_btn') return;

    let searchword = document.getElementById("searchblock_input").value;
    let searchdate_start = document.getElementById("searchblock_date_start").value;
    let searchdate_end = document.getElementById("searchblock_date_end").value;
    let page = target.innerHTML;

    search_block_ajax(searchword, searchdate_start, searchdate_end, page);
}