var TTFMAGIC = {
  VERSION :0x10000,
  CHECKSUM_ADJUSTMENT: 0xB1B0AFBA
};

var SIZEOF = {
  TTF_HEADER: 12,
  TTF_TABLE_ENTRY: 16
};

function createTableEntryList(TableTTFs, glyfsList, offset, glyfsTotalSize, Err){
  Println("createTableEntryList start ... ");
  ttfTableEntryList = new Array();
  var cmapArray = CmapModule.createCMapTable(glyfsList);
  var locaArray = LocaModule.createLocaTable(glyfsList, glyfsTotalSize);
  var glyfsArray = new Uint8Array(glyfsTotalSize);

  var offset = 0;
  for (n in glyfsList) {
    if (glyfsList[n] != null && typeof(glyfsList[n].GlyfTable) != 'undefined') {
      glyfsArray.set(glyfsList[n].GlyfTable, offset);
      offset += glyfsList[n].GlyfTable.length;
    }
  }

  Println("createTableEntryList end!");
  return ttfTableEntryList;
}

function generateTTF(TableTTFs, glyfsList, Err) {
  Println("SIZEOF SFNT_TABLE_ENTRY="+SIZEOF.TTF_TABLE_ENTRY);
  Println("glyfsList length="+glyfsList.length);
  glyfsList = glyfsList.sort(function(a,b) {
    var aVal = parseInt(a.Unicode);
    var bVal = parseInt(b.Unicode);
    return aVal == bVal ? 0  : aVal < bVal ? -1 : 1;
  }
  );
  glyfsTotalSize = 0;
  for (x in glyfsList) {
    if (typeof(glyfsList[x].GlyfTable.length) !== 'undefined' && glyfsList[x].GlyfTable.length >= 0 ) {
      glyfsTotalSize += glyfsList[x].GlyfTable.length;
    }
  }
  Println("glyfsTotalSize= "+glyfsTotalSize);
  if (glyfsTotalSize <= 0) {
    Println("glyfsTotalSize= "+glyfsTotalSize);
    Println("parameter error");
    return;
  }
  tablesum = 10;
  if (typeof(TableTTFs.FpgmTable.length) == "undefined" || TableTTFs.FpgmTable.length <= 0) {
    tablesum = 10;
  } else{
    tablesum = 14;
  }
  Println("tablesum= "+tablesum);
  var headerSize = SIZEOF.TTF_HEADER + SIZEOF.TTF_TABLE_ENTRY * tablesum;
  var bufSize = headerSize;
  var offset = headerSize;

  ttfTableEntryList = new Array();
  ttfTableEntryList = createTableEntryList(TableTTFs, glyfsList, offset, glyfsTotalSize, Err);
  for (x in ttfTableEntryList) {
    bufSize += ttfTableEntryList[x].m_CorLength;
  }
  Println("bufSize= "+bufSize);
}
