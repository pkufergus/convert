var TableEntriesModule = (function(){
  function Module() {
  }

  var Seg1BytesBound = 0xFF;
  var Seg2BytesBound = 0xFFFF;
  var Seg4BytesBound = 0xFFFFFFFF;

  function Segment() {
    this.start = 0;
    this.end = 0;
    this.delta = 0;
  }
  Segment.prototype = {
    toString: function() {
      return "rang =<"+start+" "+end +">"+"delta="+delta+" ";
    }
  }

  function encodeDelta(delta) {
    return delta > 0x7FFF ? delta - 0x10000 : (delta < -0x7FFF ? delta + 0x10000 : delta);
  }

  function getSegments(glyfsList, bound) {
    segments = new Array();
    int delta = 0;
    var prevCode = -1;
    var prevDelta = -1;
    segment = new Segment();
    var prevEndCode = 0;

    for (n in glyfsList) {
      Unicode = glyfsList[n].Unicode;
      if (Unicode < 0 || Unicode > bound) {
        break;
      }
      if (prevCode < 0) {
        segment.start = Unicode;
      } else {
        if (Unicode != prevCode + 1) {
          segment.end = prevCode;
          delta = prevEndCode - segment.start + prevDelta + 1;
          segment.delta = encodeDelta(delta);
          prevEndCode = segment.end;
          prevDelta = delta;
          segments.push(segment);
          segment = new  Segment();
          segment.start = Unicode;
        }
      }
      prevCode = Unicode;
    }
    if (prevCode > 0) {
      segment.end = prevCode;
      delta = prevEndCode - segment.start + prevDelta + 1;
      segment.delta = encodeDelta(delta);
      segments.push(segment);
    }
    return segments;
  }
  function showSegments(segs) {
    for (n int segs) {
      Println("n="+n+" : "+segs[n].toString());
    }
  }
  function createSubTable0(glyfsList){
  }
  function createSubTable4(glyfsList,segments2bytes){
  }
  function createSubTable12(segments4bytes){
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
    Println("segments2bytes len = " + segments2bytes.length);
    Println("segments4bytes len = " + (segments4bytes == null ? -1 : segments4bytes.length));

    showSegments(segments2bytes);
    showSegments(segments4bytes);
    // Create subtables first.
    var subTable0 = createSubTable0(glyfsList); // subtable 0
    var subTable4 = createSubTable4(glyfsList, segments2bytes); // subtable 4
    var subTable12 = segments4bytes != null ? createSubTable12(segments4bytes) : null; // subtable 12

    return cmapArray;
  }
  return Module;
}());
