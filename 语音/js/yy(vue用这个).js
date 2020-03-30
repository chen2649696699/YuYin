
    function ly_fun({
        ly_start_class = '.ly_start',//录制的div
        click_dom_class = '.ly',//点击事件的class(录制或播放)
        ly_play_class = '.ly_play',//播放的div
        ly_tc_class = '.ly_tc',//录制过程中，显示在正在录制的图标
        play_img = './img/play.png',//录制成功后等待播放的图标
        playing_img = './img/play_dt.gif',//播放中的图标
        ly_s_txt_class = '.ly_s',//秒数的div
        del_class = '.del_ly',//删除录音按钮的class
        zhuan_class = '.zhuan',//录音转文字按钮的class
        _this=this,
    } = {}) {
        var r = null;
        var p = null;
        // var ly_start = document.querySelector(".ly_start>.ly");
        var num = 0; //第一次点击录音时都会判断有没有获取录音权限
        var s = 0; //录音秒数
        var _that = this;
        var ly_timer;
        var phone_type = isAndroidOrIOS();
        $(ly_start_class).on("touchstart", click_dom_class, function (event) {
            console.log(111)
            ly_timer = setInterval(() => {
                s += 100;
            }, 100);
            if (phone_type == 0) {
                console.log(11111111);
                //如果是苹果系统直接执行
                audio_start($(this));
            } else {
                //安卓系统先判断权限开启与否
                if (num > 0) {
                    audio_start($(this));
                } else {
                    plus.android.requestPermissions(
                        ["android.permission.RECORD_AUDIO"],
                        function (e) {
                            if (e.deniedAlways.length > 0) {
                                //权限被永久拒绝
                                // 弹出提示框解释为何需要定位权限，引导用户打开设置页面开启
                                alert("权限被拒绝 " + e.deniedAlways.toString());
                                num = 0;
                            }
                            if (e.deniedPresent.length > 0) {
                                //权限被临时拒绝
                                // 弹出提示框解释为何需要定位权限，可再次调用plus.android.requestPermissions申请权限
                                alert("权限临时拒绝 " + e.deniedPresent.toString());
                                num = 0;
                            }
                            if (e.granted.length > 0) {
                                //权限被允许调用依赖获取定位权限的代码
                                num++;
                            }
                        }
                    );
                }
            }
            event.preventDefault();
        });
        var _that = this;

        //松开图标  停止录音
        $(ly_start_class).on("touchcancel touchend", click_dom_class, function (event) {
            window.clearInterval(ly_timer);
            $(ly_tc_class).hide();
            r.stop();
        });

        $(ly_play_class).on("click", click_dom_class, function () {
            var src = $(this)
                .find("img")
                .attr("src");
            if (src == play_img) {
                p = plus.audio.createPlayer(
                    $(this)
                        .parent()
                        .parent()
                        .attr("data-url")
                );

                $(this)
                    .find("img")
                    .attr("src", playing_img);
                p.play(
                    () => {
                        //播放完毕

                        $(this)
                            .find("img")
                            .attr("src", play_img);
                    },
                    function (e) {
                        alert("Audio play error: " + e.message);
                    }
                );
            } else {
                if (p != null) {
                    p.pause();
                }
                $(this)
                    .find("img")
                    .attr("src", play_img);
            }
        });

        $(zhuan_class).click(function () {
            var recordFile = $(ly_play_class).attr("data-url");
            YuYinChangeWenZi(recordFile);
        });

        //点击语音删除“x”
        $(del_class).click(function () {
            $(this)
                .parent()
                .parent()
                .removeAttr("data-url"); //移出保存的自定义路径
            $(this)
                .parent()
                .parent()
                .hide();
            $(ly_start_class).show();
            p.stop(); //停止播放录音
            s = 0;
        });

        document.addEventListener("plusready", onPlusReady(), false);

        // 扩展API加载完毕，现在可以正常调用扩展API

        function onPlusReady() {
            r = plus.audio.getRecorder();
            plus.android.requestPermissions(
                ["android.permission.RECORD_AUDIO"],
                function (e) {
                    if (e.deniedAlways.length > 0) {
                        //权限被永久拒绝
                        // 弹出提示框解释为何需要定位权限，引导用户打开设置页面开启
                        alert("权限被拒绝 " + e.deniedAlways.toString());
                        num = 0;
                    }
                    if (e.deniedPresent.length > 0) {
                        //权限被临时拒绝
                        // 弹出提示框解释为何需要定位权限，可再次调用plus.android.requestPermissions申请权限
                        alert("权限临时拒绝 " + e.deniedPresent.toString());
                        num = 0;
                    }
                    if (e.granted.length > 0) {
                        //权限被允许调用依赖获取定位权限的代码
                        num++;
                    }
                }
            );
        }

        function audio_start(el) {
            if (r == null) {
                alert("录音错误");
                s = 0;
                return;
            }
            // $(".ly_tc").show();
            $(ly_tc_class).show();
            // var mycars = new Array("16000");
            // var mycars_geshi = new Array("amr");
            // r.supportedSamplerates = mycars;
            // r.supportedFormats = mycars_geshi;
            // console.log(r.supportedSamplerates);
            // console.log(r.supportedFormats);
            r.record(
                {
                    filename: "_doc/audio/",
                    samplerate: "16000",
                    // format: "amr"
                    format: phone_type == 1 ? 'amr' : 'wav'
                },
                function (recordFile) {
                    // YuYinChangeWenZi(recordFile);
                    if (s < 1000) {
                        _that.Toast({
                            message: "说话时间太短: " + data.err_no,
                            className: "toast_font"
                        });
                        s = 0;
                        return;
                    }
                    $(ly_s_txt_class).text(`${s / 1000}\"`);
                    $(ly_play_class).attr("data-url", recordFile);
                    p = plus.audio.createPlayer(recordFile);

                    $(ly_start_class).hide(); //隐藏录音按钮
                    $(ly_play_class).show(); //显示录音播放
                    $(zhuan_class).removeClass("yc");
                    s = 0;
                },
                function (e) {
                    alert("录音失败: " + e.message);
                    s = 0;
                }
            );
        }

        // 录音语音文件转base64字符串
        function Audio2dataURL(path, token_val) {
            var _this = this;
            // path = "_doc/audio/kjg3.amr";
            // path = "_doc/audio/yy.amr";
            // alert(path)
            //"yuyin/yy.amr"
            var urlArr;
            console.log(path);
            plus.io.resolveLocalFileSystemURL(path, function (entry) {
                entry.file(
                    function (file) {
                        var reader = new plus.io.FileReader();
                        //urlSize 为 文件的字节 大小
                        var urlSize = file.size;
                        reader.onloadend = function (e) {
                            //urlStr 的值，为返回转换的base64数据
                            var urlStr = e.target.result;
                            urlArr = urlStr.split(",")[1];

                            //此处调用，发送给百度语引识别的 函数
                            console.log("调用百度");
                            sendBaseUrl(urlArr, urlSize, token_val);
                        };
                        reader.readAsDataURL(file);
                    },
                    function (e) {
                        console.log("读写出现异常: " + +e.message)
                    }
                );
            });
        }

        // 语音转文字
        function YuYinChangeWenZi(path) {
            console.log(path);
            _this.mui.ajax("https://openapi.baidu.com/oauth/2.0/token", {
                data: {
                    grant_type: "client_credentials",
                    client_id: "S71kqg1XPyD4jGqQ7AtAsTf3", //此处为申请语音账户时的 API key
                    client_secret: "iOqIE1AHQqeWx2AhsEpgpid1bA9KkVwl" //此处为申请语音账户似的 Secret Key
                },
                dataType: "json", //服务器返回json格式数据
                type: "post", //HTTP请求类型
                timeout: 10000, //超时时间设置为10秒；
                success: function (data) {
                    //服务器返回响应，根据响应结果，分析是否登录成功；
                    console.log("获取token success----");
                    //data.access_token  该值 为可用的 access_token 的值
                    Audio2dataURL(path, data.access_token);
                },
                error: function (xhr, type, errorThrown) {
                    //异常处理；
                    console.log(type);
                    console.log(errorThrown);
                }
            });
        }
        // 录音语音文件转base64字符串
        function sendBaseUrl(speechUrl, urlSize, token_val) {
            var loadIndex = "";
            plus.nativeUI.showWaiting("正在加载");
            // var cuid = plus.device.uuid;
            var cuid = guid();
            _this.mui.ajax("https://vop.baidu.com/pro_api", {
                //注意，data内部为json格式，所以，必须是字符串
                data: {
                    format: phone_type == 1 ? 'amr' : 'wav', //格式支持pcm（不压缩）、wav（不压缩，pcm编码）、amr（压缩格式）采样率
                    rate: "16000", //前方有坑，请绕行：此处文档参数16000，达不到这种高保真音频，故 使用8000
                    dev_pid: 80001, //普通话
                    channel: 1, //固定写法（声道）
                    cuid: cuid, //设备的唯一id
                    speech: speechUrl, //base64的音频文件
                    len: urlSize, //文件的大小，字节数
                    token: token_val //获取到的token值
                },
                headers: {
                    "Content-Type": "application/json"
                },
                dataType: "json", //服务器返回json格式数据
                type: "post", //HTTP请求类型
                timeout: 10000, //超时时间设置为10秒；
                success: function (data) {
                    //服务器返回响应，根据响应结果，分析是否登录成功；
                    console.log("识别ing------");
                    console.log(JSON.stringify(data));
                    if (data.err_no > 0) {
                        if (data.err_no == 3001) {
                            console.log("音频质量过差: " + data.err_no)
                        } else {
                            console.log("请重新录入: " + data.err_no)
                        }
                    } else {
                        //识别成功 将文字添加到文本框
                        console.log('主意转文字')
                        alert(data.result)
                    }
                    plus.nativeUI.closeWaiting();

                },
                error: function (xhr, type, errorThrown) {
                    //异常处理；
                    console.log(type);
                    console.log(errorThrown);
                    console.log("识别fail");
                    plus.nativeUI.closeWaiting();
                }
            });
        }
        //用于生成uuid
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        function guid() {
            return (
                S4() +
                S4() +
                "-" +
                S4() +
                "-" +
                S4() +
                "-" +
                S4() +
                "-" +
                S4() +
                S4() +
                S4()
            );
        }
        //判断当前设备
        function isAndroidOrIOS() {
            var u = navigator.userAgent, app = navigator.appVersion;
            var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //Android终端
            var ua = navigator.userAgent.toLowerCase();
            var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端
            if (isAndroid) {
                // 这个是安卓操作系统
                return 1
            }
            if (isIOS) {
                // 这个是ios操作系统
                return 0
            }
            if (/ipad/i.test(ua)) {
                return 0
            }
        }
    }
    export default{
        ly_fun   
    }
