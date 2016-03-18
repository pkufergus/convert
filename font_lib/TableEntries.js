var TableEntriesModule = (function(){

  var Seg1BytesBound = 0xFF;
  var Seg2BytesBound = 0xFFFF;

  function createCMapTable(glyfList){
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
    var segments4bytes = hasGLyphsOver2Bytes ? getSegments(glyfsList) : null; //get segments for all icodes

  }
})();
