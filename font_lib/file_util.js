
function Println(msg) {
  document.getElementById("process").innerHTML+="log : "+msg+" <br>";
}
function Log(msg) {
  console.log(msg);
}

function getFileName(o){
  var pos=o.lastIndexOf("/");
  lastname = o.substring(pos+1);
  Log("pos =" + pos + " lastname = " + lastname);
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
      Log("load filepath : "+filepath + " len="+byteArray.length);
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
      Log("load filepath : "+filepath + " = " + content + " len="+content.length);
    }
  };

  oReq.send(null);
}

