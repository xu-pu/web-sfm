"use strict";

jQuery.event.props.push( "dataTransfer" );

$(function(){
    $('#drag-area')
        .css('width','100px')
        .css('height', '100px')
        .css('background-color', 'grey')
        .on('drop', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var files = e.dataTransfer.files;
            for (var i=0; i<files.length; i++) {
                var reader = new FileReader();
                reader.onload = function(e){
                    var exifReader = new ExifReader();
                    exifReader.load(e.target.result);
                    var tags = exifReader.getAllTags();
                    console.log(tags);

                };
                reader.readAsArrayBuffer(files[i]);
            }
        })
        .on('dragover', function(e){
            e.stopPropagation();
            e.preventDefault();
        });
});