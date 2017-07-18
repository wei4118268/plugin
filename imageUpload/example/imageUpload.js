//H5图片上传
/**
 * @author : xiaoyuwei
 * @description : 一个基于H5的图片上传插件
 */

/**
 * 参数配置
 * maxUploadNum : 允许单次上传的最大文件数量，默认10;
 * maxImageSize : 单张图片最大上传大小，单位B，默认512000(500KB);
 * url : 图片上传地址;
 * onUnSupport : 不支持h5文件上传情况下的回调;
 * onReadyLoadImage : 选择好图片文件之后，准备读取图片回调，参数为图片id;
 * onImageLoadEnd : 图片读取结束回调，参数为图片id与base64图片地址;
 * onProgress : 图片上传进度条回调，参数为图片id、上传百分比与上传速度;
 * onSuccess : 单张图片上传成功回调，参数为图片id;
 * onComplete : 全部图片上传成功回调;
 * onFail : 单张图片上传失败回调，参数为图片id;
 * onFailComplete : 所有图片上传处理完毕，但存在上传失败情况下的回调;
 * onDeleteFile : 删除一个暂存区图片回调，参数为图片id;
 */

/**
 * API
 * getImages : file input 监听到change事件时调用;
 * uploadImages : 调用以开始上传;
 * deleteImageFile : 调用以删除暂存区图片，参数为待删除图片id，可在准备读取图片回调中首次获取id;
 */

//不过目前还不支持拖拽

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

var applyIf = function(o, c) {
    if (o) {
        for (var p in c) {
            typeof o[p] === 'undefined' && (o[p] = c[p]);
        }
    }
    return o;
};

function imageUpload( config ){

    var _c = {
        onUnSupport : function(){},
        maxUploadNum : 10,
        onReadyLoadImage : function(){},
        onImageLoadEnd : function(){},
        maxImageSize : 512000,
        onProgress : function(){},
        onSuccess : function(){},
        onComplete : function(){},
        onFail : function(){},
        onFailComplete : function(){},
        onDeleteFile : function(){}
    }

    this._config = extend( _c, config );

    //自增id
    this._imgId = 0;

    //已选中的文件
    this._allLegalImages = [];

    if( !window.FileReader ){
        //不支持
        this._config.onUnSupport();
    }

}

extend( imageUpload.prototype, {
    getImages : function( e ){
        var allFiles = e.target.files || e.dataTransfer.files;
        //过滤出图片文件
        var legalImages = this._fileFilter( allFiles );

        if( this._allLegalImages.length + legalImages.length > this._config.maxUploadNum ){
            alert('您一次最多只能上传 ' + this._config.maxUploadNum + ' 张图片! 当前已选择了 ' + this._allLegalImages.length + ' 张图片!' );
            return;
        }

        //读取并处理图片(如回显等)
        for(var i = 0; i < legalImages.length; i++){
            //为每一个图片设置id
            legalImages[i].imgId = this._imgId;
            this._imgId += 1;
            
            //图片预备加载回调
            if( this._config.onReadyLoadImage ){
                this._config.onReadyLoadImage( legalImages[i].imgId );
            }
            this._readImage( legalImages[i] );
        }
        
        //存储到暂存区
        if( legalImages.length > 0 ){
            this._allLegalImages = this._allLegalImages.concat( legalImages );
        }
    },

    _readImage : function( imageFile ){
        var me = this;
        if( imageFile ){
            var reader = new FileReader();
            reader.onload = function( e ){
                //图片读取完成回调
                if( me._config.onImageLoadEnd ){
                    me._config.onImageLoadEnd( imageFile.imgId, e.target.result );
                }
            };
            reader.readAsDataURL( imageFile );
        }
    },

    _fileFilter : function( allFiles ){
        var me = this;
        //正则表达式查找自MDN
        var files = [],
            imageFileReg = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpimap|image\/x\-xwindowdump)$/i;
        
        for( var i = 0; i < allFiles.length; i++ ){
            if( imageFileReg.test( allFiles[i].type ) ){
                if( allFiles[i].size > me._config.maxImageSize ){
                    alert('您上传的图片过大!单张图片应小于 ' + me.formatImageSize( me._config.maxImageSize ) + '!' );
                    //存在非法图片时，全部清除
                    files.splice( 0, files.length );
                    break;
                }
                files.push( allFiles[i] );
            }
        }

        return files;
    },

    uploadImages : function(){
        var me = this,
            allLength = this._allLegalImages.length;
        for( var i = 0; i < allLength; i++ ){
            (function( file ){
                var xhr = new XMLHttpRequest();
                var ot, ol;
                
                if( xhr.upload ){
                    //监听上传进度条
                    xhr.upload.addEventListener( 'progress', function( e ){
                        //获取上传的进度
                        var nowProgress = me._uploadProgress( file, e.loaded, e.total, ot, ol );

                        //重置ot,ol
                        ot = Date.now();
                        ol = e.loaded;

                        if( me._config.onProgress ){
                            me._config.onProgress( nowProgress[0], nowProgress[1], nowProgress[2] );
                        }
                    }, false );
                
                    //初始化ot,ol
                    xhr.upload.addEventListener( 'loadstart', function(){
                        if( me._config.onStartUpload ){
                            me._config.onStartUpload( file.imgId );
                        }
                        ot = Date.now();
                        ol = 0;
                    } );

                    xhr.onreadystatechange = function( e ){
                        var uploadStatus = true;
                        if( xhr.readyState == 4 ){
                            if( xhr.status == 200 ){
                                
                                //处理接口返回值,若真正上传成功,需要callback返回true
                                if( me._config.uploadCallback ){
                                    uploadStatus = me._config.uploadCallback( xhr.responseText );
                                }
                                
                                //成功
                                if( uploadStatus ){
                                    if( me._config.onSuccess ){
                                        me._config.onSuccess( file.imgId );
                                    }

                                    //删除上传成功的图片文件
                                    me.deleteImageFile( file.imgId, 1 );

                                    //数组删光了则上传全部完成
                                    if( me._allLegalImages.length == 0 ){
                                        if( me._config.onComplete ){
                                            me._config.onComplete()
                                        }
                                    }
                                }else{
                                    //失败
                                    if( me._config.onFail ){
                                        me._config.onFail( file.imgId );
                                    }
                                    //图片全部处理结束
                                    if( i + 1 == allLength && me._allLegalImages.length > 0 ){
                                        if( me._config.onFailComplete ){
                                            me._config.onFailComplete();
                                        }
                                    }
                                }
                                
                            }else{
                                //失败
                                if( me._config.onFail ){
                                    me._config.onFail( file.imgId );
                                }
                                //图片全部处理结束
                                if( i + 1 == allLength && me._allLegalImages.length > 0 ){
                                    if( me._config.onFailComplete ){
                                        me._config.onFailComplete();
                                    }
                                }
                            }
                        }
                    }

                    //开始上传
                    xhr.open( 'POST', me._config.url, true );
                    xhr.setRequestHeader( 'X_FILENAME', encodeURIComponent( file.name ) );
                    xhr.send( file );
                }

            })( me._allLegalImages[i] );
        }
    },

    _uploadProgress : function( file, loaded, total, ot, ol ){
        var deltaT, deltaL, speed, percent;
        var nt = Date.now();
        //单位:秒
        deltaT = (nt - ot)/1000;
        //单位:kb
        deltaL = (loaded - ol)/1024;

        percent = Math.round( (loaded/total) * 100 ) + '%';

        speed = this.formatSpeed( deltaL/deltaT );

        return [file.imgId, percent, speed];
    },

    deleteImageFile : function( id, type ){
        for( var i = 0; i < this._allLegalImages.length; i++ ){
            if( id == this._allLegalImages[i].imgId ){
                //删除这个项
                this._allLegalImages.splice( i, 1 );

                if( type && type == 1 ){
                    return;
                }else if( this._config.onDeleteFile ){
                    this._config.onDeleteFile( id );
                }
            }
        }
    },

    formatImageSize : function( size ){
        var ksize = size/1024,
            msize = ksize/1024;
        if( msize > 1 ){
            return msize + 'MB'; 
        }
        if( ksize > 1 ){
            return ksize + 'KB';
        }
    },

    formatSpeed : function( speed ){
        //speed单位kb/s
        if( speed/1024 > 1 ){
            return (speed/1024).toFixed(1) + 'MB/s';
        }else if( speed > 1 ){
            return speed + 'KB/s';
        }else{
            return speed*1024 + 'B/s';
        }
    }

});
