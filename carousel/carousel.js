carousel = function (config, $focusEle) {
    var _config = {
        playStyle: 'hide',
        arrow: false,
        arrowStyle: false,
        playTime: 5000,
        changeTime: 500
    };

    var me = this;
    _config = $.extend(_config, config);

    var $picBox = $focusEle.children('.carousel-inner'),
        $picEles = $picBox.children('.item'),
        length = $picEles.length,
        $mapEles;

    me.currentPageNum = 0;

    var _play_hide = function (targetPageNum) {
        if (targetPageNum == me.currentPageNum) {
            return;
        }
        var $cEle = $picEles.eq(me.currentPageNum),
            $tEle = $picEles.eq(targetPageNum),
            $cMEle = $mapEles.eq(me.currentPageNum),
            $tMEle = $mapEles.eq(targetPageNum),
            time = _config.changeTime;
        $cEle.fadeOut(time);
        $tEle.fadeIn(time);
        $cMEle.animate({width: "19px", backgroundColor: "#8bdbee"}, time, '', function () {
            $(this).removeClass('active')
        });
        $tMEle.animate({width: "41px", backgroundColor: "#ffffff"}, time, '', function () {
            $(this).addClass('active')
        });
    };

    var fnMap = {
        'hide': _play_hide
    };

    var playNext = fnMap[_config.playStyle];

    function renderMap() {
        var i,
            temp,
            mapHTML = '<ol class="carousel-indicators">';

        for (i = 0; i < length; i++) {
            i == 0 ? temp = '<li data-slide-to="' + i + '" class="active"></li>' : temp = '<li data-slide-to="' + i + '" ></li>';
            mapHTML += temp;
        }
        mapHTML += '</ol>';
        $focusEle.append($(mapHTML));
        $mapEles = $focusEle.children('.carousel-indicators').children('li');
    }

    function play() {
        var time = _config.playTime,
            nextNum;
        setTimeout(function () {
            nextNum = me.currentPageNum + 1;
            if (nextNum == length) {
                nextNum = 0;
            }
            playNext(nextNum);
            me.currentPageNum = nextNum;
            play();
        }, time);
    }

    function initEvent() {
        $mapEles.click(function () {
            var targetNum = $(this).data('slide-to');
            playNext(targetNum);
            me.currentPageNum = targetNum;
        })
    }

    me.init = function () {
        renderMap();
        play();
        initEvent();
    }

};
