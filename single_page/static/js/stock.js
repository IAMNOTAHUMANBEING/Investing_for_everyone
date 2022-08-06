// query the element
let info_btn = document.querySelector(".stock_menu_info");
let chart_btn = document.querySelector(".stock_menu_chart");
let tag_btn = document.querySelector(".stock_menu_tag");
let info = document.querySelector(".stock_info");
let chart = document.querySelector(".stock_chart_wrapper");
let tag = document.querySelector(".wiki_tag");
let code = document.querySelector(".stock_code");


// chart ajax
function plot(){
    displayChartLoading("https://github.com/IAMNOTAHUMANBEING/img_repo/blob/main/searchloading.gif?raw=true");

    stock_code = document.querySelector(".stock_code").innerHTML;

    fetch('../chartdata/', {
          method: 'POST',
          credentials: "same-origin",
          headers: {"X-CSRFToken": csrftoken,
                    "X-Requested-With": "XMLHttpRequest"},
          body: JSON.stringify({ "stock_code": stock_code }),
        })
        .then(response => response.json())
        .then(data => {
            hideChartLoading();
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

if (code != null)
{
    plot();
}



// chart ajax loading
function  displayChartLoading(gif)
{
    document.querySelector(".chartLoadingGif").innerHTML = " <img src='"+ gif + "' style='display: block; position:relative; top:130%;'/>";
}

function  hideChartLoading()
{
    document.querySelector(".chartLoadingGif").innerHTML = "";
}



// 창 크기 바뀔 때마다 차트 크기도 변하게
let timer;

window.addEventListener('resize', (e) => {
	 if(timer) {
        clearTimeout(timer);
    }
	timer = setTimeout( () => {
        if (code != null)
        {
            candlestickChart.draw();
        }
	}, 100);
});



// info btn
if (code != null)
{
    chart_btn.addEventListener("click", (e) => {
        tag.style.display = "none";
        info.style.display = "none";
        chart.style.display ="block";
        candlestickChart.draw();
    })

    info_btn.addEventListener("click", (e) => {
        tag.style.display = "none";
        chart.style.display = "none";
        info.style.display = "block";
    })

    tag_btn.addEventListener("click", (e) => {
        info.style.display = "none";
        chart.style.display = "none";
        tag.style.display = "flex";
    })
}
else
{
    info.style.display = "block";

    info_btn.addEventListener("click", (e) => {
            tag.style.display = "none";
            info.style.display = "block";
    })

    tag_btn.addEventListener("click", (e) => {
            info.style.display = "none";
            tag.style.display = "flex";
    })
}