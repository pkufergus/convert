var HheaModule = (function(){
  function Module() {
  }
  var tableSize = 36;
  Module.createHheaTable = function() {
    var HheaArray = new Uint8Array(tableSize);
    return HheaArray;
  }
  return Module;
}());
