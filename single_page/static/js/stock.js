//function plot(){
//    code = document.querySelector("h2").substr()
//
//    fetch('http://localhost:8000/chart/chartdata/', {
//      method: 'POST',
//      credentials: "same-origin",
//      headers: {"X-CSRFToken": csrftoken,
//                "X-Requested-With": "XMLHttpRequest"},
//      body: JSON.stringify({ "code": code }),
//    })
//    .then(response => response.json())
//    .then(data => {
//
//    })
//    .catch(error => {
//        console.log(error);
//    });
//});
//
//plot();

//init
let searchblock = document.getElementById("searchblock");
let searchblock_input = document.getElementById("searchblock_input");
let stock_name = document.querySelector(".stock_search_input").value;

searchblock_input.value = stock_name;
searchblock.submit;

// chart ajax
function plot()
{
    var xmlhttp = new XMLHttpRequest();
    var num = 100;
    xmlhttp.open( "GET" , "https://api.binance.com/api/v3/klines?symbol=BTCEUR&interval=1d&limit=1000" );
    xmlhttp.onreadystatechange = function()
    {
       	if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 )
        {
            var json = JSON.parse( xmlhttp.responseText );
            candlestickChart = new CandlestickChart( "chart" );
            for ( var i = 0 ; i < json.length ; ++i )
            {
                candlestickChart.addCandlestick( new Candlestick( json[i][0] , json[i][1] , json[i][2] , json[i][3] , json[i][4] ) );
            }
            candlestickChart.setCanvas();
            candlestickChart.draw();
        }
    }
    xmlhttp.setRequestHeader( 'Content-Type' , 'application/x-www-form-urlencoded' );
    xmlhttp.send();
}
plot();

// info ajax
