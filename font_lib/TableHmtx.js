var HmtxModule = (function(){
  function Module() {
  }
  var tableSize = 0;

  Module.createHmtxTable = function(glyfsList, HmtxTable, HorizAdvX) {
    tableSize = glyfsList.length * 4
    var HmtxArray = new Uint8Array(tableSize);
    var HmtxDataView = new DataView(HmtxArray.buffer);
    var offset = 0;
    for (n in glyfsList) {
      item = glyfsList[n];
      if (item == null) {
        continue;
      }
      if (item.HorizAdvX <= 0) {
        offset = DataViewWrite2(HmtxDataView, offset, HorizAdvX);
      } else {
        offset = DataViewWrite2(HmtxDataView, offset, item.HorizAdvX);
      }
      offset = DataViewWrite2(HmtxDataView, offset, item.LSB);
    }
    return HmtxArray;
  }
  return Module;
}());
