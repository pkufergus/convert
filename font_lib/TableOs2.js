var Os2Module = (function(){
  function Module() {
  }
  var tableSize = 86;

  function getFirstCharIndex(glyfsList) {
    var min = 0xFFFF;
    for (n in glyfsList) {
      item = glyfsList[n];
      if (item.Unicode != 0 && item.Unicode < min) {
        min = item.Unicode;
        break;
      }
    }
    return min;
  }

  function getLastCharIndex(glyfsList){
    var max = 0;
    var len = glyfsList.length;
    for (i = len-1; i >=0; i--) {
      item = glyfsList[i];
      if (item.Unicode <= 0xFFFF && item.Unicode > max) {
        max = item.Unicode;
        break;
      }
    }
    return max;
  }

  Module.createOs2Table = function(glyfsList, OS2Table, yMax, yMin) {
    var Os2Array = new Uint8Array(tableSize);
    var Os2DataView = new DataView(Os2Array.buffer);

    Os2Array.set(OS2Table.subarray(0, 64));
    var offset = 64;
    offset = DataViewWrite2(Os2DataView, offset, getFirstCharIndex(glyfsList));
    offset = DataViewWrite2(Os2DataView, offset, getLastCharIndex(glyfsList));
    Os2Array.set(OS2Table.subarray(68, 86), offset);
    offset = 74;
    offset = DataViewWrite2(Os2DataView, offset, yMax < 0 ? -yMax : yMax);
    offset = DataViewWrite2(Os2DataView, offset, yMin < 0 ? -yMin : yMin);
    Os2Array.set(OS2Table.subarray(78, 86), offset);
    return Os2Array;
  }
  return Module;
}());
