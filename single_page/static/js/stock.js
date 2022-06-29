// test
//function plot()
//{
//    var xmlhttp = new XMLHttpRequest();
//    var num = 100;
//    xmlhttp.open( "GET" , "https://api.binance.com/api/v3/klines?symbol=BTCEUR&interval=1d&limit=1000" );
//    xmlhttp.onreadystatechange = function()
//    {
//       	if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 )
//        {
//            var json = JSON.parse( xmlhttp.responseText );
//            candlestickChart = new CandlestickChart( "chart" );
//            for ( var i = 0 ; i < json.length ; ++i )
//            {
//                candlestickChart.addCandlestick( new Candlestick( json[i][0] , json[i][1] , json[i][2] , json[i][3] , json[i][4] ) );
//            }
//            candlestickChart.setCanvas();
//            candlestickChart.draw();
//        }
//    }
//    xmlhttp.setRequestHeader( 'Content-Type' , 'application/x-www-form-urlencoded' );
//    xmlhttp.send();
//}
//plot();

//
let info_btn = document.querySelector(".stock_menu_info");
let chart_btn = document.querySelector(".stock_menu_chart");
let info = document.querySelector(".stock_info");
let chart = document.querySelector(".stock_chart_wrapper");

// chart ajax
function plot(){
    stock_name = document.getElementById("searchpage").value;

    fetch('http://localhost:8000/wiki/chartdata/', {
          method: 'POST',
          credentials: "same-origin",
          headers: {"X-CSRFToken": csrftoken,
                    "X-Requested-With": "XMLHttpRequest"},
          body: JSON.stringify({ "stock_name": stock_name }),
        })
        .then(response => response.json())
        .then(data => {
            candlestickChart = new CandlestickChart( "stock_chart" );
            for ( let i = 0 ; i < data.length ; ++i )
            {
                candlestickChart.addCandlestick( new Candlestick( data[i].Date , data[i].Open , data[i].High , data[i].Low , data[i].Close ) );
            }
            candlestickChart.setCanvas();
            candlestickChart.draw();
        })
        .catch(error => {
            console.log(error);
    });
}

plot();


//info ajax
info_btn.addEventListener("click", (e) => {
    chart.style.display = "none"
    info.style.display = "block"
})

chart_btn.addEventListener("click", (e) => {
    info.style.display = "none"
    chart.style.display ="block"
    candlestickChart.draw();
})