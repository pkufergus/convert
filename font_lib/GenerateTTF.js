var TTFMAGIC = {
  VERSION :0x10000,
  CHECKSUM_ADJUSTMENT: 0xB1B0AFBA
};

var SIZEOF = {
  TTF_HEADER: 12,
  TTF_TABLE_ENTRY: 16
};

function createTableEntryList(TableTTFs, glyfList, offset, glyfTotalSize, Err){
  Println("createTableEntryList start ... ");
  ttfTableEntryList = new Array();
  var cmapArray = CmapModule.createCMapTable(glyfList);
  var locaArray = LocaModule.createLocaTable(glyfList, glyfTotalSize);

  Println("createTableEntryList end!");
  return ttfTableEntryList;
}

function generateTTF(TableTTFs, glyfList, Err) {
  Println("SIZEOF SFNT_TABLE_ENTRY="+SIZEOF.TTF_TABLE_ENTRY);
  Println("glyfList length="+glyfList.length);
  glyfList = glyfList.sort(function(a,b) {
    var aVal = parseInt(a.Unicode);
    var bVal = parseInt(b.Unicode);
    return aVal == bVal ? 0  : aVal < bVal ? -1 : 1;
  }
  );
  glyfTotalSize = 0;
  for (x in glyfList) {
    if (typeof(glyfList[x].GlyfTable.length) !== 'undefined' && glyfList[x].GlyfTable.length >= 0 ) {
      glyfTotalSize += glyfList[x].GlyfTable.length;
    }
  }
  Println("glyfTotalSize= "+glyfTotalSize);
  if (glyfTotalSize <= 0) {
    Println("glyfTotalSize= "+glyfTotalSize);
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
  ttfTableEntryList = createTableEntryList(TableTTFs, glyfList, offset, glyfTotalSize, Err);
  for (x in ttfTableEntryList) {
    bufSize += ttfTableEntryList[x].m_CorLength;
  }
  Println("bufSize= "+bufSize);
}
