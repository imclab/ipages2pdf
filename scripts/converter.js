function gotLink(link) {
    document.querySelector('a.downloader').href = link;
    document.body.className = 'downloading'
}

function processZip(zipdata) {
    var unzipper = new JSUnzip(zipdata);
    if (unzipper.isZipFile()) {
        unzipper.readEntries();
        var targetEntry = unzipper.entries.filter(function (entry) {
            return entry.fileName.indexOf('.pdf') !== -1
        })[0];
        if (targetEntry) {
            var l = targetEntry.data.length,
                uintArray = new Uint8Array(l);
            while (l--) {
                uintArray[l] = targetEntry.data[l].charCodeAt(0)
            }
            var blob = new Blob([uintArray], {type: 'application/pdf'});

            if (navigator.msSaveOrOpenBlob) {
                navigator.msSaveOrOpenBlob(blob, 'preview.pdf')
            } else {
                var link = (URL || webkitURL).createObjectURL(blob);
                if (link.indexOf(document.location.host) === -1) {
                    link = 'data:application/pdf;base64,'+btoa(targetEntry.data)
                }
                gotLink(link);
            }
        }
    }
}

function processFile(file) {
    var reader = new FileReader();
    reader.onload = function (event) {
        var responseData = event.target.result;
        var binary = "";
        var bytes = new Uint8Array(responseData);
        var length = bytes.byteLength;
        for (var i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        processZip(binary);
    };
    reader.readAsArrayBuffer(file);
}


function register_dragndrop_upload(node, success_callback, max_file_size, fail_callback) {
      if (FileReader) {
        node.addEventListener('dragover', function (e) {
            e.preventDefault();
            node.classList.add('dragover');
            return false;
        }, false);
        node.addEventListener('dragleave', function (e) {
            e.preventDefault();
            node.classList.remove('dragover');
            return false;
        }, false);
        node.addEventListener('drop', function (e) {
            e.preventDefault();
            node.classList.remove('dragover');

            Array.prototype.forEach.call(e.dataTransfer.files, function (file) {
                if (!max_file_size || (file.size <= max_file_size)) {
                    if (success_callback) success_callback(file)
                } else {
                    if (fail_callback) fail_callback(file)
                }
            });

            return false;
        }, false);
    }
}
