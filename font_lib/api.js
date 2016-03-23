function process_callback_init(json) {
  Println("Notice:"+json);
  // json data
  var TTFs = new TableTTFsClass();
  TTFs.SetValueByFilename("FontName", "songti");
  ttfInfoMap.add(fid, TTFs);
}

function process_callback(json) {
}

function getInitJsonData(url, fid){
  var script = document.createElement("script");
  var jsonp_callback = function(response) {
    try {
      process_callback_init(response);
    } finally {
      script.parentNode.removeChild(script);
    }
  };
  script.src = url+"?fid="+fid+"&init=true";
  document.body.appendChild(script);
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
  script.src = url+"?fid="+fid+"&ulist="+unicodes; 
  document.body.appendChild(script);
}
