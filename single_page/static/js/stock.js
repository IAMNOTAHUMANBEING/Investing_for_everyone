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
window.addEventListener("load", function () {
  let form = document.getElementById("searchblock");
  let input = document.getElementById("searchblock_input");
  let stock_name = document.getElementById("searchstock").value;

  input.value = stock_name;
  form.searchblock_button.click(); // submit(); 하면 에러남
});

// search stock ajax
const searchstock = document.getElementById("searchstock");

searchstock.addEventListener('keyup', (e) =>{
    const searchword = e.target.value;

    if(searchword.trim().length > 0){
        console.log(searchword);

        fetch('http://localhost:8000/chart/search/stock/', {
            method: 'POST',
            credentials: "same-origin",
            headers: {"X-CSRFToken": csrftoken,
                      "X-Requested-With": "XMLHttpRequest"},
            body: JSON.stringify({ "searchword": searchword }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.log(error);
        });
    }
});


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
