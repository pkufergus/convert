function zlib_decompress(buffer) {
  var inflate = new pako.Inflate();
  inflate.push(new Uint8Array(buffer), true);
  if (inflate.err) {
    throw new Error(inflate.err);
  }
  return inflate.result;
}

function zlib_compress(buffer) {
  var compressdata = new pako2.deflate(buffer);
  return compressdata;
}

function ulong(t) {
  /*jshint bitwise:false*/
  t &= 0xffffffff;
  if (t < 0) {
    t += 0x100000000;
  }
  return t;
}

function longAlign(n) {
  /*jshint bitwise:false*/
  return (n + 3) & ~3;
}

function calc_checksum(buf) {
  var sum = 0;
  var nlongs = parseInt(buf.length / 4);

  for (var i = 0; i < nlongs; ++i) {
    var t = getUint32_Array(buf, i * 4);

    sum = ulong(sum + t);
  }
  return sum;
}

var WOFF_OFFSET = {
  MAGIC: 0,
  FLAVOR: 4,
  SIZE: 8,
  NUM_TABLES: 12,
  RESERVED: 14,
  SFNT_SIZE: 16,
  VERSION_MAJ: 20,
  VERSION_MIN: 22,
  META_OFFSET: 24,
  META_LENGTH: 28,
  META_ORIG_LENGTH: 32,
  PRIV_OFFSET: 36,
  PRIV_LENGTH: 40
};

var WOFF_ENTRY_OFFSET = {
  TAG: 0,
  OFFSET: 4,
  COMPR_LENGTH: 8,
  LENGTH: 12,
  CHECKSUM: 16
};

var SFNT_OFFSET = {
  TAG: 0,
  CHECKSUM: 4,
  OFFSET: 8,
  LENGTH: 12
};

var SFNT_ENTRY_OFFSET = {
  FLAVOR: 0,
  VERSION_MAJ: 4,
  VERSION_MIN: 6,
  CHECKSUM_ADJUSTMENT: 8
};

var MAGIC = {
  WOFF: 0x774F4646,
  CHECKSUM_ADJUSTMENT: 0xB1B0AFBA
};

var SIZEOF = {
  WOFF_HEADER: 44,
  WOFF_ENTRY: 20,
  SFNT_HEADER: 12,
  SFNT_TABLE_ENTRY: 16
};


function ttf2woff(bufferIn, errorCode) {
  var dataViewIn = new DataView(bufferIn);

  var version = {
    maj: 0,
    min: 1
  };
  var numTables = dataViewIn.getUint16(4);
  console.log("num table =%d", numTables);
  var flavor = 0x10000;

  var woffHeader = new Uint8Array(SIZEOF.WOFF_HEADER);
  var woffHeaderDataView = new DataView(woffHeader.buffer);

  woffHeaderDataView.setUint32(WOFF_OFFSET.MAGIC, MAGIC.WOFF);
  woffHeaderDataView.setUint16(WOFF_OFFSET.NUM_TABLES, numTables);
  woffHeaderDataView.setUint16(WOFF_OFFSET.RESERVED, 0);
  woffHeaderDataView.setUint32(WOFF_OFFSET.SFNT_SIZE, 0);
  woffHeaderDataView.setUint32(WOFF_OFFSET.META_OFFSET, 0);
  woffHeaderDataView.setUint32(WOFF_OFFSET.META_LENGTH, 0);
  woffHeaderDataView.setUint32(WOFF_OFFSET.META_ORIG_LENGTH, 0);
  woffHeaderDataView.setUint32(WOFF_OFFSET.PRIV_OFFSET, 0);
  woffHeaderDataView.setUint32(WOFF_OFFSET.PRIV_LENGTH, 0);

  console.log("woff header =%o", woffHeader);

  var entries = [];

  var i, tableEntry;

  for (i = 0; i < numTables; ++i) {
    var data = new Uint8Array(dataViewIn.buffer, SIZEOF.SFNT_HEADER + i * SIZEOF.SFNT_TABLE_ENTRY, SIZEOF.SFNT_TABLE_ENTRY).slice(0);
    var dataDataView = new DataView(data.buffer);

    tableEntry = {
      Tag: new Uint8Array(data.buffer, SFNT_OFFSET.TAG, 4),
      checkSum: dataDataView.getUint32(SFNT_OFFSET.CHECKSUM),
      Offset: dataDataView.getUint32(SFNT_OFFSET.OFFSET),
      Length: dataDataView.getUint32(SFNT_OFFSET.LENGTH)
    };
    entries.push (tableEntry);
  }
  entries = entries.sort(function (a, b) {
    var aStr = a.Tag.toString();
    var bStr = b.Tag.toString();

    return aStr === bStr ? 0 : aStr < bStr ? -1 : 1;
  });
  var offset = SIZEOF.WOFF_HEADER + numTables * SIZEOF.WOFF_ENTRY;
  var woffSize = offset;
  var sfntSize = SIZEOF.SFNT_HEADER + numTables * SIZEOF.SFNT_TABLE_ENTRY;

  var woffTableArray = new Uint8Array(numTables * SIZEOF.WOFF_ENTRY);
  var woffTableDataView = new DataView(woffTableArray.buffer);

  var ttfTableEntry;
  for (i = 0; i < numTables; ++i) {
    ttfTableEntry = entries[i];

    if (String.fromCharCode.apply(null, ttfTableEntry.Tag) !== 'head') {
      var algntable = new Uint8Array(dataViewIn.buffer, ttfTableEntry.Offset, longAlign(ttfTableEntry.Length)).slice();

      if (calc_checksum(algntable) !== ttfTableEntry.checkSum) {
        console.error("Checksum error in =[%s]", String.fromCharCode.apply(null, ttfTableEntry.Tag));
      }
    }

    woffTableDataView.setUint32(i * SIZEOF.WOFF_ENTRY + WOFF_ENTRY_OFFSET.TAG, getUint32_Array(ttfTableEntry.Tag));
    woffTableDataView.setUint32(i * SIZEOF.WOFF_ENTRY + WOFF_ENTRY_OFFSET.LENGTH, ttfTableEntry.Length);
    woffTableDataView.setUint32(i * SIZEOF.WOFF_ENTRY + WOFF_ENTRY_OFFSET.CHECKSUM, ttfTableEntry.checkSum);
    sfntSize += longAlign(ttfTableEntry.Length);
  }

  var sfntOffset = SIZEOF.SFNT_HEADER + entries.length * SIZEOF.SFNT_TABLE_ENTRY;
  var csum = calc_checksum (new Uint8Array(dataViewIn.buffer, 0, SIZEOF.SFNT_HEADER).slice());

  for (i = 0; i < entries.length; ++i) {
    ttfTableEntry = entries[i];

    var b = new Uint8Array(SIZEOF.SFNT_TABLE_ENTRY);
    var bDataView = new DataView(b.buffer);

    bDataView.setUint32(SFNT_OFFSET.TAG, getUint32_Array(ttfTableEntry.Tag));
    bDataView.setUint32(SFNT_OFFSET.CHECKSUM, ttfTableEntry.checkSum);
    bDataView.setUint32(SFNT_OFFSET.OFFSET, sfntOffset);
    bDataView.setUint32(SFNT_OFFSET.LENGTH, ttfTableEntry.Length);
    sfntOffset += longAlign(ttfTableEntry.Length);
    csum += calc_checksum (b);
    csum += ttfTableEntry.checkSum;
  }
  var checksumAdjustment = ulong(MAGIC.CHECKSUM_ADJUSTMENT - csum);

  var len, woffDataChains = [];

  for (i = 0; i < entries.length; ++i) {
    ttfTableEntry = entries[i];

    var sfntData = new Uint8Array(dataViewIn.buffer, ttfTableEntry.Offset, ttfTableEntry.Length).slice();
    var sfntDataView = new DataView(sfntData.buffer);

    if (String.fromCharCode.apply(null, tableEntry.Tag) === 'head') {
      version.maj = sfntDataView.getUint16(SFNT_ENTRY_OFFSET.VERSION_MAJ);
      version.min = sfntDataView.getUint16(SFNT_ENTRY_OFFSET.VERSION_MIN);
      flavor = sfntDataView.getUint32(SFNT_ENTRY_OFFSET.FLAVOR);
      sfntDataView.setUint32 (SFNT_ENTRY_OFFSET.CHECKSUM_ADJUSTMENT, checksumAdjustment);
    }

    var res = zlib_compress(sfntData);

    var compLength;

    // We should use compression only if it really save space (standard requirement).
    // Also, data should be aligned to long (with zeros?).
    compLength = Math.min(res.length, sfntData.length);
    len = longAlign(compLength);

    var woffDataArray = new Uint8Array(len);

    woffDataArray.fill(0);

    if (res.length >= sfntData.length) {
      woffDataArray.set(sfntData);
    } else {
      woffDataArray.set(res);
    }

    woffTableDataView.setUint32(i * SIZEOF.WOFF_ENTRY + WOFF_ENTRY_OFFSET.OFFSET, offset);

    offset += woffDataArray.length;
    woffSize += woffDataArray.length;

    woffTableDataView.setUint32(i * SIZEOF.WOFF_ENTRY + WOFF_ENTRY_OFFSET.COMPR_LENGTH, compLength);

    woffDataChains.push(woffDataArray);
  }

	woffHeaderDataView.setUint32(WOFF_OFFSET.SIZE, woffSize);
  woffHeaderDataView.setUint32(WOFF_OFFSET.SFNT_SIZE, sfntSize);
  woffHeaderDataView.setUint16(WOFF_OFFSET.VERSION_MAJ, version.maj);
  woffHeaderDataView.setUint16(WOFF_OFFSET.VERSION_MIN, version.min);
  woffHeaderDataView.setUint32(WOFF_OFFSET.FLAVOR, flavor);

	var outArray = new Uint8Array(woffSize);

  outArray.set(woffHeader);
  outArray.set(woffTableArray, woffHeader.length);

  var woffOffset = woffHeader.length + woffTableArray.length;
  for (i = 0; i < woffDataChains.length; i++) {
    outArray.set(woffDataChains[i], woffOffset);
    woffOffset += woffDataChains[i].length;
  }
  errorCode.status = 0;
  return outArray;
}
