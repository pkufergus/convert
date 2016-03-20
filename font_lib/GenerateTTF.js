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

var TAG10 = {
OS2 : 0x4f532f32,
CMAP : 0x636d6170,
GLYF : 0x676c7966,
HEAD : 0x68656164,
HHEA : 0x68686561,
HMTX : 0x686d7478,
LOCA : 0x6c6f6361,
MAXP : 0x6d617870,
NAME : 0x6e616d65,
POST : 0x706f7374
}

function ulong(t) {
  /*jshint bitwise:false*/
  t &= 0xffffffff;
  if (t < 0) {
    t += 0x100000000;
  }
  return t;
}
function getUint(t) {
	/*jshint bitwise:false*/
	var r = 0;
	r = (t & 0xffffffff);
  if (r < 0) {
    t = r + 0x100000000;
  } else {
		t = r;
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
	hhea.m_DataBytes = HheaModule.createHheaTable0();
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

	//OS/2
	var OS2 = new TableEntry();
	OS2.m_Tag = TAG.OS2;
	OS2.m_DataBytes = Os2Module.createOs2Table(glyfsList, TableTTFs.OS2Table, HeadModule.yMax, HeadModule.yMin);
	OS2.m_CheckSum = calc_checksum(OS2.m_DataBytes);
	OS2.m_Offset = offset;
	OS2.m_Length = OS2.m_DataBytes.length;
	OS2.m_CorLength = OS2.m_Length + (4 - OS2.m_Length % 4) % 4;
	offset += OS2.m_CorLength;
  ttfTableEntryList.push(OS2);
	//hhea的数据依赖于head和os/2
	hhea.m_DataBytes = HheaModule.createHheaTable5(hhea.m_DataBytes, TableTTFs.HheaTable, glyfsList, HeadModule.yMax, HeadModule.yMin);
	hhea.m_CheckSum = calc_checksum(hhea.m_DataBytes);

	//hmtx
	var hmtx = new TableEntry();
	hmtx.m_Tag = TAG.HMTX;
	hmtx.m_DataBytes = HmtxModule.createHmtxTable(glyfsList, TableTTFs.HmtxTable, TableTTFs.HorizAdvX);
	hmtx.m_CheckSum = calc_checksum(hmtx.m_DataBytes);
	hmtx.m_Offset = offset;
	hmtx.m_Length = hmtx.m_DataBytes.length;
	hmtx.m_CorLength = hmtx.m_Length + (4 - hmtx.m_Length % 4) % 4;
	offset += hmtx.m_CorLength;
  ttfTableEntryList.push(hmtx);

	//cmap
	var cmap = new TableEntry();
	cmap.m_Tag = TAG.CMAP;
	cmap.m_DataBytes = cmapArray;
	cmap.m_CheckSum = calc_checksum(cmapArray);
	cmap.m_Offset = offset;
	cmap.m_Length = cmapArray.length;
	cmap.m_CorLength = cmap.m_Length + (4 - cmap.m_Length % 4) % 4;
	offset += cmap.m_CorLength;
  ttfTableEntryList.push(cmap);

	//loca
	var loca = new TableEntry();
	loca.m_Tag = TAG.LOCA;
	loca.m_DataBytes = locaArray;
	loca.m_CheckSum = calc_checksum(locaArray);
	loca.m_Offset = offset;
	loca.m_Length = locaArray.length;
	loca.m_CorLength = loca.m_Length + (4 - loca.m_Length % 4) % 4;
	offset += loca.m_CorLength;
  ttfTableEntryList.push(loca);

	//glyf
	var glyf = new TableEntry();
	glyf.m_Tag = TAG.GLYF;
	glyf.m_DataBytes = glyfsArray;
	glyf.m_CheckSum = calc_checksum(glyfsArray);
	glyf.m_Offset = offset;
	glyf.m_Length = glyfsArray.length;
	glyf.m_CorLength = glyf.m_Length + (4 - glyf.m_Length % 4) % 4;
	offset += glyf.m_CorLength;
  ttfTableEntryList.push(glyf);

	//name
	var name = new TableEntry();
	name.m_Tag = TAG.NAME;
	name.m_DataBytes = new Uint8Array(TableTTFs.NameTable);
	name.m_CheckSum = calc_checksum(name.m_DataBytes);
	name.m_Offset = offset;
	name.m_Length = TableTTFs.NameTable.length;
	name.m_CorLength = name.m_Length + (4 - name.m_Length % 4) % 4;
	offset += name.m_CorLength;
  ttfTableEntryList.push(name);

	//post
	var post = new TableEntry();
	post.m_Tag = TAG.POST;
	post.m_DataBytes = PostModule.createPostTable(glyfsList, TableTTFs.PostTable);
	post.m_CheckSum = calc_checksum(post.m_DataBytes);
	post.m_Offset = offset;
	post.m_Length = post.m_DataBytes.length;
	post.m_CorLength = post.m_Length + (4 - post.m_Length % 4) % 4;
	offset += post.m_CorLength;
  ttfTableEntryList.push(post);

	//9-24日添加-保存灰度色
	if (TableTTFs.FpgmTable != null && TableTTFs.FpgmTable.length > 0) {

		//cvt_
		var cvt_ = new TableEntry();
		cvt_.m_Tag = TAG.CVT_;
		cvt_.m_DataBytes = new Uint8Array(TableTTFs.Cvt_Table);
		cvt_.m_CheckSum = calc_checksum(cvt_.m_DataBytes);
		cvt_.m_Offset = offset;
		cvt_.m_Length = TableTTFs.Cvt_Table.length;
		cvt_.m_CorLength = cvt_.m_Length + (4 - cvt_.m_Length % 4) % 4;
		offset += cvt_.m_CorLength;
    ttfTableEntryList.push(cvt_);

		//fpgm
		var fpgm = new TableEntry();
		fpgm.m_Tag = TAG.FPGM;
		fpgm.m_DataBytes = new Uint8Array(TableTTFs.FpgmTable);
		fpgm.m_CheckSum = calc_checksum(fpgm.m_DataBytes);
		fpgm.m_Offset = offset;
		fpgm.m_Length = TableTTFs.FpgmTable.length;
		fpgm.m_CorLength = fpgm.m_Length + (4 - fpgm.m_Length % 4) % 4;
		offset += fpgm.m_CorLength;
    ttfTableEntryList.push(fpgm);

		//prep
		var prep = new TableEntry();
		prep.m_Tag = TAG.PREP;
		prep.m_DataBytes = new Uint8Array(TableTTFs.PrepTable);
		prep.m_CheckSum = calc_checksum(prep.m_DataBytes);
		prep.m_Offset = offset;
		prep.m_Length = TableTTFs.PrepTable.length;
		prep.m_CorLength = prep.m_Length + (4 - prep.m_Length % 4) % 4;
		offset += prep.m_CorLength;
    ttfTableEntryList.push(prep);

		//gasp
		if (TableTTFs.GaspTable == null || TableTTFs.GaspTable.length == 0)   //如果Gasp为空，则添加一个默认的
			TableTTFs.GaspTable = new Uint8Array([ 0, 1, 0, 1, 255, 255, 0, 10 ]);
		var gasp = new TableEntry();
		gasp.m_Tag = TAG.GASP;
		gasp.m_DataBytes = new Uint8Array(TableTTFs.GaspTable);
		gasp.m_CheckSum = calc_checksum(gasp.m_DataBytes);
		gasp.m_Offset = offset;
		gasp.m_Length = TableTTFs.GaspTable.length;
		gasp.m_CorLength = gasp.m_Length + (4 - gasp.m_Length % 4) % 4;
		offset += gasp.m_CorLength;
    ttfTableEntryList.push(gasp);
	}

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

  //create TTF buffer
  var ttfArray = new Uint8Array(bufSize);
  var ttfDataView = new DataView(ttfArray.buffer);

  //special constants
  var entrySelector = Math.floor(Math.log(10) / Math.log(2));
  var searchRange = Math.pow(2, entrySelector) * 16;
  var rangeShift = tablesum * 16 - searchRange;
  var headOffset = 0;

  offset = 0;
  offset = DataViewWrite4(ttfDataView, offset, TTFMAGIC.VERSION);
  offset = DataViewWrite2(ttfDataView, offset, tablesum);
  offset = DataViewWrite2(ttfDataView, offset, searchRange);
  offset = DataViewWrite2(ttfDataView, offset, entrySelector);
  offset = DataViewWrite2(ttfDataView, offset, rangeShift);

  var tableOrder = TAG;
  if (tablesum == 14) {
    tableOrder = TAG;
  } else {
    tableOrder = TAG10;
  }
  var i = 0;
  for (n in tableOrder) {
    for (t in ttfTableEntryList) {
      item = ttfTableEntryList[t];
      if (item.m_Tag == tableOrder[n]) {
        offset = DataViewWrite4(ttfDataView, offset, item.m_Tag);
        offset = DataViewWrite4(ttfDataView, offset, item.m_CheckSum);
        offset = DataViewWrite4(ttfDataView, offset, item.m_Offset);
        offset = DataViewWrite4(ttfDataView, offset, item.m_Length);
        break;
      }
    }
  }

  for (t in ttfTableEntryList) {
    item = ttfTableEntryList[t];
    if (item.m_Tag == TAG.HEAD) {
      headOffset = offset;
    }
    ttfArray.set(item.m_DataBytes, offset);
    offset += item.m_DataBytes.length;
    for (i =item.m_Length; i<item.m_CorLength; i++) {
      offset = DataViewWrite1(ttfDataView, offset, 0);
    }
  }
  checkSumAdjustment = getUint((TTFMAGIC.CHECKSUM_ADJUSTMENT - calc_checksum(ttfArray)));
	// Write font checksum (corrected by magic value) into HEAD table
  DataViewWrite4(ttfDataView, headOffset + 8, checkSumAdjustment);

  Println("bufSize= "+bufSize);
  return ttfArray;
}

function generateTTFFile(TableTTFs, TableGlyfsList, Err) {
  var ttfArray = generateTTF(TableTTFs, TableGlyfsList, Err);
  var container = document.getElementById('fonts');
  var link = container.insertBefore(document.createElement('a'), container.firstElementChild);
  link.textContent = link.download = "test.ttf";
  link.href = buffer2url_woff(ttfArray);
}
