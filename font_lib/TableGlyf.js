
var GlyfModule = (function(){
  function Module() {
  }

  Module.getXMin = function(glyf) {
    var n = glyf[2] << 8|glyf[3];
    return uint16toSignedInt(n);
  }
  Module.getYMin = function(glyf) {
    var n = glyf[4] << 8|glyf[5];
    return uint16toSignedInt(n);
  }
  Module.getXMax = function(glyf) {
    var n = glyf[6] << 8|glyf[7];
    return uint16toSignedInt(n);
  }
  Module.getYMax = function(glyf) {
    var n = glyf[8] << 8|glyf[9];
    return uint16toSignedInt(n);
  }
  return Module;
}());
