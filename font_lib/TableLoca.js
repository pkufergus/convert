var LocaModule = (function(){
  function Module() {
  }

  function countTableSize(glyfsList, isShortFormat) {
    var result = (glyfsList.length + 1) * (isShortFormat ? 2 : 4); // by glyph count + tail
    return result;
  }

  Module.createLocaTable = function(glyfsList){
    var isShortFormat = glyfTotalSize < 0x20000;
    var tableSize = countTableSize(glyfsList, isShortFormat);
    var locaArray = new Uint8Array(tableSize);
    var locaDataView = new DataView(locaArray.buffer);

    var location = 0;
    var offset = 0;
    for (n in glyfsList) {
      if (isShortFormat) {
        locaDataView.setUint16(offset, location);
        offset += 2;
        if (glyfsList[n] != null && typeof(glyfsList[n].GlyfTable.length) !== 'undefined') {
          location += glyfsList[n].GlyfTable.length / 2; // actual location must be divided to 2 in short format
        }
      } else {
        locaDataView.setUint32(offset, location);
        offset += 4;
        if (glyfsList[n] != null && typeof(glyfsList[n].GlyfTable.length) !== 'undefined') {
          location += glyfsList[n].GlyfTable.length; ////actual location is stored as is in long format 
        }
      }
    }
    if (isShortFormat) {
      locaDataView.setUint16(offset, location);
      offset += 2;
    } else {
      locaDataView.setUint32(offset, location);
      offset += 4;
    }
    return locaArray;
  }
  return Module;
}());
