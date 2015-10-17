/**
 * Created with JetBrains WebStorm.
 * User: ouyangfeng
 * Date: 7/4/14
 * Time: 21:21
 * To change this template use File | Settings | File Templates.
 */

function fileSelected() {
    $('#li_progress').fadeIn(2000);
    $('.progress_num').html("请稍候");
    var count = document.getElementById('upload').files.length;

    document.getElementById('details').innerHTML = "";

    for (var index = 0; index < count; index++) {

        var file = document.getElementById('upload').files[index];

        var fileSize = 0;

        if (file.size > 1024 * 1024)

            fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';

        else

            fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

        //document.getElementById('details').innerHTML += 'Name: ' + file.name + '<br>Size: ' + fileSize + '<br>Type: ' + file.type;

        //document.getElementById('details').innerHTML += '<p>';

    }

    uploadFile();

}

function uploadFile() {

    var fd = new FormData();
    var count = document.getElementById('upload').files.length;

    var files = [];
    for (var index = 0; index < count; index++) {

        var file = document.getElementById('upload').files[index];
        var filename = '';
        if (file.name == "image.jpg") {
            filename = new Date().format("yyyy-MM-dd hh:mm:ss-") + index + '.jpg'
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

    xhr.open("POST", "{0}{1}.php?action=upload&token={2}&value={3}".format(filemanager_service, randomInt(), getToken(), current_path));
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

        count = 0;

        load_data(function () {
            $('#content').html('');
            $('#bottom_loading').css({display: 'block'});
            $(window).scrollTop($(window).scrollTop() + 44);
        }, function () {
            $('#bottom_loading').css({display: 'none'});
        });
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