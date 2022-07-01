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
        fetch('http://localhost:8000/wiki/search/', {
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
    else{
        document.querySelector(".searchwiki_list").innerHTML = "";
    }
});



// 창 크기 바뀔 때마다 차트 크기도 변하게
let timer;

window.addEventListener('resize', (e) => {
	 if(timer) {
        clearTimeout(timer);
    }
	timer = setTimeout( () => {
        candlestickChart.draw();
	}, 100);
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



// search block ajax
document.getElementById("searchblock").addEventListener("submit", (e) => {
    e.preventDefault();

    let searchword = document.getElementById("searchblock_input").value;
    let searchdate_start = document.getElementById("searchblock_date_start").value;
    let searchdate_end = document.getElementById("searchblock_date_end").value;


    if(searchword.trim().length > 0){
        fetch('http://localhost:8000/wiki/search/block/', {
          method: 'POST',
          credentials: "same-origin",
          headers: {"X-CSRFToken": csrftoken,
                    "X-Requested-With": "XMLHttpRequest"},
          body: JSON.stringify({ "searchword": searchword,
                                 "searchdate_start": searchdate_start,
                                 "searchdate_end": searchdate_end,
           }),
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("side_block_container").innerHTML = data;
        })
        .catch(error => {
            console.log(error);
        });
    }
    else{
        document.getElementById("side_block_container").innerHTML = "검색결과가 없습니다.";
    }
});

// block content tab
document.getElementById("side_block_container").addEventListener("click", (e) =>
{
   let target = e.target;

   if( target.className !== 'block_content_tab') return;

    if (target.previousElementSibling.style.display === 'none'){
        target.previousElementSibling.style.display = 'block';
        target.innerHTML = "닫기";
    }
    else{
        target.previousElementSibling.style.display = 'none';
        target.innerHTML = "더보기";
    }
});


//// search block pagination
//document.querySelectorAll(".block_pagination_btn").forEach( (e) => {
//    e.addEventListener("click", )
//}