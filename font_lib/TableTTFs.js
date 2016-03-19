var Err = new Object({
number : 0,
msg :""
});

var TableTTFs = new Object({
Id : 121,
FontName: "",
OS2Table: new Object(),
HeadTable: new Object(),
HheaTable: new Object(),
HmtxTable: new Object(),
MaxpTable: new Object(),
NameTable: new Object(),
PostTable: new Object(),
Cvt_Table: new Object(),
FpgmTable: new Object(),
PrepTable: new Object(),
GaspTable: new Object(),
HorizAdvX: new Object(),
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
  this.GlyfTable = new Object();
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
