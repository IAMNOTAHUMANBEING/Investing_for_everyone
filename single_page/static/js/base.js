///////////////mobile//////////
//let vh = window.innerHeight * 0.01
//document.documentElement.style.setProperty('--vh', `${vh}px`)
//window.addEventListener('resize', () => {
//  let vh = window.innerHeight * 0.01
//  document.documentElement.style.setProperty('--vh', `${vh}px`)
//})

// Query the element
const resizer = document.getElementById('resizer');
const leftSide = document.getElementById('left');
const rightSide = document.getElementById('right');



////////////left///////////////////
//init
window.addEventListener("load", () => {
  let searchblock_form = document.getElementById("searchblock");
  let searchblock_input = document.getElementById("searchblock_input");
  let stock_name = document.getElementById("searchpage").value;

  let today =  new Date();
  let searchblock_date_end = today.toISOString().substring(0, 10);
  today.setFullYear(today.getFullYear() - 1);
  let searchblock_date_start = today.toISOString().substring(0, 10);

  document.getElementById('searchblock_date_start').value = searchblock_date_start;
  document.getElementById('searchblock_date_end').value = searchblock_date_end;

  searchblock_input.value = stock_name;
  searchblock_form.searchblock_button.click(); // submit(); 하면 에러남
});



// search page
// autocomplete ajax, 성능 문제시 디바운스 구현 필요
document.getElementById("searchpage").addEventListener("keyup", (e) => {

    searchword = e.target.value;

    if(searchword.trim().length > 0){
        fetch('http://localhost:8000/wiki/search/page/', {
          method: 'POST',
          credentials: "same-origin",
          headers: {"X-CSRFToken": csrftoken,
                    "X-Requested-With": "XMLHttpRequest"},
          body: JSON.stringify({ "searchword": searchword }),
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector(".searchpage_list").innerHTML = data;
        })
        .catch(error => {
            console.log(error);
        });
    }
    // 입력값 없을 때 사라지게
    else{
        document.querySelector(".searchpage_list").innerHTML = "";
    }
});



// 창 크기가 바뀔 때마다 차트 다시 그려지도록
let timer;

window.addEventListener('resize', (e) => {
	 if(timer) {
        clearTimeout(timer);
    }
	timer = setTimeout( () => {
        candlestickChart.draw();
	}, 100);
}); // 스크롤 있는 크기로 작아지면 실행 안되는 문제, 마우스 움직일때마다 그리면 해결되는데 비효율적



//////////////resize/////////////////
// The current position of mouse
let x = 0;
let y = 0;

// Width of left side
let leftWidth = 0;

// Handle the mousedown event
// that's triggered when user drags the resizer
const mouseDownHandler = function (e) {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;
    leftWidth = leftSide.getBoundingClientRect().width;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
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

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
};

// Attach the handler
resizer.addEventListener('mousedown', mouseDownHandler);


/////////////side//////////////////////////
// setting
function getCookie (name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            //이 쿠키 문자열이 원하는 이름으로 시작합니까?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// enterkey
function enterkey () {
    if(window.event.keyCode == 13){
        let form = document.getElementById("searchblock");
        form.searchblock_button.click();
    }
}

// block ajax
document.getElementById("searchblock").addEventListener("submit", (e) => {
    e.preventDefault();

    searchword = document.getElementById("searchblock_input").value;
    searchdate_start = document.getElementById("searchblock_date_start").value;
    searchdate_end = document.getElementById("searchblock_date_end").value;

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
            document.getElementById("block_container").innerHTML = data;
        })
        .catch(error => {
            console.log(error);
        });
    }
    else{
        document.getElementById("block_container").innerHTML = "검색결과가 없습니다.";
    }
});
