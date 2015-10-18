var current_path = '/';
var count = 0;
var page_num = 60;
var loading = false; //是否ajax在加载中
var more = true;

$(document).ready(function () {

    if (agentWechatOrQQ()) {
        $('#header').css('display','none');
    }

    changeFileUpload();

    var path = getArgs('path');
    if (path == '')
        path = "/";
    current_path = path;


    //每一次加载
    load_data(function () {
        $('#loading').css({display: 'block'});
    }, function () {
        $('#loading').css({display: 'none'});
        $(window).scroll(function () {
            if ($(window).height() + $(window).scrollTop() >= $(document.body).height() - 5) {
                //滚动到最底部了
                if (!loading && more) {
                    load_data(function () {
                        $('#bottom_loading').css({display: 'block'});
                        $(window).scrollTop($(window).scrollTop() + 44);
                    }, function () {
                        $('#bottom_loading').css({display: 'none'});
                    });
                }
            }

        });
    });

    back_bind();

    $('.upload').bind('change', function (b) {
        b.preventDefault();
        b.stopPropagation();
        fileSelected();
    });
    $('.newfolder').bind('click', newfolder);

    $('#header h1').bind('click', function () {
        window.location.replace('/file?oauth=' + getOauth());
    });

    $('#search_btn').bind('click', search);

    $('#search_input').bind('keypress', function (event) {
        if (event.keyCode == "13") {
            search();
        }
    });

});


function search() {
    var query = $('#search_input').val();
    if (query != '') {
        $('#loading').css({display: 'block'});
        $(window).scroll(function () {
            //console.log('search');
        });
        $('#content').html('');
        $.ajax({url: "{0}{1}.php?action=search&oauth={2}&value={3}&query={4}".format(filemanager_service, randomInt(), getOauth(), current_path, query),
            success: function (data) {

                load_list(data);
                $('#loading').css({display: 'none'});

            }
        });
    }
}

/**
 * 当是pc时加上multiple='multiple'
 */
function changeFileUpload() {
    var user_agent = window.navigator.userAgent;
    if ((user_agent.indexOf('iPhone') > -1) || (user_agent.indexOf('Android') > -1) || (user_agent.indexOf('Ipad') > -1)) {
        //ios android
    } else {
        var input = $('#upload')[0];
        input.setAttribute('multiple', 'multiple');
    }
}

/**
 * 加载数据
 * @param count
 * @param pagenum
 */
function load_data(befor, end) {
    if (befor != undefined) {
        befor.call();
    }

    loading = true;
    var address = "{0}{1}.php?action=list&oauth={2}&value={3}&skip={4}&num={5}".format(filemanager_service, randomInt(), getOauth(), current_path, count, page_num);
    $.ajax({url: address,
        success: function (data) {
            loading = false;
            more = data.more;
            load_list(data);
            if (end != undefined) {
                end.call();
            }
        },
        error: function () {
            loading = false;
        }
    });
}


function load_list(data) {
    if (data && data.data) {
        var arr = data.data;
        count += arr.length;
        for (var i = 0, len = arr.length; i < len; i++) {
            var file = arr[i];
            var item = '<li class="list-item" src="{5}" file="{6}" name="{7}"><a href="{0}" class="box file-desc clean_right"><{8} class="file-icon {1}" {9} ></{8}><div class="box1 content"><h3>{2}</h3><div class="list-content">{3}<span>{4}</span></div></div><div class="show-operate"><i class="idown"></i></div></a><div class="box file-operate" ><div class="box1 file-rename"><i class="iedit"></i>重命名</div><div class="box1 file-delete" ><i class="iremove"></i>删除</div></div></li>';
            ;
            if (file.isDir) {
                item = item.format("index.html?oauth=" + getOauth() + "&path=" + file.path, "folder", file.name, new Date(file.mtime).format("yyyy-MM-dd hh:mm:ss"), "", file.path, file.isFile, file.name , "i", "");
            } else {
                var type = getFileType(file.name);
                var fix = "i";
                var file_src = "";
                if (type == "jpg") {
                    fix = "img";
                    var fix_format = "src=\"{0}imageview.php?oauth={1}&action=imageview&value={2}&width={3}&height={4}\"";
                    file_src = fix_format.format(imageview_service, getOauth(), file.path, 160, 160);
                } 
                item = item.format("/src" + file.path + "?oauth=" + getOauth(), getFileTypeCss(file.name), file.name, new Date(file.mtime).format("yyyy-MM-dd hh:mm:ss"), renderSize(file.size), file.path, file.isFile, file.name, fix, file_src);
            }
            $('#content').append(item);

        }

        $(".show-operate").unbind('click');
        $('.file-delete').unbind('click');
        $('.file-rename').unbind('click');

        $(".show-operate").bind('click', idown);
        $('.file-delete').bind('click', iremove);
        $('.file-rename').bind('click', irename);


    }
}


function newfolder() {
    window.location.replace('/file/add_folder.html?oauth=' + getOauth() + '&path=' + current_path);
}

//var idown_pre ;
function idown(b) {
    // console.log(b.target).closest(".content");
//    if(idown_pre && idown_pre != b){
//        $(idown_pre.target).closest('li').toggleClass(function () {
//            return 'list-item-show';
//        });
//    }
    b.preventDefault();
    b.stopPropagation();
    $(b.target).closest('li').toggleClass(function () {
        return 'list-item-show';
    });
//    idown_pre = b;
//    console.log("idown");
}

function iremove(b) {
    var file = $(b.target).closest('li')[0];
    $.ajax({url: "{0}{1}.php?action=delete&oauth={2}&value={3}".format(filemanager_service, randomInt(), getOauth(), file.getAttribute('src')),
        success: function (data) {
            file.remove();
            count = count - 1;
        }
    });
}

function irename(b) {
    b.preventDefault();
    b.stopPropagation();
    var src = $(b.target).closest('li')[0];
    window.location.replace('rename.html?oauth={0}&path={1}&isFile={2}&name={3}'.format(getOauth(), src.getAttribute('src'), src.getAttribute('file'), src.getAttribute('name')));
}


