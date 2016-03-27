var TABLE0 = {
  FORMAT: 0,
  LENGTH: 2,
  LANGUAGE: 4,
  DATA_OFFSET: 6
};

var TABLE4 = {
  FORMAT: 0,
  LENGTH: 2,
  LANGUAGE: 4,
  SegCountX2:6,
  SearchRange:8,
  EntrySelector:10,
  RangeShift:12,
  EndCode: 14
};

var CmapModule = (function(){
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
      return "rang =<"+this.start+" "+this.end +">"+"delta="+this.delta+" ";
    }
  }

  function encodeDelta(delta) {
    return delta > 0x7FFF ? delta - 0x10000 : (delta < -0x7FFF ? delta + 0x10000 : delta);
  }

  function getSegments(glyfsList, bound) {
    var delta = 0;
    var prevCode = -1;
    var prevDelta = -1;
    var segment = new Segment();
    var prevEndCode = 0;

    for (n in glyfsList) {
      var Unicode = glyfsList[n].Unicode;
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
    for (n in segs) {
      Println("n="+n+" : "+segs[n].toString());
    }
  }
  function showArray(arr) {
    for (n in arr) {
      Println("n="+n+":"+arr[n]);
    }
  }
  function showUnit16Array(arr) {
    var view = new DataView(arr.buffer);
    for (i = 0; i< arr.length; i+=2) {
      Println("n="+i+":"+view.getUint16(i));
    }
  }
  function createSubTable0(glyfsList){
    var table0 = new Uint8Array(262);
    var table0DataView = new DataView(table0.buffer);
    table0DataView.setUint16(TABLE0.FORMAT, 0); // format
    table0DataView.setUint16(TABLE0.LENGTH, 262); // length
    table0DataView.setUint16(TABLE0.LANGUAGE, 0); // language

    // Array of unicodes 0..255
    var count = glyfsList.length > 255 ? 255 : glyfsList.length;
    var j=0;
    var offset = TABLE0.DATA_OFFSET;
    for (i = 0; i < 256; i++) {
      if (j >= count|| count<=0) {
        break;
      }
      if (i<glyfsList[j].Unicode) {
        table0DataView.setUint8(offset, 0);
      } else if (i == glyfsList[j].Unicode) {
        table0DataView.setUint8(offset, j);
        j++;
      }
      offset += 1;
    }
    return table0;
  }

  function createSubTable4(glyfsList,segments2bytes){
    var bufSize = 24; // subtable 4 header and required array elements
    bufSize += segments2bytes.length * 8; // subtable 4 segments
    var table4 = new Uint8Array(bufSize);
    var table4DataView = new DataView(table4.buffer);

    table4DataView.setUint16(TABLE4.FORMAT, 4); // format
    table4DataView.setUint16(TABLE4.LENGTH, bufSize);// length
    table4DataView.setUint16(TABLE4.LANGUAGE, 0) // language
    var segCount = segments2bytes.length + 1;
    table4DataView.setUint16(TABLE4.SegCountX2, (segCount * 2)); // segCountX2
    var maxExponent = Math.floor(Math.log2(segCount));
    var searchRange = 2 * Math.pow(2, maxExponent);
    table4DataView.setUint16(TABLE4.SearchRange, searchRange); // searchRange
    table4DataView.setUint16(TABLE4.EntrySelector, maxExponent); // entrySelector
    table4DataView.setUint16(TABLE4.RangeShift, (2 * segCount - searchRange)); // rangeShift

    var offset = TABLE4.EndCode;
    for (n in segments2bytes) {
      table4DataView.setUint16(offset, segments2bytes[n].end);
      offset+=2;
    }
    table4DataView.setUint16(offset, Seg2BytesBound); //endCountArray should be finished with 0xFFFF
    offset += 2;
    table4DataView.setUint16(offset, 0);
    offset += 2;
    for (n in segments2bytes) {
      table4DataView.setUint16(offset, segments2bytes[n].start);
      offset+=2;
    }
    table4DataView.setUint16(offset, Seg2BytesBound); //startCountArray should be finished with 0xFFFF
    offset += 2;
    for (n in segments2bytes) {
      table4DataView.setUint16(offset, segments2bytes[n].delta);
      offset+=2;
    }
    table4DataView.setUint16(offset, 1); // idDeltaArray should be finished with 1
    offset += 2;
    for (n in segments2bytes) {
      table4DataView.setUint16(offset, 0);
      offset+=2;
    }
    table4DataView.setUint16(offset, 0); // idDeltaArray should be finished with 1
    offset += 2;
    return table4;
  }

  function createSubTable12(segments4bytes){
    var bufSize = 16; // subtable 12 header
    var segsLength = segments4bytes != null ? segments4bytes.length : 0;
    bufSize += segsLength * 12; // subtable 12 segments
    var table12 = new Uint8Array(bufSize); //fixed buffer size
    var table12DataView = new DataView(table12.buffer);

    table12DataView.setUint16(0, 12); // format
    table12DataView.setUint16(2, 0);  // reserved
    table12DataView.setUint32(4, bufSize); // length
    table12DataView.setUint32(8, 0); // language
    table12DataView.setUint32(12, segsLength); // nGroups
    var startGlyphCode = 0;
    var offset = 16;
    for (n in segments4bytes)
    {
      table12DataView.setUint32(offset, segments4bytes[n].start); // startCharCode
      offset += 4;
      table12DataView.setUint32(offset, segments4bytes[n].end); // endCharCode
      offset += 4;
      table12DataView.setUint32(offset, startGlyphCode); // startGlyphCode
      offset += 4;
      startGlyphCode += (segments4bytes[n].end - segments4bytes[n].start + 1);
    }
    return table12;
  }

  function writeSubTableHeader(dataView, startOffset, platformID, encodingID, subtableOffset){
    dataView.setUint16(startOffset, platformID);
    dataView.setUint16(startOffset+2, encodingID);
    dataView.setUint32(startOffset+4, subtableOffset);
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
    Println("subtable len="+subTable0.length);
    //showArray(subTable0);
    var subTable4 = createSubTable4(glyfsList, segments2bytes); // subtable 4
    Println("subtable4 len="+subTable4.length);
    showUnit16Array(subTable4);
    var subTable12 = segments4bytes != null ? createSubTable12(segments4bytes) : null; // subtable 12

    var subTableOffset = 4 + (hasGLyphsOver2Bytes ? 32 : 24);
    var bufSize = subTableOffset + subTable0.length + subTable4.length + (subTable12 != null ?subTable12.length : 0);

    cmapArray = new Uint8Array(bufSize);
    cmapDataView = new DataView(cmapArray.buffer);
    cmapDataView.setUint16(0, 0);  //version
    cmapDataView.setUint16(2, hasGLyphsOver2Bytes ? 4 : 3); //count
    // Create subtable headers. Subtables must be sorted by platformID, encodingID
    writeSubTableHeader(cmapDataView, 4,  0, 3, subTableOffset);
    writeSubTableHeader(cmapDataView, 12, 1, 0, subTableOffset + subTable4.length);
    writeSubTableHeader(cmapDataView, 20, 3, 1, subTableOffset);
    if (subTable12 != null) {
      writeSubTableHeader(cmapDataView, 28, 3, 10, subTableOffset + subTable0.length + subTable4.length); // subtable 12
    }
    // Write tables, order of table seem to be magic, it is taken from TTX tool
    cmapArray.set(subTable4, subTableOffset);
    cmapArray.set(subTable0, subTableOffset + subTable4.length);
    if (subTable12 != null) {
      cmapArray.set(subTable12, subTableOffset + subTable4.length+ subTable0.length);
    }
    return cmapArray;
  }
  return Module;
}());
