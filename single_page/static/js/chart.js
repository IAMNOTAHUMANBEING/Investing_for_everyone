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


    this.yStart = 0;
    this.yEnd = 0;
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

    this.candlesticksInCanvas = 0;
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
    this.candlesticksInCanvas = 356;
    this.endindex = this.candlesticks.length - 1;
    this.startindex = this.endindex - this.candlesticksInCanvas;
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
        this.hoveredPrice = this.yToPrices( this.mousePosition.y );
        this.hoveredDate = this.xToIndex( this.mousePosition.x );  // pixel -> index;

        // 캔들 내에서 이동 시 날짜 변화 없게
        this.mousePosition.x = this.marginLeft + Math.floor(( this.hoveredDate - this.startindex ) * this.xPixelRange / this.candlesticksInCanvas);
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
    if (this.candlesticksInCanvas > 365 * 5) {
        this.candlesticksInCanvas = Math.floor(this.candlesticksInCanvas + (1.2 * e.deltaY));
    }
    else if (this.candlesticksInCanvas > 365 * 3) {
        this.candlesticksInCanvas = Math.floor(this.candlesticksInCanvas + (0.7 * e.deltaY));
    }
    else if (this.candlesticksInCanvas > 30 * 5) {
        this.candlesticksInCanvas = Math.floor(this.candlesticksInCanvas + (0.5 * e.deltaY));
    }
    else if (this.candlesticksInCanvas > 7 * 5) {
        this.candlesticksInCanvas = Math.floor(this.candlesticksInCanvas + (0.3 * e.deltaY));
    }
    else {
        this.candlesticksInCanvas = Math.floor(this.candlesticksInCanvas + (0.1 * e.deltaY));
    }

    if (this.candlesticksInCanvas > this.candlesticks.length) this.candlesticksInCanvas = this.candlesticks.length;
    if (this.candlesticksInCanvas < 10) this.candlesticksInCanvas = 10;

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


// 부드러운 수정 필요
CandlestickChart.prototype.mouseLeftMove = function (e)
{
    let dx = this.x - e.clientX;

    if (this.candlesticksInCanvas > 365 * 3) {
        this.dragDistance = Math.ceil(dx * 0.2);
        this.draw();
    }
    else if (this.candlesticksInCanvas > 30 * 5) {
        this.dragDistance = Math.ceil(dx * 0.03);
        this.draw();
    }
    else if (this.candlesticksInCanvas > 7 * 5) {
        if (dx > 0) {
            this.dragDistance = 3;
        }
        if (dx < 0) {
            this.dragDistance = -3;
        }
        this.draw();
        this.dragDistance = 0;
    }
    else {
        if (dx % 10 === 0 && dx > 0) {
            this.dragDistance = 1;
        }
        if (dx % 10 === 0 && dx < 0) {
            this.dragDistance = -1;
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
    if ( this.dragMousePosition.x > this.width - this.marginRight + this.candleWidth) this.mouseRightDrag = false;
    if ( this.dragMousePosition.y > this.height - this.marginBottom ) this.mouseRightDrag = false;

    if ( this.mouseRightDrag )
    {
        this.RightDragDate = this.xToIndex( this.dragMousePosition.x );  // pixel -> index;
        this.dragMousePosition.x = this.marginLeft + Math.floor(( this.RightDragDate - this.startindex ) * this.xPixelRange / this.candlesticksInCanvas);
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
    // canvas 크기 재설정
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
    this.calculateYRange();

    // 최대 거래량 계산
//    this.calculateVolume();

    this.drawGrid();
    
    this.candleWidth = this.xPixelRange / this.candlesticksInCanvas;

    this.candleWidth--;
    if ( this.candleWidth%2 === 0 ) this.candleWidth--;  // 가독성을 위해 캔들 사이 틈 만듬

    // 최근 캔들부터 생성
    for (let i = this.endindex - 1; i > this.startindex - 1; --i )
    {

        let color = (this.candlesticks[i].close > this.candlesticks[i].open ) ? this.increaseColor : this.decreaseColor;
//        let volumeColor = (this.candlesticks[i].close > this.candlesticks[i].open ) ? this.increaseVolumeColor : this.decreaseVolumeColor;
//        let volumeHeight = (this.yPixelRange / 4) * (this.candlesticks[i].volume / this.maxVolume);

        if ( i === this.hoveredDate )
        {
            if ( color === this.increaseColor ) color = this.increaseHoverColor;
            else if ( color === this.decreaseColor ) color = this.decreaseHoverColor;
        }

        if ( this.candlesticks[i].high === 0 && this.candlesticks[i].low === 0 )
        {
            // 거래정지일때 캔들 그리기
            this.fillRect(this.xToPixelCoords(i) - Math.floor(this.candleWidth / 2), this.yToPixelCoords(this.candlesticks[i].close), this.candleWidth, 1, color );
        }
        else
        {
            // 캔들 꼬치 그리기
            this.drawLine(this.xToPixelCoords(i), this.yToPixelCoords(this.candlesticks[i].low), this.xToPixelCoords(i), this.yToPixelCoords(this.candlesticks[i].high ) , color );

            // 캔들 그리기
            this.fillRect(this.xToPixelCoords(i) - Math.floor(this.candleWidth / 2), this.yToPixelCoords(this.candlesticks[i].open), this.candleWidth, this.yToPixelCoords(this.candlesticks[i].close) - this.yToPixelCoords(this.candlesticks[i].open ) , color );

//            // 거래량 그리기
//            this.fillRect(this.xToPixelCoords(i) - Math.floor(this.candleWidth / 2), this.yToPixelCoords(this.yStart), this.candleWidth, -volumeHeight, color );
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
        this.fillRect( this.mousePosition.x+15 , yPos , 10 , 80 , color );
        this.context.lineWidth = 2;
        this.drawRect( this.mousePosition.x+15 , yPos , 120 , 100 , color );
        this.context.lineWidth = 1;

        // 내용 수정 필요, DB와 연동해서 값 가져오게 수정
        this.context.fillStyle = this.mouseHoverTextColor;
        this.context.fillText( "시가: "+this.candlesticks[this.hoveredDate].open , this.mousePosition.x+30 , yPos+25 );
        this.context.fillText( "종가: "+this.candlesticks[this.hoveredDate].close , this.mousePosition.x+30 , yPos+45 );
        this.context.fillText( "고가: "+this.candlesticks[this.hoveredDate].high , this.mousePosition.x+30 , yPos+65 );
        this.context.fillText( "저가: "+this.candlesticks[this.hoveredDate].low , this.mousePosition.x+30 , yPos+85 );
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


// 크기 별 x, y 축 스케일 조건 추가해야함
CandlestickChart.prototype.drawGrid = function()
{
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        
    // roughly divide the yRange into cells
    let yGridSize = (this.yRange) / this.yGridCells;

    // try to find a nice number to round to
    let niceNumber = Math.pow( 10 , Math.ceil( Math.log10( yGridSize ) ) );
    if ( yGridSize < 0.25 * niceNumber ) niceNumber = 0.25 * niceNumber;
    else if ( yGridSize < 0.5 * niceNumber ) niceNumber = 0.5 * niceNumber;

    // find next largest nice number above yStart
    let yStartRoundNumber = Math.ceil( this.yStart/niceNumber ) * niceNumber;
    // find next lowest nice number below yEnd
    let yEndRoundNumber = Math.floor( this.yEnd/niceNumber ) * niceNumber;

    for ( let y = yStartRoundNumber ; y <= yEndRoundNumber ; y += niceNumber )
    {
        this.drawLine( 0 , this.yToPixelCoords( y ) , this.width , this.yToPixelCoords( y ) , this.gridColor );
        let textWidth = this.context.measureText( this.roundPriceValue( y ) ).width;
        this.context.fillStyle = this.gridTextColor;
        this.context.fillText( this.roundPriceValue( y ) , this.width-textWidth-5 , this.yToPixelCoords( y )-5 );
    }

    // 1일 달의 시작이 아님 휴일이 있을 수 있음
    if (this.candlesticksInCanvas > 365 * 3 || this.canvas.width < 1000)
    {   
        for (let x = this.startindex; x <= this.endindex; x += 1)
        {
             if (x === this.startindex)
             {
                //pass
             }
             else if (this.candlesticks[x - 1].date.substr(0, 4) !== this.candlesticks[x].date.substr(0, 4))
            {
                this.drawLine(this.xToPixelCoords(x), 0, this.xToPixelCoords(x), this.height, this.gridColor);
                let dateStr = this.candlesticks[x].date.substr(0, 4);
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.xToPixelCoords(x) + 5, this.height - 5);
            }
        }
    }
    else if (this.candlesticksInCanvas > 30 * 5)
    {
        for (let x = this.startindex; x <= this.endindex; x += 1)
        {
            if (x === this.startindex)
             {
                //pass
             }
             else if (this.candlesticks[x - 1].date.substr(0, 4) !== this.candlesticks[x].date.substr(0, 4))
            {
                this.drawLine(this.xToPixelCoords(x), 0, this.xToPixelCoords(x), this.height, this.gridColor);
                let dateStr = this.candlesticks[x].date.substr(0, 4);
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.xToPixelCoords(x) + 5, this.height - 5);
            }
            else if (this.candlesticks[x - 1].date.substr(5, 2) !== this.candlesticks[x].date.substr(5, 2))
            {
                this.drawLine(this.xToPixelCoords(x), 0, this.xToPixelCoords(x), this.height, this.gridColor);
                let dateStr = monthNames[Number(this.candlesticks[x].date.substr(5, 2)) - 1];
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.xToPixelCoords(x) + 5, this.height - 5);
            }
        }
    }
    else if (this.candlesticksInCanvas > 7 * 5){
        for (let x = this.startindex; x <= this.endindex; x += 1)
        {
            if (x === this.startindex)
             {
                //pass
             }
             else if (this.candlesticks[x - 1].date.substr(5, 2) !== this.candlesticks[x].date.substr(5, 2))
            {
                this.drawLine(this.xToPixelCoords(x), 0, this.xToPixelCoords(x), this.height, this.gridColor);
                let dateStr = monthNames[Number(this.candlesticks[x].date.substr(5, 2)) - 1];
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.xToPixelCoords(x) + 5, this.height - 5);
            }
            else if ([6, 12, 18, 24].includes(Number(this.candlesticks[x].date.substr(8, 2))))
            {
                this.drawLine(this.xToPixelCoords(x), 0, this.xToPixelCoords(x), this.height, this.gridColor);
                let dateStr = this.candlesticks[x].date.substr(8, 2);
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.xToPixelCoords(x) + 5, this.height - 5);
            }
        }
    }
    else{
        for (let x = this.startindex; x <= this.endindex; x += 1)
        {
            if (x === this.startindex)
             {
                //pass
             }
             else if (this.candlesticks[x - 1].date.substr(5, 2) !== this.candlesticks[x].date.substr(5, 2))
            {
                this.drawLine(this.xToPixelCoords(x), 0, this.xToPixelCoords(x), this.height, this.gridColor);
                let dateStr = monthNames[Number(this.candlesticks[x].date.substr(5, 2)) - 1];
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.xToPixelCoords(x) + 5, this.height - 5);
            }
            else if(Number(this.candlesticks[x].date.substr(8, 2)) % 2 === 0)
            {
                this.drawLine(this.xToPixelCoords(x), 0, this.xToPixelCoords(x), this.height, this.gridColor);
                let dateStr = this.candlesticks[x].date.substr(8, 2);
                this.context.fillStyle = this.gridTextColor;
                this.context.fillText(dateStr, this.xToPixelCoords(x) + 5, this.height - 5);
            }
            
        }
    }
}


// 주가 최대 최소 값 이용해서 y축 주가길이 구하기
CandlestickChart.prototype.calculateYRange = function()
{
    for (let i = this.startindex; i < this.endindex + 1; ++i )
    {
        if (i === this.startindex )
        {
            this.yStart = this.candlesticks[i].low;
            this.yEnd = this.candlesticks[i].high;
        }
        else
        {
            if (this.candlesticks[i].low < this.yStart )
            {
                this.yStart = this.candlesticks[i].low;
            }
            if (this.candlesticks[i].high > this.yEnd )
            {
                this.yEnd = this.candlesticks[i].high;
            }
        }
    }
    this.yRange = this.yEnd - this.yStart;
}



//CandlestickChart.prototype.calculateVolume = function()
//{
//    for (let i = this.startindex; i < this.endindex + 1; ++i )
//    {
//        if (i === this.startindex )
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
CandlestickChart.prototype.yToPixelCoords = function( y )
{
    return this.height - this.marginBottom - ( y - this.yStart) * this.yPixelRange/this.yRange;
}


// index -> pixel in canvas
CandlestickChart.prototype.xToPixelCoords = function( x )
{
    return this.marginLeft + ( x - this.startindex ) * this.xPixelRange / this.candlesticksInCanvas;
}


// y 픽셀 값을 주가로 바꾸기
CandlestickChart.prototype.yToPrices = function( y )
{
    return this.yStart + ( this.height - this.marginBottom - y ) * this.yRange/this.yPixelRange;
}


// x 픽셀 값을 날짜로 바꾸기
CandlestickChart.prototype.xToIndex = function( x )
{
    // x 위치 값을 index로 바꿔서 candlestick의 date 출력
    return this.startindex + Math.floor(( x - this.marginLeft ) * this.candlesticksInCanvas / this.xPixelRange)
}



CandlestickChart.prototype.drawLine = function( xStart , yStart , xEnd , yEnd , color )
{
	this.context.beginPath();
	this.context.moveTo( xStart+0.5 , yStart+0.5 );
	this.context.lineTo( xEnd+0.5 , yEnd+0.5 );
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
    
    this.endindex = this.endindex + this.dragDistance;
    this.startindex = this.endindex - this.candlesticksInCanvas;

    if (this.startindex < 0 || this.endindex < 0)
    {
        this.startindex = 0;
        this.endindex = this.candlesticksInCanvas -1;
    }
    if (this.endindex > this.candlesticks.length - 1 || this.startindex > this.candlesticks.length - 1)
    {
        this.startindex = this.candlesticks.length - this.candlesticksInCanvas;
        this.endindex = this.candlesticks.length - 1;
    }
}
