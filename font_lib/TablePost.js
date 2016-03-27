var PostModule = (function(){
  function Module() {
  }
  var tableHeaderSize = 32;

  var nameMap = new Map();
  function createNameMap() {
    if (nameMap.size == 0) {
      nameMap.set(0x0000, ".null");
      nameMap.set(0x0020, "space");
      nameMap.set(0x00A0, "space");
      nameMap.set(0x0021, "exclam");
      nameMap.set(0x0022, "quotedbl");
      nameMap.set(0x0023, "numbersign");
      nameMap.set(0x0024, "dollar");
      nameMap.set(0x0025, "percent");
      nameMap.set(0x0026, "ampersand");
      nameMap.set(0x2019, "quoteright");
      nameMap.set(0x0028, "parenleft");
      nameMap.set(0x0029, "parenright");
      nameMap.set(0x002A, "asterisk");
      nameMap.set(0x002B, "plus");
      nameMap.set(0x002C, "comma");
      nameMap.set(0x002D, "hyphen");
      nameMap.set(0x00AD, "hyphen");
      nameMap.set(0x002E, "period");
      nameMap.set(0x002F, "slash");
      nameMap.set(0x0030, "zero");
      nameMap.set(0x0031, "one");
      nameMap.set(0x0032, "two");
      nameMap.set(0x0033, "three");
      nameMap.set(0x0034, "four");
      nameMap.set(0x0035, "five");
      nameMap.set(0x0036, "six");
      nameMap.set(0x0037, "seven");
      nameMap.set(0x0038, "eight");
      nameMap.set(0x0039, "nine");
      nameMap.set(0x003A, "colon");
      nameMap.set(0x003B, "semicolon");
      nameMap.set(0x003C, "less");
      nameMap.set(0x003D, "equal");
      nameMap.set(0x003E, "greater");
      nameMap.set(0x003F, "question");
      nameMap.set(0x0040, "at");
      nameMap.set(0x0041, "A");
      nameMap.set(0x0042, "B");
      nameMap.set(0x0043, "C");
      nameMap.set(0x0044, "D");
      nameMap.set(0x0045, "E");
      nameMap.set(0x0046, "F");
      nameMap.set(0x0047, "G");
      nameMap.set(0x0048, "H");
      nameMap.set(0x0049, "I");
      nameMap.set(0x004A, "J");
      nameMap.set(0x004B, "K");
      nameMap.set(0x004C, "L");
      nameMap.set(0x004D, "M");
      nameMap.set(0x004E, "N");
      nameMap.set(0x004F, "O");
      nameMap.set(0x0050, "P");
      nameMap.set(0x0051, "Q");
      nameMap.set(0x0052, "R");
      nameMap.set(0x0053, "S");
      nameMap.set(0x0054, "T");
      nameMap.set(0x0055, "U");
      nameMap.set(0x0056, "V");
      nameMap.set(0x0057, "W");
      nameMap.set(0x0058, "X");
      nameMap.set(0x0059, "Y");
      nameMap.set(0x005A, "Z");
      nameMap.set(0x005B, "bracketleft");
      nameMap.set(0x005C, "backslash");
      nameMap.set(0x005D, "bracketright");
      nameMap.set(0x005E, "asciicircum");
      nameMap.set(0x005F, "underscore");
      nameMap.set(0x2018, "quoteleft");
      nameMap.set(0x0061, "a");
      nameMap.set(0x0062, "b");
      nameMap.set(0x0063, "c");
      nameMap.set(0x0064, "d");
      nameMap.set(0x0065, "e");
      nameMap.set(0x0066, "f");
      nameMap.set(0x0067, "g");
      nameMap.set(0x0068, "h");
      nameMap.set(0x0069, "i");
      nameMap.set(0x006A, "j");
      nameMap.set(0x006B, "k");
      nameMap.set(0x006C, "l");
      nameMap.set(0x006D, "m");
      nameMap.set(0x006E, "n");
      nameMap.set(0x006F, "o");
      nameMap.set(0x0070, "p");
      nameMap.set(0x0071, "q");
      nameMap.set(0x0072, "r");
      nameMap.set(0x0073, "s");
      nameMap.set(0x0074, "t");
      nameMap.set(0x0075, "u");
      nameMap.set(0x0076, "v");
      nameMap.set(0x0077, "w");
      nameMap.set(0x0078, "x");
      nameMap.set(0x0079, "y");
      nameMap.set(0x007A, "z");
      nameMap.set(0x007B, "braceleft");
      nameMap.set(0x007C, "bar");
      nameMap.set(0x007D, "braceright");
      nameMap.set(0x007E, "asciitilde");
      nameMap.set(0x00A1, "exclamdown");
      nameMap.set(0x00A2, "cent");
      nameMap.set(0x00A3, "sterling");
      nameMap.set(0x2044, "fraction");
      nameMap.set(0x2215, "fraction");
      nameMap.set(0x00A5, "yen");
      nameMap.set(0x0192, "florin");
      nameMap.set(0x00A7, "section");
      nameMap.set(0x00A4, "currency");
      nameMap.set(0x0027, "quotesingle");
      nameMap.set(0x201C, "quotedblleft");
      nameMap.set(0x00AB, "guillemotleft");
      nameMap.set(0x2039, "guilsinglleft");
      nameMap.set(0x203A, "guilsinglright");
      nameMap.set(0xFB01, "fi");
      nameMap.set(0xFB02, "fl");
      nameMap.set(0x2013, "endash");
      nameMap.set(0x2020, "dagger");
      nameMap.set(0x2021, "daggerdbl");
      nameMap.set(0x00B7, "periodcentered");
      nameMap.set(0x2219, "periodcentered");
      nameMap.set(0x00B6, "paragraph");
      nameMap.set(0x2022, "bullet");
      nameMap.set(0x201A, "quotesinglbase");
      nameMap.set(0x201E, "quotedblbase");
      nameMap.set(0x201D, "quotedblright");
      nameMap.set(0x00BB, "guillemotright");
      nameMap.set(0x2026, "ellipsis");
      nameMap.set(0x2030, "perthousand");
      nameMap.set(0x00BF, "questiondown");
      nameMap.set(0x0060, "grave");
      nameMap.set(0x00B4, "acute");
      nameMap.set(0x02C6, "circumflex");
      nameMap.set(0x02DC, "tilde");
      nameMap.set(0x00AF, "macron");
      nameMap.set(0x02C9, "macron");
      nameMap.set(0x02D8, "breve");
      nameMap.set(0x02D9, "dotaccent");
      nameMap.set(0x00A8, "dieresis");
      nameMap.set(0x02DA, "ring");
      nameMap.set(0x00B8, "cedilla");
      nameMap.set(0x02DD, "hungarumlaut");
      nameMap.set(0x02DB, "ogonek");
      nameMap.set(0x02C7, "caron");
      nameMap.set(0x2014, "emdash");
      nameMap.set(0x00C6, "AE");
      nameMap.set(0x00AA, "ordfeminine");
      nameMap.set(0x0141, "Lslash");
      nameMap.set(0x00D8, "Oslash");
      nameMap.set(0x0152, "OE");
      nameMap.set(0x00BA, "ordmasculine");
      nameMap.set(0x00E6, "ae");
      nameMap.set(0x0131, "dotlessi");
      nameMap.set(0x0142, "lslash");
      nameMap.set(0x00F8, "oslash");
      nameMap.set(0x0153, "oe");
      nameMap.set(0x00DF, "germandbls");
    }
  }

  function getTableSize(glyfsList, names) {
    var result = tableHeaderSize;
    result += glyfsList.length * 2;
    for (n in names) {
      name = names[n];
      result += name.length;
    }
    return result;
  }

  function pascalString(glyf) {
    var len =0;
    var bytes = null;
    var start = 0;
    var unicode = "";
    if (nameMap.has(glyf.Unicode)) {
      unicode = nameMap.get(glyf.Unicode);
      len = unicode.length < 256 ? unicode.length : 255;
      bytes = new Uint8Array(len+1);
      bytes[0] = len;
      start = 1;
    } else {
      len = 7;
      bytes = new Uint8Array(len+1);
      bytes[0] = len;
      bytes[1] = "u".charCodeAt();
      bytes[2] = "n".charCodeAt();
      bytes[3] = "i".charCodeAt();
      var u = glyf.Unicode;
      var str = u.toString(16);
      var unicode =str;
      for (i = 0; i<4-str.length; i++) {
        unicode = "0"+unicode;
      }
      start = 4;
    }
    for (var i = 0; i < bytes.length - start; i++) {
      ch = unicode[i].charCodeAt();
      bytes[start + i] = ch < 128 ? ch : 95;
    }
    return bytes;
  }

  Module.createPostTable = function(glyfsList, PostTable) {
    var names = new Array();
    createNameMap();
    for (n in glyfsList) {
      item = glyfsList[n];
      if (item.Unicode != 0) {
        names.push(pascalString(item));
      }
    }
    var tableSize = getTableSize(glyfsList, names);
    var PostArray = new Uint8Array(tableSize);
    var PostDataView = new DataView(PostArray.buffer);
    PostArray.set(PostTable.subarray(0, tableHeaderSize));
    offset = tableHeaderSize;
    offset = DataViewWrite2(PostDataView, offset , glyfsList.length);
    // Array of glyph name indexes
    var index = 258; // first index of custom glyph name, it is calculated as glyph name index + 258
    for (n in glyfsList) {
      item = glyfsList[n];
      if (item.Unicode != 0) {
        offset = DataViewWrite2(PostDataView, offset, index);
        index+=1;
      } else {
        offset = DataViewWrite2(PostDataView, offset, 0);
      }
    }

    for (n in names) {
      PostArray.set(names[n], offset);
      offset += names[n].length;
    }

    return PostArray;
  }
  return Module;
}());
