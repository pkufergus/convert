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

var InitFontInfoURL = "http://fs.youziku.com/font/GetFontInfo";
var GlyfsURL = "http://fs.youziku.com/font/GetFontGlyfs";

function submitData(URL, json, callback) {
  var xhr = new createXHR();
  xhr.onreadystatechange = function(){
    if (xhr.status != 200 && xhr.status != 304) {
      Println('HTTP error ' + xhr.status);
      return;
    }
    callback(xhr.responseText);
  }
  xhr.open('POST', URL,false);
  xhr.setRequestHeader('Content-Type','application/json; charset=utf-8');
  xhr.send(json);
}

var AccessKey = "83216c7849bc4d3cb15bbe5dd72b9d31";
function InitReq(accessKey, fontid) {
  this.accessKey = accessKey;
  this.Fontid = fontid;
}

function GlyfsReq(accessKey, fontid, unicodes) {
  this.Fontid = fontid;
  this.Unicodes = unicodes;
}

function processInit(json) {
  var info = JSON.parse(json);
  Println("Notice:"+info.Head.HeadTable);
  Println("Notice:"+info.Head.OS2Table);
  var ttfInfo = new TableTTFsClass();
  var TableGlyfsList = new Array();

  var headInfo = info.Head;
  ttfInfo.Id = headInfo.FontId; 
	ttfInfo.OS2Table= toByteArray(headInfo.OS2Table); 
  ttfInfo.HeadTable= toByteArray(headInfo.HeadTable); 
  ttfInfo.HheaTable= toByteArray(headInfo.HheaTable);
  ttfInfo.HmtxTable= toByteArray(headInfo.HmtxTable);
  ttfInfo.MaxpTable= toByteArray(headInfo.MaxpTable);
  ttfInfo.NameTable= toByteArray(headInfo.NameTable);
  ttfInfo.PostTable= toByteArray(headInfo.PostTable);
  ttfInfo.Cvt_Table= toByteArray(headInfo.Cvt_Table);
  ttfInfo.FpgmTable= toByteArray(headInfo.FpgmTable);
  ttfInfo.PrepTable= toByteArray(headInfo.PrepTable);
  ttfInfo.GaspTable= toByteArray(headInfo.GaspTable);
  ttfInfo.HorizAdvX= headInfo.HorizAdvX;
  ttfInfo.FontFace= headInfo.FontFace;

  var glyfs = info.GlyfsList;
  for (var n in glyfs) {
    Println("Notice:"+n+" "+glyfs[n].Unicode);
    Println("Notice:"+n+" "+glyfs[n].GlyfTable);
    if (glyfs[n].Unicode == 0 || glyfs[n].GlyfTable == null) {
      continue;
    }
    var decode = toByteArray(glyfs[n].GlyfTable);
    var glyf = new TableGlyfs();
    glyf.Id = glyfs[n].FontId;
    glyf.Unicode = glyfs[n].Unicode;
    glyf.HorizAdvX = glyfs[n].HorizAdvX;
    glyf.LSB = glyfs[n].LSB;
    glyf.GlyfTable = decode;
    TableGlyfsList.push(glyf);
    glyfInfoMap.set(glyf.Id, glyf.Unicode, glyf);
  }
  ttfInfoMap.set(ttfInfo.Id, ttfInfo);

  generateOneFont(ttfInfo.Id);
}
function processGlyfs(json) {
  var j = JSON.parse(json);
}

function generateOneFont(fontid) {
  var ttfInfo = ttfInfoMap.get(fontid);
  var glyfsList = glyfInfoMap.getOneFontGlyfs(fontid);
  generateTTFFile(ttfInfo, glyfsList, Err);
}
function getInitFontInfo(accessKey, fontid) {
  var req = new InitReq(accessKey, fontid);
  var json = JSON.stringify(req);

  submitData(InitFontInfoURL, json, processInit);
}
function getGlyfs(accessKey, fontid, unicodes) {
  var req = new GlyfsReq(accessKey, fontid, unicodes);
  var json = JSON.stringify(req);
  submitData(GlyfsURL, json, processGlyfs);
}
