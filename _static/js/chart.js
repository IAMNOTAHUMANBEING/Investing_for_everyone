function Candlestick(date, open, high, low, close, volume, change)
{
    this.date = date; // "YYYY-mm-dd str으로 변경"
    this.open = parseFloat(open);
    this.close = parseFloat(close);
    this.high = parseFloat(high);
    this.low = parseFloat(low);
    this.volume = parseInt(volume);
    this.change = parseFloat(change);
}


function CandlestickChart( canvasElementID )
{
    this.canvas = document.getElementById( canvasElementID );
    this.width = parseInt( window.getComputedStyle(document.querySelector(".stock_chart_wrapper")).width ) ;
	this.height = parseInt( window.getComputedStyle(document.querySelector(".stock_chart_wrapper")).height )- 10;
    this.context = this.canvas.getContext( "2d" );

    this.mouseMoveHandler = this.mouseMove.bind(this);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener( "mouseout" , ( e ) => {
        this.mouseOut( e );
    } );

    // 스크롤 하면 캔버스에 표시되는 날짜 수 증가
    this.mouseWheelHandler = this.mouseWheel.bind(this);
    this.canvas.addEventListener('wheel', this.mouseWheelHandler);

    // 캔버스 내에서 마우스 클릭 시
    this.mouseDown = this.mouseDown.bind(this);
    this.canvas.addEventListener('mousedown', this.mouseDown);

    this.canvas.style.backgroundColor = "#ffffff";
    this.context.font = '20px sans-serif';
    this.gridColor = "#e8e6e6";
    this.gridTextColor = "#000000";
    this.priceLineColor = "#303030";
    this.priceLineTextColor = "#ffffff";
    this.timeLineColor = "#303030";
    this.timeLineTextColor = "#ffffff";
    this.mouseHoverBackgroundColor = "#ffffff";
    this.mouseHoverTextColor = "#000000";
    this.increaseColor = "#c4302b";
    this.decreaseColor = "#1e3bbd";
    this.increaseHoverColor = "#ff0700";
    this.decreaseHoverColor = "#0533ff";
//    this.increaseVolumeColor = "#c9726f";
//    this.decreaseVolumeColor = "#818ec9";

    this.context.lineWidth = 1;
    this.candleWidth = 5;

    this.marginLeft = 50;
    this.marginRight = 100;
    this.marginTop = 30;
    this.marginBottom = 30;


    this.priceRangeStart = 0;
    this.priceRangeEnd = 0;
    this.yRange = 0;
    this.yPixelRange = this.height-this.marginTop-this.marginBottom;
    this.xPixelRange = this.width-this.marginLeft-this.marginRight;

    this.xGridCells = 16;
    this.yGridCells = 16;

    this.mouseRightDrag = false;
    this.mouseOverlay = false;
    this.mousePosition = { x: 0 , y: 0 };
    this.hoveredDate = 0;
    this.hoveredPrice = 0;
    this.hoveredCandlestickIndex = 0;

    this.numOfCandlesticksInCanvas = 0;
    this.candlesticks = [];
    this.x = 0;
    this.y = 0;
    this.dragDistance = 0;
}



CandlestickChart.prototype.addCandlestick = function( candlestick )
{
    this.candlesticks.push( candlestick );
}


// 시작 시 캔들 개수와 인덱스
CandlestickChart.prototype.setCanvas = function ()
{
    // 주가 데이터가 1년보다 작은 경우
    if (this.candlesticks.length > 356)
    {
        this.numOfCandlesticksInCanvas = 356;
    }
    else
    {
        this.numOfCandlesticksInCanvas = this.candlesticks.length
    }
    this.indexEnd = this.candlesticks.length - 1;
    this.indexStart = this.indexEnd - this.numOfCandlesticksInCanvas;
}



CandlestickChart.prototype.mouseMove = function( e )
{
    let getMousePos = ( e ) =>
    {
        let rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX-rect.left , y: e.clientY-rect.top };
    }
    this.mousePosition = getMousePos( e );
    this.mousePosition.x += this.candleWidth/2; // 보정값 필요
    this.mouseOverlay = true;
    if ( this.mousePosition.x < this.marginLeft ) this.mouseOverlay = false;
    if (this.mousePosition.x > this.width - this.marginRight + this.candleWidth) this.mouseOverlay = false;
    if ( this.mousePosition.y > this.height - this.marginBottom ) this.mouseOverlay = false;
    if ( this.mouseOverlay )
    {
        // 마우스의 위치(전체 창 기준 위치값)를 날짜와 주가로 바꾸기
        this.hoveredPrice = this.yPixelToPrice( this.mousePosition.y );
        this.hoveredDate = this.xPixelToIndex( this.mousePosition.x );  // pixel -> index;

        // 캔들 내에서 이동 시 날짜 변화 없게
        this.mousePosition.x = this.marginLeft + Math.floor(( this.hoveredDate - this.indexStart ) * this.xPixelRange / this.numOfCandlesticksInCanvas);
        this.draw();
    }
    else this.draw();
}



CandlestickChart.prototype.mouseOut = function( e )
{
    this.canvas.removeEventListener('mousemove', this.mouseRightMoveHandler);
    this.canvas.removeEventListener('mouseup', this.mouseRightUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);

    this.mouseRightDrag = false;
    this.mouseOverlay = false;
    this.draw();
}


// 조건문 말고 스케일에 비례하게 코드 수정
CandlestickChart.prototype.mouseWheel = function (e) 
{
    if (this.numOfCandlesticksInCanvas > 365 * 5) {
        this.numOfCandlesticksInCanvas = Math.floor(this.numOfCandlesticksInCanvas + (1.2 * e.deltaY));
    }
    else if (this.numOfCandlesticksInCanvas > 365 * 3) {
        this.numOfCandlesticksInCanvas = Math.floor(this.numOfCandlesticksInCanvas + (0.7 * e.deltaY));
    }
    else if (this.numOfCandlesticksInCanvas > 30 * 5) {
        this.numOfCandlesticksInCanvas = Math.floor(this.numOfCandlesticksInCanvas + (0.5 * e.deltaY));
    }
    else if (this.numOfCandlesticksInCanvas > 7 * 5) {
        this.numOfCandlesticksInCanvas = Math.floor(this.numOfCandlesticksInCanvas + (0.3 * e.deltaY));
    }
    else {
        this.numOfCandlesticksInCanvas = Math.floor(this.numOfCandlesticksInCanvas + (0.1 * e.deltaY));
    }

    if (this.numOfCandlesticksInCanvas > this.candlesticks.length) this.numOfCandlesticksInCanvas = this.candlesticks.length;
    if (this.numOfCandlesticksInCanvas < 10) this.numOfCandlesticksInCanvas = 10;

    this.draw()
}



CandlestickChart.prototype.mouseDown = function (e)
{
    if((event.button == 2) || (event.which == 3)){
        //마우스 오른쪽 클릭한 경우
        this.x = e.clientX;

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
        this.mouseRightMoveHandler = this.mouseRightMove.bind(this);
        this.canvas.addEventListener('mousemove', this.mouseRightMoveHandler);
        this.mouseRightUpHandler = this.mouseRightUp.bind(this);
        this.canvas.addEventListener('mouseup', this.mouseRightUpHandler);
    }
    else{
        // 마우스 왼쪽 클릭한 경우
        this.x = e.clientX;

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.mouseLeftMoveHandler = this.mouseLeftMove.bind(this);
        window.addEventListener('mousemove', this.mouseLeftMoveHandler);
        this.mouseLeftUpHandler = this.mouseLeftUp.bind(this);
        window.addEventListener('mouseup', this.mouseLeftUpHandler);
    }
}



CandlestickChart.prototype.mouseLeftMove = function (e)
{
    let dx = this.x - e.clientX;

    if (this.numOfCandlesticksInCanvas > 90){
        this.dragDistance = Math.ceil(dx * this.numOfCandlesticksInCanvas * 0.0001);
        this.draw();
    }
    else{
        if (dx % 10 === 0 && dx > 0) {
                this.dragDistance = Math.floor(this.numOfCandlesticksInCanvas / 10);
            }
        if (dx % 10 === 0 && dx < 0) {
                this.dragDistance = -Math.floor(this.numOfCandlesticksInCanvas/ 10);
            }
        this.draw();
        this.dragDistance = 0;
    }
}



CandlestickChart.prototype.mouseLeftUp = function (e)
{
    this.dragDistance = 0;
    window.removeEventListener('mousemove', this.mouseLeftMoveHandler);
    window.removeEventListener('mouseup', this.mouseLeftUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
}


CandlestickChart.prototype.mouseRightMove = function (e)
{
    let getMousePos = ( e ) =>
    {
        let rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX-rect.left, y: e.clientY-rect.top };
    }
    this.dragMousePosition = getMousePos( e );
    this.dragMousePosition.x += this.candleWidth/2; // 보정값 필요
    this.mouseRightDrag = true;

    if ( this.dragMousePosition.x < this.marginLeft ) this.mouseRightDrag = false;
    if ( this.dragMousePosition.x > this.width - this.marginRight + this.candleWidth + 100) this.mouseRightDrag = false;
    if ( this.dragMousePosition.y > this.height - this.marginBottom ) this.mouseRightDrag = false;

    if ( this.mouseRightDrag )
    {
        // 가장 최근 날짜까지 편하게 드래그 하기 위해
        if ( this.dragMousePosition.x > this.width - this.marginRight + this.candleWidth){
             this.RightDragDate = this.xPixelToIndex( this.width - this.marginRight + this.candleWidth );  // pixel -> index;
        }
        else{
            this.RightDragDate = this.xPixelToIndex( this.dragMousePosition.x );  // pixel -> index;
        }
        this.dragMousePosition.x = this.marginLeft + Math.floor(( this.RightDragDate - this.indexStart ) * this.xPixelRange / this.numOfCandlesticksInCanvas);
        this.draw();
    }
    else
    {
        this.draw();
    }
}

CandlestickChart.prototype.mouseRightUp = function (e)
{
    let searchblock_form = document.getElementById("searchblock");
    let searchblock_input = document.getElementById("searchblock_input");

    let hoveredDate = this.candlesticks[this.hoveredDate].date;
    let dragDate = this.candlesticks[this.RightDragDate].date;

    if(hoveredDate > dragDate)
    {
        document.getElementById('searchblock_date_start').value = dragDate;
        document.getElementById('searchblock_date_end').value = hoveredDate;
    }
    else
    {
        document.getElementById('searchblock_date_start').value = hoveredDate;
        document.getElementById('searchblock_date_end').value = dragDate;
    }

    searchblock_form.searchblock_button.click(); // submit(); 하면 에러남

    this.canvas.removeEventListener('mousemove', this.mouseRightMoveHandler);
    this.canvas.removeEventListener('mouseup', this.mouseRightUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);

    this.mouseRightDrag = false;
    this.draw();
}



CandlestickChart.prototype.draw = function()
{
    // canvas 크기 변경된 창에 맞게 재설정
    this.canvas.width = parseInt( window.getComputedStyle(document.querySelector(".stock_chart_wrapper")).width );
    this.canvas.height = parseInt( window.getComputedStyle(document.querySelector(".stock_chart_wrapper")).height ) - 10;

    this.width = parseInt( window.getComputedStyle(document.querySelector(".stock_chart_wrapper")).width );
	this.height = parseInt( window.getComputedStyle(document.querySelector(".stock_chart_wrapper")).height ) - 10;

    this.yPixelRange = this.height-this.marginTop-this.marginBottom;
    this.xPixelRange = this.width-this.marginLeft-this.marginRight;

    // canvas 크기 바뀌면 폰트 크기 재설정 해야함
    this.context.font = '16px sans-serif';

    // 배경 초기화
	this.context.clearRect( 0 , 0 , this.width , this.height );

    // 차트에 표시할 캔들 인덱스 계산
    this.updateIndex();

    // 주가 범위 계산
    this.calculateYPriceRange();

    // 최대 거래량 계산
    // this.calculateVolume();

    this.drawGrid();
    
    this.candleWidth = this.xPixelRange / this.numOfCandlesticksInCanvas;

    this.candleWidth--;
    if ( this.candleWidth%2 === 0 ) this.candleWidth--;  // 가독성을 위해 캔들 사이 틈 만듬

    // 최근 캔들부터 생성
    for (let i = this.indexEnd; i > this.indexStart - 1; --i )
    {

        let color = (this.candlesticks[i].close > this.candlesticks[i].open ) ? this.increaseColor : this.decreaseColor;
//        let volumeColor = (this.candlesticks[i].close > this.candlesticks[i].open ) ? this.increaseVolumeColor : this.decreaseVolumeColor;
//        let volumeHeight = (this.yPixelRange / 4) * (this.candlesticks[i].volume / this.maxVolume);

        if ( i === this.hoveredDate )
        {
            if ( color === this.increaseColor ) color = this.increaseHoverColor;
            else if ( color === this.decreaseColor ) color = this.decreaseHoverColor;
        }

        if ( this.candlesticks[i].high === this.candlesticks[i].low)
        {
            // 거래정지거나 가격 변동이 없는 날 캔들 그리기
            this.fillRect(this.indexToXPixel(i) - Math.floor(this.candleWidth / 2), this.priceToYPixel(this.candlesticks[i].close), this.candleWidth, 1, color );
        }
        else
        {
            // 캔들 꼬치 그리기
            this.drawLine(this.indexToXPixel(i), this.priceToYPixel(this.candlesticks[i].low), this.indexToXPixel(i), this.priceToYPixel(this.candlesticks[i].high ) , color );

            // 캔들 그리기
            this.fillRect(this.indexToXPixel(i) - Math.floor(this.candleWidth / 2), this.priceToYPixel(this.candlesticks[i].open), this.candleWidth, this.priceToYPixel(this.candlesticks[i].close) - this.priceToYPixel(this.candlesticks[i].open ) , color );

            // 박스 그리기
//            if( i%100 === 1){
//                document.querySelector(".stock_chart_wrapper").innerHTML += "<div style='position:relative; top:100;left:100; z-index:100;'>테스트</div>";
//            }

            // 거래량 그리기
            // this.fillRect(this.indexToXPixel(i) - Math.floor(this.candleWidth / 2), this.priceToYPixel(this.priceRangeStart), this.candleWidth, -volumeHeight, color );
        }
    }

    // 호버 되었을 때 해당 날짜 정보
    if ( this.mouseOverlay )
    {
        // 마우스 위치 가격을 표시하는 박스와 선
        this.context.setLineDash( [5,5] );
        this.drawLine(0, this.mousePosition.y, this.width, this.mousePosition.y, this.priceLineColor );
        this.context.setLineDash( [] );
        let str = this.roundPriceValue( this.hoveredPrice );
        let textWidth = this.context.measureText( str ).width;
        this.fillRect(this.width - 70, this.mousePosition.y - 10, 70, 20, this.priceLineColor );
        this.context.fillStyle = this.priceLineTextColor;
        this.context.fillText( str , this.width-textWidth-5 , this.mousePosition.y+5 );

        // 마우스 위치 날짜를 표시하는 박스와 선
        this.context.setLineDash( [5,5] );
        this.drawLine(this.mousePosition.x, 0, this.mousePosition.x, this.height, this.timeLineColor );
        this.context.setLineDash( [] );
        str = this.candlesticks[this.hoveredDate].date;
        textWidth = this.context.measureText( str ).width;
        this.fillRect(this.mousePosition.x - textWidth / 2 - 5, this.height - 20, textWidth + 10, 20, this.timeLineColor );
        this.context.fillStyle = this.timeLineTextColor;
        this.context.fillText( str , this.mousePosition.x-textWidth/2 , this.height-5 );

        // 마우스 위치에 따라 정보 박스 생성 위치 다르게
        let yPos = this.mousePosition.y-95;
        if ( yPos < 0 ) yPos = this.mousePosition.y+15;

        this.fillRect( this.mousePosition.x+15 , yPos , 120 , 100 , this.mouseHoverBackgroundColor );
        let color = ( this.candlesticks[this.hoveredDate].close > this.candlesticks[this.hoveredDate].open ) ? this.greenColor : this.redColor;

        // 디자인 수정 필요
        this.fillRect( this.mousePosition.x+15 , yPos , 150 , 150 , color );
        this.context.lineWidth = 2;
        this.drawRect( this.mousePosition.x+15 , yPos , 150 , 150 , color );
        this.context.lineWidth = 1;

        // 당일 주가 정보
        this.context.fillStyle = this.mouseHoverTextColor;
        this.context.fillText( "시가: "+this.candlesticks[this.hoveredDate].open , this.mousePosition.x+30 , yPos+25 );
        this.context.fillText( "종가: "+this.candlesticks[this.hoveredDate].close , this.mousePosition.x+30 , yPos+45 );
        this.context.fillText( "고가: "+this.candlesticks[this.hoveredDate].high , this.mousePosition.x+30 , yPos+65 );
        this.context.fillText( "저가: "+this.candlesticks[this.hoveredDate].low , this.mousePosition.x+30 , yPos+85 );
        this.context.fillText( "등락률: "+ Math.round((this.candlesticks[this.hoveredDate].change * 100 + Number.EPSILON) * 100) / 100 , this.mousePosition.x+30 , yPos+115 );
        this.context.fillText( "거래량: "+this.candlesticks[this.hoveredDate].volume , this.mousePosition.x+30 , yPos+135 );
    }

    if ( this.mouseRightDrag )
    {
        // 마우스 위치 날짜를 표시하는 박스와 선
        this.context.setLineDash( [5,5] );
        this.drawLine(this.dragMousePosition.x, 0, this.dragMousePosition.x, this.height, this.timeLineColor );
        this.context.setLineDash( [] );
        str = this.candlesticks[this.RightDragDate].date;
        textWidth = this.context.measureText( str ).width;
        this.fillRect(this.dragMousePosition.x - textWidth / 2 - 5, this.height - 20, textWidth + 10, 20, this.timeLineColor );
        this.context.fillStyle = this.timeLineTextColor;
        this.context.fillText( str , this.dragMousePosition.x-textWidth/2 , this.height-5 );
    }
}


// 캔버스 크기 별 x, y 축 스케일 조건 추가해야함
CandlestickChart.prototype.drawGrid = function()
{
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        
    // 가로선 간격
    let yGridSize = (this.yRange) / this.yGridCells;

    // 간격 올림 처리
    let niceNumber = Math.pow( 10 , Math.ceil( Math.log10( yGridSize ) ) );
    if ( yGridSize < 0.25 * niceNumber ) niceNumber = 0.25 * niceNumber;
    else if ( yGridSize < 0.5 * niceNumber ) niceNumber = 0.5 * niceNumber;

    // 주가 최대 최소선
    let priceRangeStartRoundNumber = Math.ceil( this.priceRangeStart/niceNumber ) * niceNumber;
    let priceRangeEndRoundNumber = Math.floor( this.priceRangeEnd/niceNumber ) * niceNumber;

    for ( let y = priceRangeStartRoundNumber ; y <= priceRangeEndRoundNumber ; y += niceNumber )
    {
        this.drawLine( 0 , this.priceToYPixel( y ) , this.width , this.priceToYPixel( y ) , this.gridColor );
        let textWidth = this.context.measureText( this.roundPriceValue( y ) ).width;
        this.context.fillStyle = this.gridTextColor;
        this.context.fillText( this.roundPriceValue( y ) , this.width-textWidth-5 , this.priceToYPixel( y )-5 );
    }

    // 1일 달의 시작이 아님 휴일이 있을 수 있음
    if (this.numOfCandlesticksInCanvas > 365 * 3 || this.canvas.width < 1000)
    {   
        for (let x = this.indexStart; x <= this.indexEnd; x += 1)
        {
             if (x === this.indexStart)
             {
                //pass
             }
             else if (this.candlesticks[x - 1].date.substr(0, 4) !== this.candlesticks[x].date.substr(0, 4))
            {
                this.drawLine(this.indexToXPixel(x), 0, this.indexToXPixel(x), this.height, this.gridColor);
                let dateStr = this.candlesticks[x].date.substr(0, 4);
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.indexToXPixel(x) + 5, this.height - 5);
            }
        }
    }
    else if (this.numOfCandlesticksInCanvas > 30 * 5)
    {
        for (let x = this.indexStart; x <= this.indexEnd; x += 1)
        {
            if (x === this.indexStart)
             {
                //pass
             }
             else if (this.candlesticks[x - 1].date.substr(0, 4) !== this.candlesticks[x].date.substr(0, 4))
            {
                this.drawLine(this.indexToXPixel(x), 0, this.indexToXPixel(x), this.height, this.gridColor);
                let dateStr = this.candlesticks[x].date.substr(0, 4);
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.indexToXPixel(x) + 5, this.height - 5);
            }
            else if (this.candlesticks[x - 1].date.substr(5, 2) !== this.candlesticks[x].date.substr(5, 2))
            {
                this.drawLine(this.indexToXPixel(x), 0, this.indexToXPixel(x), this.height, this.gridColor);
                let dateStr = monthNames[Number(this.candlesticks[x].date.substr(5, 2)) - 1];
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.indexToXPixel(x) + 5, this.height - 5);
            }
        }
    }
    else if (this.numOfCandlesticksInCanvas > 7 * 5){
        for (let x = this.indexStart; x <= this.indexEnd; x += 1)
        {
            if (x === this.indexStart)
             {
                //pass
             }
             else if (this.candlesticks[x - 1].date.substr(5, 2) !== this.candlesticks[x].date.substr(5, 2))
            {
                this.drawLine(this.indexToXPixel(x), 0, this.indexToXPixel(x), this.height, this.gridColor);
                let dateStr = monthNames[Number(this.candlesticks[x].date.substr(5, 2)) - 1];
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.indexToXPixel(x) + 5, this.height - 5);
            }
            else if ([6, 12, 18, 24].includes(Number(this.candlesticks[x].date.substr(8, 2))))
            {
                this.drawLine(this.indexToXPixel(x), 0, this.indexToXPixel(x), this.height, this.gridColor);
                let dateStr = this.candlesticks[x].date.substr(8, 2);
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.indexToXPixel(x) + 5, this.height - 5);
            }
        }
    }
    else{
        for (let x = this.indexStart; x <= this.indexEnd; x += 1)
        {
            if (x === this.indexStart)
             {
                //pass
             }
             else if (this.candlesticks[x - 1].date.substr(5, 2) !== this.candlesticks[x].date.substr(5, 2))
            {
                this.drawLine(this.indexToXPixel(x), 0, this.indexToXPixel(x), this.height, this.gridColor);
                let dateStr = monthNames[Number(this.candlesticks[x].date.substr(5, 2)) - 1];
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.indexToXPixel(x) + 5, this.height - 5);
            }
            else if(Number(this.candlesticks[x].date.substr(8, 2)) % 2 === 0)
            {
                this.drawLine(this.indexToXPixel(x), 0, this.indexToXPixel(x), this.height, this.gridColor);
                let dateStr = this.candlesticks[x].date.substr(8, 2);
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.indexToXPixel(x) + 5, this.height - 5);
            }
            
        }
    }
}


// 주가 최대 최소 값 이용해서 y축 주가길이 구하기
CandlestickChart.prototype.calculateYPriceRange = function()
{
    for (let i = this.indexStart; i < this.indexEnd + 1; ++i )
    {
        if (i === this.indexStart )
        {
            // 거래정지 기간이 포함되는 경우 고려
            if (this.candlesticks[i].low === 0)
            {
                this.priceRangeStart = this.candlesticks[i].close;
            }
            else
            {
                this.priceRangeStart = this.candlesticks[i].low;
            }

            this.priceRangeEnd = this.candlesticks[i].high;
        }
        else
        {
            if (this.candlesticks[i].low < this.priceRangeStart )
            {
                // 거래정지 기간이 포함되는 경우 고려
                if (this.candlesticks[i].low === 0)
                {
                    //pass
                }
                else
                {
                    this.priceRangeStart = this.candlesticks[i].low;
                }
            }

            if (this.candlesticks[i].high > this.priceRangeEnd )
            {
                this.priceRangeEnd = this.candlesticks[i].high;
            }
        }
    }
    this.yRange = this.priceRangeEnd - this.priceRangeStart;
}



//CandlestickChart.prototype.calculateVolume = function()
//{
//    for (let i = this.indexStart; i < this.indexEnd + 1; ++i )
//    {
//        if (i === this.indexStart )
//        {
//            this.maxVolume = this.candlesticks[i].volume;
//        }
//        else
//        {
//            if (this.candlesticks[i].volume > this.maxVolume )
//            {
//                this.maxVolume = this.candlesticks[i].volume;
//            }
//        }
//    }
//}


// 주가를 차트 기준 y로 바꾸기
CandlestickChart.prototype.priceToYPixel = function( y )
{
    return this.height - this.marginBottom - ( y - this.priceRangeStart) * this.yPixelRange/this.yRange;
}


// index -> pixel in canvas
CandlestickChart.prototype.indexToXPixel = function( x )
{
    return this.marginLeft + ( x - this.indexStart ) * this.xPixelRange / this.numOfCandlesticksInCanvas;
}


// y 픽셀 값을 주가로 바꾸기
CandlestickChart.prototype.yPixelToPrice = function( y )
{
    return this.priceRangeStart + ( this.height - this.marginBottom - y ) * this.yRange/this.yPixelRange;
}


// x 픽셀 값을 날짜로 바꾸기
CandlestickChart.prototype.xPixelToIndex = function( x )
{
    // x 위치 값을 index로 바꿔서 candlestick의 date 출력
    return this.indexStart + Math.floor(( x - this.marginLeft ) * this.numOfCandlesticksInCanvas / this.xPixelRange)
}



CandlestickChart.prototype.drawLine = function( xStart , yStart , xEnd , yEnd , color )
{
	this.context.beginPath();
	this.context.moveTo( xStart+0.5 , yStart + 0.5 );
	this.context.lineTo( xEnd+0.5 , yEnd + 0.5 );
	this.context.strokeStyle = color;
	this.context.stroke();
}



CandlestickChart.prototype.fillRect = function( x , y , width , height , color )
{
	this.context.beginPath();
    this.context.fillStyle = color;
	this.context.rect( x , y , width , height );
	this.context.fill();
}



CandlestickChart.prototype.drawRect = function( x , y , width , height , color )
{
	this.context.beginPath();
    this.context.strokeStyle = color;
	this.context.rect( x , y , width , height );
	this.context.stroke();
}



CandlestickChart.prototype.roundPriceValue = function( value )
{
    if ( value > 1.0 ) return Math.round( value*100 )/100;
    if ( value > 0.001 ) return Math.round( value*1000 )/1000;
    if ( value > 0.00001 ) return Math.round( value*100000 )/100000;
    if ( value > 0.0000001 ) return Math.round( value*10000000 )/10000000;
    else return Math.round( value*1000000000 )/1000000000;
}



CandlestickChart.prototype.updateIndex = function()
{
    
    this.indexEnd = this.indexEnd + this.dragDistance;
    this.indexStart = this.indexEnd - this.numOfCandlesticksInCanvas;

    if (this.indexStart < 0 || this.indexEnd < 0)
    {
        this.indexStart = 0;
        this.indexEnd = this.numOfCandlesticksInCanvas -1;
    }
    if (this.indexEnd > this.candlesticks.length - 1 || this.indexStart > this.candlesticks.length - 1)
    {
        this.indexStart = this.candlesticks.length - this.numOfCandlesticksInCanvas;
        this.indexEnd = this.candlesticks.length - 1;
    }
}
