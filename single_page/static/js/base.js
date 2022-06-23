//////////////////////////////////////
//let vh = window.innerHeight * 0.01
//document.documentElement.style.setProperty('--vh', `${vh}px`)
//window.addEventListener('resize', () => {
//  let vh = window.innerHeight * 0.01
//  document.documentElement.style.setProperty('--vh', `${vh}px`)
//})



//////////////resize/////////////////
// Query the element
const resizer = document.getElementById('resizer');
const leftSide = document.getElementById('left');
const rightSide = document.getElementById('right');

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
function getCookie(name) {
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
function enterkey(){
    if(window.event.keyCode == 13){
        let form = document.getElementById("searchblock")
        form.submit();
    }
}


// block ajax
document.getElementById("searchblock").addEventListener("submit", function(e){
    e.preventDefault();

    search = document.getElementById("searchblock_input").value;

    fetch('http://localhost:8000/chart/search/block/', {
      method: 'POST',
      credentials: "same-origin",
      headers: {"X-CSRFToken": csrftoken,
                "X-Requested-With": "XMLHttpRequest"},
      body: JSON.stringify({ "search": search }),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("block_container").innerHTML = data;
    })
    .catch(error => {
        console.log(error);
    });
});

