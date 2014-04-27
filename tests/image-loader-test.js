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
                IDBAdapter.processImageFile(files[i], function(_id){
                    IDBAdapter.getData('thumbnails', _id, function(url){
                        var image = document.createElement('img');
                        image.src = url;
                        document.body.appendChild(image);
                    });
                });
            }
        })
        .on('dragover', function(e){
            e.stopPropagation();
            e.preventDefault();
        });
});