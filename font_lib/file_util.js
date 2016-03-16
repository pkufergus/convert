
function getFileName(o){
  var pos=o.lastIndexOf("/");
  lastname = o.substring(pos+1);
  document.getElementById("process").innerHTML+="pos =" + pos + " lastname = " + lastname + "<br>";
  return lastname;
}

function readUrlBinary(filepath, obj) {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "/"+filepath, true);
  oReq.responseType = "arraybuffer";

  oReq.onload = function (oEvent) {
    var arrayBuffer = oReq.response; // Note: not oReq.responseText
    if (arrayBuffer) {
      var byteArray = new Uint8Array(arrayBuffer);
      lastname = getFileName(filepath);
      obj.SetValueByFilename(lastname, byteArray);
      document.getElementById("process").innerHTML+="load filepath : "+filepath + " len="+byteArray.length+"<br>";
    }
  };

  oReq.send(null);
}

function readUrlText(filepath, obj) {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "/"+filepath, true);
  oReq.responseType = "text";

  oReq.onload = function (oEvent) {
    var content = oReq.responseText; // Note: not oReq.responseText
    if (content) {
      lastname = getFileName(filepath);
      obj.SetValueByFilename(lastname, content);
      document.getElementById("process").innerHTML+="load filepath : "+filepath + " = " + content + " len="+content.length+"<br>";
    }
  };

  oReq.send(null);
}
