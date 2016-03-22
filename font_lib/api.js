function jsonp_callback(json) {
  Println("Notice:"+json);
}
function getJsonDataFromUrl(url, fid, unicodes){
  var script = document.createElement("script");
  var jsonp_callback = function(response) {
    try {
      process_callback(response);
    } finally {
      script.parentNode.removeChild(script);
    }
  };
  script.src = url+"?fid="+fid+"ulist="+unicodes; 
  document.body.appendChild(script);
}
