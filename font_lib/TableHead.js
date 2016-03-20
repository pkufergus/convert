var HeadModule = (function(){
  function Module() {
    this.xMin = 0;
    this.yMin = 0;
    this.xMax = 0;
    this.yMax = 0;
  }
  var tableSize = 54;
  var xMin = 0;
  var yMin = 0;
  var xMax = 0;
  var yMax = 0;
  Module.createHeadTable = function(glyfsList, glyfsTotalSize, HeadTable) {
    var HeadArray = new Uint8Array(tableSize);
    var HeadDataView = new DataView(HeadArray.buffer);

		for (n in glyfsList) {
      item = glyfsList[n];
			if (item.GlyfTable == null) {
				continue;
      }
			xMin = Math.min(xMin, GlyfModule.getXMin(item.GlyfTable));
			yMin = Math.min(yMin, GlyfModule.getYMin(item.GlyfTable));
			xMax = Math.max(xMax, GlyfModule.getXMax(item.GlyfTable));
			yMax = Math.max(yMax, GlyfModule.getYMax(item.GlyfTable));
		}
    var offset = 0;

    this.xMin = xMin;
    this.yMin = yMin;
    this.xMax = xMax;
    this.yMax = yMax;
    HeadArray.set(HeadTable.slice(0,36));
    offset += 36;
    offset = DataViewWrite2(HeadDataView, offset, xMin);
    offset = DataViewWrite2(HeadDataView, offset, yMin);
    offset = DataViewWrite2(HeadDataView, offset, xMax);
    offset = DataViewWrite2(HeadDataView, offset, yMax);
    HeadArray.set(HeadTable.slice(44,50), offset);
    offset = 50;
    offset = DataViewWrite2(HeadDataView, offset, glyfsTotalSize < 0x20000 ? 0 : 1);
    offset = DataViewWrite2(HeadDataView, offset, 0);
		return HeadArray;
	}
  Module.getyMin = function() {
    return this.yMin;
  }
  Module.getyMax = function() {
    return this.yMax;
  }
  return Module;
}());
