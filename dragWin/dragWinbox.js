/**
 * @author weixiaoyu
 * @date     201603
 * @description
 *	用来实现窗口的拖拽效果
 *	要求拖拽元素本身css有top/bottom/left/right属性
 *	依赖jQuery或Zepto
 ******
 * @param
 * win                    dom元素或者jq元素                         需要拖拽的窗口元素
 * pullEle               dom元素或者jq元素（元素集合）     拖拽点
 * referencePos     string                                             窗口元素定位所用属性，先左右，再上下，空格分开。如 "left top"
 ***
 *如果省略第二个参数，则拖拽点默认设定为窗口自身
 *如果省略第三个参数，则默认窗口移动依靠 left / top
 ******
 *@example
 *	new sohuHD.dragWin( $( '.dragme' ), $( '.dragArea' ) ,'left top' );
 */
( function( window, sohuHD, $ ){
    sohuHD.dragWin = function( win, pullEle, referencePos ){
        var me = this;

        //start init arguments
        var $winbox, $pullEle, refPos = {};
        var $winbox = win;

        if( win.nodeType == 1 ){
            //node
            $winbox = $(win);
        }else if( win instanceof jQuery ){
            //jq obj
            $winbox = win;
        }else{
            throw "type Error : first argument should be html element or jQuery element";
        }

        if( !pullEle ){
            //default value
            $pullEle = $winbox;
            refPos = {
                hor : "left",
                ver : "top"
            };
        }else if( typeof( pullEle ) == 'object' ){

            //node || jq
            if( pullEle instanceof jQuery ){
                //jq obj
                $pullEle = pullEle;
            }else if( pullEle.nodeType == 1 || pullEle.item(0).nodeType == 1){
                //node
                $pullEle = $(pullEle);
            }else{
                throw "type Error : second argument should be html element or jQuery element or string";
            }

            if( referencePos ){
                refPos = getRefPos( referencePos );
            }else {
                refPos = {
                    hor : "left",
                    ver : "top"
                };
            }

        }else if( typeof( pullEle ) == 'string' ){
            //default pullEle
            $pullEle = $winbox;
            refPos = getRefPos( pullEle );
        }
        //end init arguments

        //start other varieties
        var isIE678 = ( sohuHD.isIE6 || sohuHD.isIE7 || sohuHD.isIE8 );
        var draging = 0;
        var startCor = {
            'x' : 0,
            'y' : 0
        }
        var startOff = {
            'hor' : 0,
            'ver' : 0
        }
        var pageW, pageH;
        //page width & height
        pageW = typeof( window.innerWidth ) == 'number' ? window.innerWidth : document.documentElement.clientWidth;
        pageH = typeof( window.innerHeight ) == 'number' ? window.innerHeight : document.documentElement.clientHeight;

        //end other varieties

        me.initDragEvent = function(){

            $(window).resize(function(){
                pageW = typeof( window.innerWidth ) == 'number' ? window.innerWidth : document.documentElement.clientWidth;
                pageH = typeof( window.innerHeight ) == 'number' ? window.innerHeight : document.documentElement.clientHeight;
            })

            $pullEle.mousedown( function( event ){
                var winPosition;
                event = event || window.event;
                //ready to drag
                draging = 1;
                //original cursor coordination & winbox offset
                startCor.x = event.pageX;
                startCor.y = event.pageY;
                winPosition = $winbox.position();
                startOff.hor = winPosition[refPos.hor];
                startOff.ver = winPosition[refPos.ver];
            } );

            //in IE 6/7/8, cursor event can't be captured by window
            if( isIE678 ){
                $( document ).mousemove( function(){
                    var event = window.event;
                    //can do drag
                    if( draging == 1 ){
                        event.returnValue = false;
                        $( 'body' ).css( 'cursor', 'move' );
                        moveWin( event.pageX, event.pageY );
                    }
                } ).mouseup( function(){
                    draging = 0;
                    $('body').css( 'cursor', 'default' );
                } )
            }else{
                $( window ).mousemove( function( event ){
                    if( draging == 1 ){
                        event.preventDefault();
                        $( 'body' ).css( 'cursor', 'move' );
                        moveWin( event.pageX, event.pageY );
                    }
                } ).mouseup( function(){
                    draging = 0;
                    $('body').css( 'cursor', 'default' );
                } )
            }
        }

        //start private methods
        //change referencePos string to css attribution
        function getRefPos( referencePos ){
            var refPos;
            switch ( referencePos ){
                case 'left top':
                    refPos = {
                        hor : "left",
                        ver : "top"
                    };
                    break;
                case 'left bottom':
                    refPos = {
                        hor : "left",
                        ver : "bottom"
                    };
                    break;
                case 'right top':
                    refPos = {
                        hor : "right",
                        ver : "top"
                    };
                    break;
                case 'right bottom':
                    refPos = {
                        hor : "right",
                        ver : "bottom"
                    };
                    break;
            }
            return refPos;
        }

        /**
         * move windowbox
         * @param  {[type]} nowX [x-coordination of cursor right now]
         * @param  {[type]} nowY [y-coordination of cursor right now]
         *
         * @return {[type]}      [description]
         */
        function moveWin( nowX, nowY ){
            var deltaX, deltaY, moveToX, moveToY;

            //distance cursor moved
            deltaX = nowX - startCor.x;
            deltaY = nowY - startCor.y;

            //culculate position value now
            if( refPos.hor == 'left' ){
                moveToX = startOff.hor + deltaX;
            }
            else if( refPos.hor == 'right' ){
                moveToX = startOff.hor - deltaX;
            }
            if( refPos.ver == 'top' ){
                moveToY = startOff.ver + deltaY;
            }
            else if( refPos.ver == 'bottom' ){
                moveToY = startOff.ver - deltaY;
            }

            //move
            //winbox can not moveout from browser client
            if( moveToX > 0 && moveToX < ( pageW - $winbox.outerWidth() ) ){
                //move winbox
                $winbox.css( refPos.hor, moveToX + 'px' );
            }else if( moveToX < 0 ){
                //move to one side border
                $winbox.css( refPos.hor, '0px' );
            }else if( moveToX > ( pageW - $winbox.outerWidth() ) ){
                //move to another side border
                $winbox.css( refPos.hor,  (pageW - $winbox.outerWidth()) + 'px' );
            }
            if( moveToY > 0 && moveToY < ( pageH - $winbox.outerHeight() ) ){
                //move winbox
                $winbox.css( refPos.ver, moveToY + 'px' );
            }else if( moveToY < 0 ){
                //move to one side border
                $winbox.css( refPos.ver,  '0px' );
            }else if( moveToY > (pageH - $winbox.outerHeight()) ){
                //move to another side border
                $winbox.css( refPos.ver, (pageH - $winbox.outerHeight()) );
            }
        }
        //end private methods

        return me;
    }
})( window, sohuHD, jQuery )
