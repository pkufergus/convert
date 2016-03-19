
var GlyfModule = (function(){
  function Module() {
  }
  Module.getXMin = function(glyf) {
    return glyf[2] << 8|glyf[3];
  }
  Module.getYMin = function(glyf) {
    return glyf[4] << 8|glyf[5];
  }
  Module.getXMax = function(glyf) {
    return glyf[6] << 8|glyf[7];
  }
  Module.getYMax = function(glyf) {
    return glyf[8] << 8|glyf[9];
  }
  return Module;
}());
