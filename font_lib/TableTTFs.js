var Err = new Object({
number : 0,
msg :""
});

var TableTTFs = new Object({
Id : 121,
FontName: "",
OS2Table: new Uint8Array(),
HeadTable: new Uint8Array(),
HheaTable: new Uint8Array(),
HmtxTable: new Uint8Array(),
MaxpTable: new Uint8Array(),
NameTable: new Uint8Array(),
PostTable: new Uint8Array(),
Cvt_Table: new Uint8Array(),
FpgmTable: new Uint8Array(),
PrepTable: new Uint8Array(),
GaspTable: new Uint8Array(),
HorizAdvX: new Uint8Array(),
FontFace: "",
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
});

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
