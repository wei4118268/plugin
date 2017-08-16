var extend = function ( t, s, defaults ) {
    if ( defaults ) {
        extend( t, defaults );
    }
    if ( s && typeof s == 'object' ) {
        for ( var p in s ) {
            t[ p ] = s[ p ];
        }
    }
    return t;
};

function danmu( config, danmus ){
    var defaultConfig = {
        player : document.querySelector('video'),
        danmuBoxEle : document.querySelector('.danmu'),
        danmuHeight : 30,
        speed : 85,
        maxLine : 10,
        opacity : 1,
        danmuKey : {
            uid : '',
            startTime : '',
            content : '',
            color: ''
        }
    };

    var _config = extend( defaultConfig, config );

    //定时查询当前播放时长下的弹幕
    var _danmuTimeout;
    
    var _danmus = danmus;

    var _danmuHtml = '<div class="singleDanmu" style="transition-property:transform;-webkit-transition-property:transform;' + 
                     '-moz-transition-property:transform;-ms-transition-property:transform;-o-transition-property:transform;transition-timing-function:linear;' + 
                     '-webkit-transition-timing-function:linear;-moz-transition-timing-function:linear;-ms-transition-timing-function:linear;-o-transition-timing-function:linear;' + 
                     'transform:translateX(0px);-webkit-transform:translateX(0px);-moz-transform:translateX(0px);-ms-transform:translateX(0px),-o-transform:translateX(0px)"></div>';

    var _css3Prefix = ['webkit', 'moz', 'ms', 'o'];

    var getCss = function( domEle, style ){
        var result,
            getComputedStyle = document.defaultView && document.defaultView.getComputedStyle;

        if( getComputedStyle ){
            result = getComputedStyle.call(window, domEle, null )[style];
        }else{
            result = domEle.currentStyle[style];
        }
        return result;
    };

    var getDurationTime = function(){
        var speed = _config.speed,
            width  = Number( getCss( _config.player, 'width' ).slice(0, -2) );

        return (width / speed).toFixed(2);
    };

    var getTranslateX = function( ele ){
        var transform;
        transform = getCss( ele, 'transform' ).slice( 7, -1 ).split(',');
        return Number(transform[4]);
    };

    var setCss3Property = function( ele, style, value ){
        var i, prefixLength = _css3Prefix.length;
        ele.style[style] = value;
        for( i = 0; i < prefixLength; i++ ){
            ele.style[_css3Prefix[i] + style.substring(0, 1).toUpperCase() + style.substring(1)] = value;
        }
    };

    //获取弹幕可以插入的行
    var getLine = function(){
        var dBEle = _config.danmuBoxEle,
            dEles,
            singleEle,
            maxLine = _config.maxLine,
            translateX, width;
        for( var i = 1; i < maxLine + 1; i++ ){
            dEles = dBEle.querySelectorAll('[data-line="' + i + '"]');
            if( dEles.length == 0 ){
                return i;
            }else{
                singleEle = dEles[dEles.length - 1];
                translateX = getTranslateX( singleEle );   
                width = Number( getCss( singleEle, 'width' ).slice(0, -2) );
                if( -translateX > (width + 50) ){
                    return i;
                }
            }
        }
        //没有插入点，返回0
        return 0;
    };

    //删除滚动完成的弹幕
    var danmuEnd = function(e){
        var ele = e.target;
        ele.removeEventListener('transitionend', danmuEnd);
        _config.danmuBoxEle.removeChild(ele);
    };

    //筛选当前时间的弹幕,生成HTML,展示出来
    var generateDanmus = function(){
        var dLen = _danmus.length;
        var item, timeSpan, line, temp;
        for( var i = 0; i < dLen; i++ ){
            item = _danmus[i];
            timeSpan = _config.player.currentTime - item[_config.danmuKey.startTime];
            //筛选当前播放时间下的弹幕
            if( timeSpan <= 0.2 && timeSpan > 0 ){
                line = getLine();
                if( line > 0 ){
                    temp = generateDanmu( item );
                    temp.setAttribute('data-line', line);
                    temp.setAttribute('data-stime', item[_config.danmuKey.startTime]);
                    temp.style.top = (line - 1) * _config.danmuHeight + 'px';
                    _config.danmuBoxEle.appendChild(temp);
                    temp.addEventListener('transitionend', danmuEnd);
                    setCss3Property( temp, 'transform', 'translateX(' + -(Number( getCss(_config.player, 'width').slice(0, -2) ) + Number( getCss(temp, 'width').slice(0, -2) )) + 'px)' );
                    //_danmus.splice(i, 1);
                }else{
                    break;
                }
            }
        }
    };

    //生成单个弹幕的dom对象
    var generateDanmu = function( singleDanmu ){
        var tempEle, dEle;
        tempEle = document.createElement('div');
        tempEle.innerHTML = _danmuHtml;
        dEle = tempEle.children[0];
        dEle.innerHTML = singleDanmu[_config.danmuKey.content];
        setCss3Property( dEle, 'transitionDuration', getDurationTime() + 's' );
        if( _config.uid == singleDanmu[_config.danmuKey.uid] ){
            dEle.style.border = "solid 1px red";
        }
        dEle.style.left = Number( getCss( _config.player, 'width' ).slice(0, -2) ) + 'px';
        dEle.style.opacity = _config.opacity;
        dEle.style.color = singleDanmu[_config.danmuKey.color];
        return dEle;
    };

    //弹幕重新开始滚动
    var runDanmus = function(){
        var dBEle = _config.danmuBoxEle,
            dEles = dBEle.querySelectorAll('.singleDanmu'),
            dLen = dEles.length,
            dEle;
        
        var startTime, duration, playingTime, leftTime, playerWidth;

        if( dLen == 0 ) return;

        playerWidth = Number( getCss( _config.player, 'width').slice(0, -2) );

        duration = Number( getDurationTime() );
        playingTime = _config.player.currentTime;

        for( var i = 0; i < dEles.length; i++ ){
            dEle = dEles[i];
            startTime = Number( dEle.dataset.stime );
            //计算弹幕剩余滚动时间
            leftTime = startTime + duration - playingTime;

            setCss3Property( dEle, 'transitionDuration', leftTime + 's' );
            setCss3Property( dEle, 'transform', 'translateX(' + -(playerWidth + Number( getCss( dEle, 'width' ).slice(0, -2) )) + 'px)' );
        }
    };

    //暂停弹幕
    var pauseDanmus = function(){
        var dBEle = _config.danmuBoxEle,
            dEles = dBEle.querySelectorAll('.singleDanmu'),
            dLen = dEles.length,
            dEle;

        clearInterval(_danmuTimeout);

        for(var i = 0; i < dLen; i++){
            dEle = dEles[i];
            setCss3Property( dEle, 'transitionDuration', '0s' );
            setCss3Property( dEle, 'transform', 'translateX(' + getTranslateX( dEle ) + 'px)' );
        }
    };

    //初始化弹幕并加入屏幕
    var initDanmus = function(){
        generateDanmus();
        _danmuTimeout = setInterval(function(){
            generateDanmus();
        }, 200);
    };

    var initEvent = function(){
        var _player = _config.player;
        _player.addEventListener('play', function(){
            runDanmus();
            initDanmus();
        });

        _player.addEventListener('pause', function(){
           pauseDanmus(); 
        });
    
        _player.addEventListener('seeked', function(){
            _config.danmuBoxEle.innerHTML = "";
        });
    };

    this.init = function(){
        initEvent();
    };

    this.setSpeed = function( speed ){
        _config.speed = speed;
    };

    this.setMaxLine = function( line ){
        _config.maxLine = line;
    };

    this.setOpacity = function( opacity ){
        _config.opacity = opacity;
    };

    this.setDanmus = function( newDanmu ){
        _danmus = newDanmus;
    };

    //参数必须为danmu对象
    this.sendDanmu = function( danmu ){
        if( _config.player.ended ){
            console.log('视频已经结束');
            return;
        }

        line = getLine();
        if( line > 0 ){
            temp = generateDanmu( danmu );
            temp.setAttribute('data-line', line);
            temp.style.top = line * _config.danmuHeight;
            _config.danmuBoxEle.appendChild(temp);
            temp.addEventListener('transitionend', danmuEnd);
            if( !_config.player.paused ){
                //暂停时只加载到屏幕不滚动
                setCss3Property( temp, 'transform', 'translateX(' + -(Number( getCss(_config.player, 'width').slice(0, -2) ) + Number( getCss(temp, 'width').slice(0, -2) )) + 'px)' );                
            }
        }
    };

    this.hideDanmu = function(){
        var dBEle = _config.danmuBoxEle;
        clearInterval( _danmuTimeout );
        dBEle.innerHTML = "";
    };

    this.showDanmu = function(){
        initDanmus();        
    };
}
        
