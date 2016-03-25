var Err = new Object({
number : 0,
msg :""
});

function TableTTFsClass() {
  this.Id = 1,
  this.FontName= "",
  this.OS2Table= new Uint8Array(),
  this.HeadTable= new Uint8Array(),
  this.HheaTable= new Uint8Array(),
  this.HmtxTable= new Uint8Array(),
  this.MaxpTable= new Uint8Array(),
  this.NameTable= new Uint8Array(),
  this.PostTable= new Uint8Array(),
  this.Cvt_Table= new Uint8Array(),
  this.FpgmTable= new Uint8Array(),
  this.PrepTable= new Uint8Array(),
  this.GaspTable= new Uint8Array(),
  this.HorizAdvX= 9,
  this.FontFace= ""
}
TableTTFsClass.prototype = {
  SetValueByFilename: function(filename, obj) {
    if (filename.endsWith(".txt")) {
      filename = filename.substring(0, filename.lastIndexOf(".txt"));
    }
    switch(filename) {
      case "FontName":
        this.FontName = obj;
        break;
      case "OS2Table":
        this.OS2Table = obj;
        break;
      case "HeadTable":
        this.HeadTable = obj;
        break;
      case "HheaTable":
        this.HheaTable = obj;
        break;
      case "HmtxTable":
        this.HmtxTable = obj;
        break;
      case "MaxpTable":
        this.MaxpTable = obj;
        break;
      case "NameTable":
        this.NameTable = obj;
        break;
      case "PostTable":
        this.PostTable = obj;
        break;
      case "Cvt_Table":
        this.Cvt_Table = obj;
        break;
      case "FpgmTable":
        this.FpgmTable = obj;
        break;
      case "PrepTable":
        this.PrepTable = obj;
        break;
      case "GaspTable":
        this.GaspTable = obj;
        break;
      case "HorizAdvX":
        this.HorizAdvX = obj;
        break;
      case "FontFace":
        this.FontFace = obj;
        break;
      default:
        console.log("unknown filename");
    }
  }
};

function TableGlyfs() {
  this.Id = 0;
  this.Unicode = 0;
  this.GlyfTable = new Uint8Array();
  this.LSB = 0;
  this.HorizAdvX = 0;
  this.SVGPath = "";
}
TableGlyfs.prototype = {
SetValueByFilename: function(filename, obj) {
  if (filename.endsWith(".txt")) {
    filename = filename.substring(0, filename.lastIndexOf(".txt"));
  }
  switch(filename) {
    case "Id":
      this.Id = obj; break;
    case "Unicode":
      this.Unicode = parseInt(obj); break;
    case "GlyfTable":
      this.GlyfTable = obj; break;
    case "LSB":
      this.LSB = parseInt(obj); break;
    case "HorizAdvX":
      this.HorizAdvX = parseInt(obj); break;
    case "SVGPath":
      this.SVGPath = obj; break;
    default:
      console.log("unknown filename");
  }
}
};

function TableEntry() {
  this.m_Tag = 0;
  this.m_CheckSum = 0;
  this.m_Offset = 0;
  this.m_Length = 0;
  this.m_CorLength = 0;
  this.m_DataBytes = new Uint8Array();
}

function createMap() {
  if (typeof Map !== 'undefined') {
    return new Map();
  } else {
    return new Dictionary();
  }
}
var ttfInfoMap = createMap();
function GlyfMapTable() {
  this.glyfMapTable = createMap();
}

GlyfMapTable.prototype = {
add: function(id, Unicode, glyf) {
  if (this.glyfMapTable.has(id)) {
    return this.glyfMapTable.get(id).add(Unicode, glyf);
  } else {
    this.glyfMapTable.add(id, createMap());
    return this.glyfMapTable.get(id).add(Unicode, glyf);
  }
},
set: function(id, Unicode, glyf) {
  if (this.glyfMapTable.has(id)) {
    this.glyfMapTable.get(id).set(Unicode, glyf);
  } else {
    this.glyfMapTable.set(id, createMap());
    this.glyfMapTable.get(id).set(Unicode, glyf);
  }
},
has: function(id, Unicode) {
  if (this.glyfMapTable.has(id)) {
    return this.glyfMapTable.get(id).has(Unicode);
  }
  return false;
},
getOneFontGlyfs: function(fontid) {
  var GlyfsList = new Array();
  if (!this.glyfMapTable.has(fontid)) {
    return GlyfsList;
  }
  var gmap = this.glyfMapTable.get(fontid);
  if (typeof gmap.DictId !== 'undefined') {
    return gmap.values();
  }
  gmap.forEach(function(val, key, map){
    GlyfsList.push(val);
  });
  return GlyfsList;
}
};
var glyfInfoMap = new GlyfMapTable();
