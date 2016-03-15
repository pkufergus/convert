var TableTTFs = new Object({
Id : 0,
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
