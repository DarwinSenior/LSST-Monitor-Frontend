var showPointCB = function(data){
    var imgpoint = data.ipt;
    var worldpoint = data.wpt;
    console.log(imgpoint.x+","+imgpoint.y);
    console.log(worldpoint.x+","+worldpoint.y);
}
var showRegionPointCB = function(data){
    console.log(data.ipt0.x+","+data.ipt0.y);
    console.log(data.ipt1.x+","+data.ipt1.y);
}

function changeViewFirefly(viewer, image){
   image = image || 'image'; 
    viewer.plot({
        "URL" : "http://lsst.cs.illinois.edu/static/images/"+image+".fits",
        "Title" : "Some WISE image",
        "ZoomType" : "TO_WIDTH"
    });
    return viewer;
}

function loadFirefly(viewId, image){
    var primaryViewer = firefly.makeImageViewer(viewId);
    image = image || 'image';
    primaryViewer.plot({
        "URL" : "http://lsst.cs.illinois.edu/static/images/"+image+".fits",
        "Title" : "Some WISE image",
        "ZoomType" : "TO_WIDTH"
    });
    return primaryViewer;
}
