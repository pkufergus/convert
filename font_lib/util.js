function createXHR()
{
    if (typeof XMLHttpRequest != "undefined")
    {
        return new XMLHttpRequest();
    } // end if
    else if (window.ActiveXObject)
    {
        var aVersions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0"];
        for (var i = 0; i < aVersions.length; ++i)
        {
            try
            {
                var oXHR = new ActiveXObject(aVersions[i]);
                return oXHR;
            } // end try
            catch (oError)
            {
                // do nothing
            } // end catch
        } // end for
    } // end else if
    throw new Error("XMLHttp object could not be created.")
} // end createXHR();

function Println(msg) {
  if (msg.indexOf('Notice:') == 0) {
    document.getElementById("process").innerHTML+=" "+msg+" <br>";
  } else {
    console.log(msg);
  }
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

function DataViewWrite1(dataView, offset, val) {
  dataView.setUint8(offset, val);
  return offset + 1;
}
function DataViewWrite2(dataView, offset, val) {
  dataView.setUint16(offset, val);
  return offset + 2;
}
function DataViewWrite4(dataView, offset, val) {
  dataView.setUint32(offset, val);
  return offset + 4;
}

function getUint16_Array(array) {
  var view = new DataView(array.buffer);
  return view.getUint16(0);
}

function getUint16_Array(array, offset) {
  var view = new DataView(array.buffer);
  return view.getUint16(offset);
}

function getUint32_Array(array) {
  var view = new DataView(array.buffer);
  return view.getUint32(0);
}

function getUint32_Array(array, offset) {
  var view = new DataView(array.buffer);
  return view.getUint32(offset);
}

function deepCopyUint8Array(srcArray, begin, end) {
  var destArray;
  var size = end - begin;
  if (size <= 0) {
    return new Uint8Array();
  }
  destArray = new Uint8Array(size);

  for (var i = begin; i < end && i < srcArray.length; i++) {
    destArray[i - begin] = srcArray[i];
  }
  return destArray;
}

var SIGNMASK = 0x8000;
var SIGNBITS = 0xFFFF0000;
function uint16toSignedInt(n) {
  if (n & SIGNMASK) {
    n = n | SIGNBITS;
  }
  return n;
}

function uint8Fill(arr, len, val) {
  for (var i = 0; i < len; i++) {
    arr[i] = val;
  }
}
