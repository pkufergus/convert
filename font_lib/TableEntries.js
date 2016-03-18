var TableEntriesModule = (function(){
  function Module() {
  }

  var Seg1BytesBound = 0xFF;
  var Seg2BytesBound = 0xFFFF;
  var Seg4BytesBound = 0xFFFFFFFF;

  function getSegments(glyfsList, bound) {
    segments = new Array();
    return segments; 
  }

  Module.createCMapTable = function(glyfsList){
    var cmapArray = new Uint8Array();
    hasGLyphsOver2Bytes = false;
    //we will always have subtable 4
    var segments2bytes = getSegments(glyfsList, Seg2BytesBound); //get segments for unicodes < 0xFFFF if found unicodes >= 0xFF
    // We need subtable 12 only if found unicodes with > 2 bytes.
    if (typeof(glyfsList.length) === 'undefined' || glyfsList.length <= 0 ) {
      Log("glyfsList exception");
      return cmapArray.buffer;
    }
    if (glyfsList[glyfsList.length-1].Unicode > Seg2BytesBound) {
      hasGLyphsOver2Bytes = true;
    }
    Println("hasGLyphsOver2Bytes = " + hasGLyphsOver2Bytes);
    var segments4bytes = hasGLyphsOver2Bytes ? getSegments(glyfsList, Seg4BytesBound) : null; //get segments for all icodes
    Log("segments2bytes len = " + segments2bytes.length);
    Log("segments4bytes len = " + (segments4bytes == null ? -1 : segments4bytes.length));

    return cmapArray;
  }
  return Module;
}());
