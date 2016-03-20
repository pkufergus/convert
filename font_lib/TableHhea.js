var HheaModule = (function(){
  function Module() {
  }
  var tableSize = 36;

  Module.createHheaTable0 = function() {
    var HheaArray = new Uint8Array(tableSize);
    return HheaArray;
  }
  Module.createHheaTable5 = function(HheaArray, HheaTable, glyfsList, yMax, yMin) {
    var HheaDataView = new DataView(HheaArray.buffer);
    HheaArray.set(HheaTable.slice(4));
    var offset = 4;
    offset = DataViewWrite2(HheaDataView, offset, yMax);
    offset = DataViewWrite2(HheaDataView, offset, yMin);
    HheaArray.set(HheaTable.slice(8,HheaArray.length-2), offset);
    offset = HheaArray.length-2;
    offset = DataViewWrite2(HheaDataView, offset, glyfsList.length);
    return HheaArray;
  }
  return Module;
}());
