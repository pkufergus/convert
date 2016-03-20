var MaxpModule = (function(){
  function Module() {
  }
  var tableSize = 32;
  Module.createMaxpTable = function(glyfsList, MaxpTable) {
    var MaxpArray = new Uint8Array(tableSize);
    var MaxpDataView = new DataView(MaxpArray.buffer);


    var offset = 0;
    offset = DataViewWrite4(MaxpDataView, offset, 0x10000); // version
    offset = DataViewWrite2(MaxpDataView, offset, glyfsList.length); // numGlyph
    MaxpArray.set(MaxpTable.slice(6, tableSize), offset);

    return MaxpArray;
  }
  return Module;
}());
