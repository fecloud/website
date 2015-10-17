/**
 * Created by Feng OuYang on 2014-07-30.
 */

var path, name;
var photos_width;
var content_css;

$(document).ready(function () {

    if (agentWechatOrQQ()) {
        $('#header').css('display','none');
    }

    back_bind();

    path = getArgs('path');
    name = getArgs('name');

    comp_photos_width();
    $('#content').addClass(content_css);

    document.title = name;
    $('#ti').html(name);

    load_data();

    $('.upload_file').bind('change', function (b) {
        fileSelected(b.target);
    });

    $(window).resize(function(){

        $('#content').removeClass(content_css);
        comp_photos_width();
        $('#content').addClass(content_css);
    });

});

/**
 * 计算大小
 */
function comp_photos_width() {

    var doc_width = $(document).width();

        if (doc_width == 320) {
            content_css = 'content-320';
        }else if(doc_width == 480){
            content_css = 'content-480';
        }else if(doc_width == 768){
            content_css = 'content-768';
        }else if(doc_width == 1024){
            content_css = 'content-1024';
        }else {
            content_css = 'content-pc';
        }

}

/**
 * 加载本页数据
 */
function load_data() {

    $.ajax({url: "{0}{1}.php?action=get_album_pics&token={2}&value={3}".format(photos_service, randomInt(), getToken(), path),
        success: function (data) {

            if (data && data.data) {
                data.data.forEach(function (pic) {

                    var h = "<div style=\"background-image: url(" +
                        thum + $.md5(pic.path + "_160_160") + ".jpg" +
                        ");\" class=\"album-item album-item-set" +
                        "\" ><a href=\"" +
                        photos_pic + pic.path
                        + "\" ></a></div>";
                    $('#content').append(h);
                });
            }


        }});


}

function fileSelected(b) {
    $('#li_progress').fadeIn(2000);
    $('.progress_num').html("请稍候");
    var count = b.files.length;

    document.getElementById('details').innerHTML = "";

    for (var index = 0; index < count; index++) {

        var file = b.files[index];

        var fileSize = 0;

        if (file.size > 1024 * 1024)

            fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';

        else

            fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

    }

    uploadFile(b);

}

function uploadFile(b) {

    var fd = new FormData();
    var count = b.files.length;

    var files = [];
    for (var index = 0; index < count; index++) {

        var file = b.files[index];
        var filename = '';
        if (file.name == "image.jpg") {
            filename = new Date().format("yyyy-MM-dd_hh-mm-ss-") + index + '.jpg'
        } else {
            filename = file.name;
        }
        fd.append(filename, file);
        files.push(filename);
    }
    fd.append('file_list', JSON.stringify(files));

    $('#details').html('上传列表:' + JSON.stringify(files));
    var xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", uploadProgress, false);

    xhr.addEventListener("load", uploadComplete, false);

    xhr.addEventListener("error", uploadFailed, false);

    xhr.addEventListener("abort", uploadCanceled, false);

    xhr.open("POST", "{0}{1}.php?action=save_photos&token={2}&value={3}".format(photos_service, randomInt(), getToken(), path));
    xhr.send(fd);
    $('.progress-bar b').width(0);
}

function uploadProgress(evt) {

    if (evt.lengthComputable) {

        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        $('.progress_num').html(percentComplete.toString() + '%');
        var h = $('.progress_bar').width();
        h = h / 100;
        $('.progress_bar b').width(h * parseFloat(percentComplete.toString()) - 2);
    } else {

//                document.getElementById('progress').innerHTML = 'unable to compute';

    }

}

function uploadComplete(evt) {

    /* This event is raised when the server send back a response */
    var h = $('.progress_bar').width();
    console.log(h);
    $('.progress_bar b').width(h - 2);
    $('.progress_num').html("完成");
    $('#li_progress').fadeOut(2000);

    setTimeout(function () {

        $('#content').html("");
        load_data();

    }, 3000);
//            alert(evt.target.responseText);

}

function uploadFailed(evt) {

//            alert("There was an error attempting to upload the file.");
    $('.progress-bar b').css({background: "red"});
    $('.progress_num').html("上传失败");
    $('#li_progress').fadeOut(2000);
}

function uploadCanceled(evt) {

//            alert("The  user or the browser dropped the connection.");

}
