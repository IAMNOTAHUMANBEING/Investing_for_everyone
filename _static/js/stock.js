// query the element
let info_btn = document.querySelector(".stock_menu_info");
let chart_btn = document.querySelector(".stock_menu_chart");
let info = document.querySelector(".stock_info");
let chart = document.querySelector(".stock_chart_wrapper");



// chart ajax
function plot(){
    stock_code = document.querySelector(".stock_code").innerHTML;
    console.log(stock_code);

    fetch('http://localhost:8000/wiki/chartdata/', {
          method: 'POST',
          credentials: "same-origin",
          headers: {"X-CSRFToken": csrftoken,
                    "X-Requested-With": "XMLHttpRequest"},
          body: JSON.stringify({ "stock_code": stock_code }),
        })
        .then(response => response.json())
        .then(data => {
            candlestickChart = new CandlestickChart( "stock_chart" );
            for ( let i = 0 ; i < data.length ; ++i )
            {
                candlestickChart.addCandlestick( new Candlestick( data[i].Date , data[i].Open , data[i].High , data[i].Low , data[i].Close,  data[i].Volume, data[i].Change) );
            }
            candlestickChart.setCanvas();
            candlestickChart.draw();
        })
        .catch(error => {
            console.log(error);
    });
}

plot();



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



// info ajax
info_btn.addEventListener("click", (e) => {
    chart.style.display = "none"
    info.style.display = "block"
})

chart_btn.addEventListener("click", (e) => {
    info.style.display = "none"
    chart.style.display ="block"
    candlestickChart.draw();
})