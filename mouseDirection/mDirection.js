//判断鼠标从哪个方向划入元素
function mDirection(event){
    var _ele = event.currentTarget,
        _x = event.clientX,
        _y = event.clientY;

    //1 for top, 2 for right, 3 for bottom, 4 for left;
    var direct;

    var clientRect = _ele.getBoundingClientRect();

    _x = _x - clientRect.left;
    _y = _y - clientRect.top;
    if( _x < clientRect.width/2 && _y < clientRect.height/2 ){
        if( _x >= _y ){
            direct = '1';
        }else{
            direct = '4';
        }
    }else if( _x > clientRect.width/2 && _y < clientRect.height/2 ){
        _x = clientRect.width - _x;
        if( _x >= _y ){
            direct = '1';
        }else{
            direct = '2';
        }
    }else if( _x < clientRect.width/2 && _y > clientRect.height/2 ){
        _y = clientRect.height - _y;
        if( _x >= _y ){
            direct = '3';
        }else{
            direct = '4';
        }
    }else if( _x > clientRect.width/2 && _y > clientRect.height/2 ){
        _x = clientRect.width - _x;
        _y = clientRect.height - _y;
        if( _x >= _y ){
            direct = '3';
        }else{
            direct = '2';
        }
    }

    return direct;
}
