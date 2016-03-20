var TTFMAGIC = {
  VERSION :0x10000,
  CHECKSUM_ADJUSTMENT: 0xB1B0AFBA
};

var SIZEOF = {
  TTF_HEADER: 12,
  TTF_TABLE_ENTRY: 16
};

var TAG = {
OS2 : 0x4f532f32,
CMAP : 0x636d6170,
CVT_ : 0x63767420,
FPGM : 0x6670676d,
GASP : 0x67617370,
GLYF : 0x676c7966,
HEAD : 0x68656164,
HHEA : 0x68686561,
HMTX : 0x686d7478,
LOCA : 0x6c6f6361,
MAXP : 0x6d617870,
NAME : 0x6e616d65,
POST : 0x706f7374,
PREP : 0x70726570
}

function ulong(t) {
  /*jshint bitwise:false*/
  t &= 0xffffffff;
  if (t < 0) {
    t += 0x100000000;
  }
  return t;
}
function calc_checksum(arr) {
	var sum = 0;
	var nlongs = parseInt(arr.length / 4);
  var arrDataView = new DataView(arr.buffer);

	for (var i = 0; i < nlongs; ++i) {
		var t = arrDataView.getUint32(i*4);

		sum = ulong(sum + t);
	}
  var leftBytes = arr.length - nlongs * 4;
  if (leftBytes > 0) {
    var leftRes = 0;
		for (i = 0; i < 4; i++) {
			/*jshint bitwise:false*/
			leftRes = (leftRes << 8) + ((i < leftBytes) ? arrDataView.getUint8(nlongs * 4 + i) : 0);
		}
		sum += leftRes;
  }
	return sum;
}

function createTableEntryList(TableTTFs, glyfsList, offset, glyfsTotalSize, Err){
  Println("createTableEntryList start ... ");
  ttfTableEntryList = new Array();
  var cmapArray = CmapModule.createCMapTable(glyfsList);
  var locaArray = LocaModule.createLocaTable(glyfsList, glyfsTotalSize);
  var glyfsArray = new Uint8Array(glyfsTotalSize);

  var tmp_offset = 0;
  for (n in glyfsList) {
    if (glyfsList[n] != null && typeof(glyfsList[n].GlyfTable) != 'undefined') {
      glyfsArray.set(glyfsList[n].GlyfTable, tmp_offset);
      tmp_offset += glyfsList[n].GlyfTable.length;
    }
  }

	//hhea
	var hhea = new TableEntry();
	hhea.m_Tag = TAG.HHEA;
	hhea.m_DataBytes = HheaModule.createHheaTable();
	hhea.m_Offset = offset;
	hhea.m_Length = hhea.m_DataBytes.length;
	hhea.m_CorLength = hhea.m_Length + (4 - hhea.m_Length % 4) % 4;
	offset += hhea.m_CorLength;
  ttfTableEntryList.push(hhea);

  //head
  var head = new TableEntry();
  head.m_Tag = TAG.HEAD;
  head.m_DataBytes = HeadModule.createHeadTable(glyfsList, glyfsTotalSize, TableTTFs.HeadTable);
  head.m_CheckSum = calc_checksum(head.m_DataBytes);
  head.m_Offset = offset;
  head.m_Length = head.m_DataBytes.length;
  head.m_CorLength = head.m_Length + (4 - head.m_Length % 4) % 4;
  offset += head.m_CorLength;
  ttfTableEntryList.push(head);

	//maxp
	var  maxp = new TableEntry();
	maxp.m_Tag = TAG.MAXP;
	maxp.m_DataBytes = MaxpModule.createMaxpTable(glyfsList, TableTTFs.MaxpTable);
	maxp.m_CheckSum = calc_checksum(maxp.m_DataBytes);
	maxp.m_Offset = offset;
	maxp.m_Length = maxp.m_DataBytes.length;
	maxp.m_CorLength = maxp.m_Length + (4 - maxp.m_Length % 4) % 4;
	offset += maxp.m_CorLength;
  ttfTableEntryList.push(maxp);

	Println("ttf table size="+ttfTableEntryList.length);
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
