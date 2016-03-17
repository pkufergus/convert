var TTFMAGIC = {
  VERSION :0x10000,
  CHECKSUM_ADJUSTMENT: 0xB1B0AFBA
};

var SIZEOF = {
  TTF_HEADER: 12,
  TTF_TABLE_ENTRY: 16
};

function createTableEntryList(TableTTFs, glyfList, offset, glyfTotalSize, Err){
  ttfTableEntryList = new Array();

}

function generateTTF(TableTTFs, glyfList, Err) {
  Println("SIZEOF SFNT_TABLE_ENTRY="+SIZEOF.TTF_TABLE_ENTRY);
  Println("glyfList length="+glyfList.length);
  glyfTotalSize = 0;
  for (x in glyfList) {
    if (typeof(glyfList[x].GlyfTable.length) !== 'undefined' && glyfList[x].GlyfTable.length >= 0 ) {
      glyfTotalSize += glyfList[x].GlyfTable.length;
    }
  }
  Println("glyfTotalSize= "+glyfTotalSize);
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
