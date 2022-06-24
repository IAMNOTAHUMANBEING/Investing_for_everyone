//init
window.addEventListener("load", function () {
  let searchblock_form = document.getElementById("searchblock");
  let searchblock_input = document.getElementById("searchblock_input");
  let stock_name = document.getElementById("searchstock").value;

  let today =  new Date();
  let searchblock_date_end = today.toISOString().substring(0, 10);
  today.setFullYear(today.getFullYear() - 1);
  console.log(today);
  let searchblock_date_start = today.toISOString().substring(0, 10);

  document.getElementById('searchblock_date_start').value = searchblock_date_start;
  document.getElementById('searchblock_date_end').value = searchblock_date_end;

  searchblock_input.value = stock_name;
  searchblock_form.searchblock_button.click(); // submit(); 하면 에러남
});


// search stock
// autocomplete ajax
document.getElementById("searchstock").addEventListener("keyup", (e) =>{

    searchword = e.target.value;
    console.log(searchword);

    if(searchword.trim().length > 0){
        fetch('http://localhost:8000/chart/search/stock/', {
          method: 'POST',
          credentials: "same-origin",
          headers: {"X-CSRFToken": csrftoken,
                    "X-Requested-With": "XMLHttpRequest"},
          body: JSON.stringify({ "searchword": searchword }),
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector(".searchstock_list").innerHTML = data;
        })
        .catch(error => {
            console.log(error);
        });
    }
    // 입력값 없을 때 사라지게
    else{
        document.querySelector(".searchstock_list").innerHTML = "";
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


// info ajax
