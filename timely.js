window.onload = function () {
    var objs = {};
    objs = yzkgetElementsByClass("youziku");
    var accessKey = "";
    var fontid = 0;
    for (var i in objs) {
        var obj = objs[i];
        accessKey = obj.className.trim().split(" ")[0].split("-")[1];
        FontProcessModule.getInitFontInfo(accessKey);

        obj.onkeyup = function () {
            var foid = this.attributes['fontid'].nodeValue;
            var ataccessKey = this.attributes['accessKey'].nodeValue;
            var fid = parseInt(foid);
            var fonts = this.value;

            var unicodes = new Array();
            for (var n in fonts) {
                unicodes.push(fonts.charCodeAt(n));
            }
            FontProcessModule.getGlyfs(fid, unicodes, ataccessKey);

        }
    }
}
//function buffer2url_woff(buffer) {
//    return URL.createObjectURL(new Blob([buffer], { type: 'application/font-woff' }));
//}

function yzkgetElementsByClass(classN) {
    var elements = [];
    var listElm = document.getElementsByTagName('input');

    for (var i = 0; i < listElm.length; i++) {

        if (listElm[i].className === 'undefined') {
            continue;
        }
        if (hasClass(listElm[i].className, classN))
            elements.push(listElm[i]);
    }
    return elements;
}
function hasClass(a, sub) {
    if (a.indexOf(sub) >= 0) {
        return true;
    }
    return false;
}

function objectToUint8Array(obj) {
    var len = 0;
    for (var n in obj) {
        if (obj.hasOwnProperty(n)) {
            len++;
        }
    }
    var arr = new Uint8Array(len);
    var i = 0;
    for (var n in obj) {
        if (obj.hasOwnProperty(n)) {
            arr[i] = obj[n];
            i++;
        }
    }
    return arr;
}

var BASE64Module = (function () {
    function Module() {
    }
    var lookup = []
    var revLookup = []
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

    function base64_init() {
        var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        for (var i = 0, len = code.length; i < len; ++i) {
            lookup[i] = code[i]
            revLookup[code.charCodeAt(i)] = i
        }

        revLookup['-'.charCodeAt(0)] = 62
        revLookup['_'.charCodeAt(0)] = 63
    }

    base64_init();

    Module.toByteArray = function (b64) {
        if (b64 == null) {
            return new Array();
        }
        var i, j, l, tmp, placeHolders, arr;
        var len = b64.length;

        if (len % 4 > 0) {
            throw new Error('Invalid string. Length must be a multiple of 4')
        }

        // the number of equal signs (place holders)
        // if there are two placeholders, than the two characters before it
        // represent one byte
        // if there is only one, then the three characters before it represent 2 bytes
        // this is just a cheap hack to not do indexOf twice
        placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0

        // base64 is 4/3 + up to two characters of the original data
        arr = new Arr(len * 3 / 4 - placeHolders)

        // if there are placeholders, only get up to the last complete 4 chars
        l = placeHolders > 0 ? len - 4 : len

        var L = 0

        for (i = 0, j = 0; i < l; i += 4, j += 3) {
            tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
            arr[L++] = (tmp >> 16) & 0xFF
            arr[L++] = (tmp >> 8) & 0xFF
            arr[L++] = tmp & 0xFF
        }

        if (placeHolders === 2) {
            tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
            arr[L++] = tmp & 0xFF
        } else if (placeHolders === 1) {
            tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
            arr[L++] = (tmp >> 8) & 0xFF
            arr[L++] = tmp & 0xFF
        }

        return arr
    }

    function tripletToBase64(num) {
        return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }

    function encodeChunk(uint8, start, end) {
        var tmp
        var output = []
        for (var i = start; i < end; i += 3) {
            tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
            output.push(tripletToBase64(tmp))
        }
        return output.join('')
    }
    //Module.fromByteArray = function (raw) {
    //    var base64 = '';
    //    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    //    var bytes = new Uint8Array(raw);
    //    var byteLength = bytes.byteLength;
    //    var byteRemainder = byteLength % 3;
    //    var mainLength = byteLength - byteRemainder;
    //    var a, b, c, d;
    //    var chunk;

    //    // Main loop deals with bytes in chunks of 3
    //    for (var i = 0; i < mainLength; i = i + 3) {
    //        // Combine the three bytes into a single integer
    //        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    //        // Use bitmasks to extract 6-bit segments from the triplet
    //        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    //        b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
    //        c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
    //        d = chunk & 63; // 63 = 2^6 - 1
    //        // Convert the raw binary segments to the appropriate ASCII encoding
    //        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    //    }
    //    // Deal with the remaining bytes and padding
    //    if (byteRemainder == 1) {
    //        chunk = bytes[mainLength];
    //        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2;
    //        // Set the 4 least significant bits to zero
    //        b = (chunk & 3) << 4 // 3 = 2^2 - 1;
    //        base64 += encodings[a] + encodings[b] + '==';
    //    }
    //    else if (byteRemainder == 2) {
    //        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    //        a = (chunk & 16128) >> 8 // 16128 = (2^6 - 1) << 8;
    //        b = (chunk & 1008) >> 4 // 1008 = (2^6 - 1) << 4;
    //        // Set the 2 least significant bits to zero
    //        c = (chunk & 15) << 2 // 15 = 2^4 - 1;
    //        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    //    }
    //    return base64;
    //}
    return Module;
}());

function createXHR() {
    if (typeof XMLHttpRequest != "undefined") {
        return new XMLHttpRequest();
    } // end if
    else if (window.ActiveXObject) {
        var aVersions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0"];
        for (var i = 0; i < aVersions.length; ++i) {
            try {
                var oXHR = new ActiveXObject(aVersions[i]);
                return oXHR;
            } // end try
            catch (oError) {
                // do nothing
            } // end catch
        } // end for
    } // end else if
    throw new Error("XMLHttp object could not be created.")
} // end createXHR();

//function Println(msg) {
//    if (msg.indexOf('Notice:') == 0) {
//        //document.getElementById("process").innerHTML+=" "+msg+" <br>";
//        //console.log(msg);
//    } else {
//        //console.log(msg);
//    }
//}
//function Log(msg) {
//    //console.log(msg);
//}

function getFileName(o) {
    var pos = o.lastIndexOf("/");
    lastname = o.substring(pos + 1);
    //Log("pos =" + pos + " lastname = " + lastname);
    return lastname;
}

function readUrlBinary(filepath, obj) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "/" + filepath, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (oEvent) {
        var arrayBuffer = oReq.response; // Note: not oReq.responseText
        if (arrayBuffer) {
            var byteArray = new Uint8Array(arrayBuffer);
            lastname = getFileName(filepath);
            obj.SetValueByFilename(lastname, byteArray);
            //Log("load filepath : " + filepath + " len=" + byteArray.length);
        }
    };

    oReq.send(null);
}

function readUrlText(filepath, obj) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", "/" + filepath, true);
    oReq.responseType = "text";

    oReq.onload = function (oEvent) {
        var content = oReq.responseText; // Note: not oReq.responseText
        if (content) {
            lastname = getFileName(filepath);
            obj.SetValueByFilename(lastname, content);
            //Log("load filepath : " + filepath + " = " + content + " len=" + content.length);
        }
    };

    oReq.send(null);
}

function DataViewWrite1(dataView, offset, val) {
    dataView.setUint8(offset, val);
    return offset + 1;
}
function DataViewWrite2(dataView, offset, val) {
    dataView.setUint16(offset, val);
    return offset + 2;
}
function DataViewWrite4(dataView, offset, val) {
    dataView.setUint32(offset, val);
    return offset + 4;
}

//function getUint16_Array(array) {
//    var view = new DataView(array.buffer);
//    return view.getUint16(0);
//}

//function getUint16_Array(array, offset) {
//    var view = new DataView(array.buffer);
//    return view.getUint16(offset);
//}

function getUint32_Array(array) {
    var view = new DataView(array.buffer);
    return view.getUint32(0);
}

function getUint32_Array(array, offset) {
    var view = new DataView(array.buffer);
    return view.getUint32(offset);
}

function deepCopyUint8Array(srcArray, begin, end) {
    var destArray;
    var size = end - begin;
    if (size <= 0) {
        return new Uint8Array();
    }
    destArray = new Uint8Array(size);

    for (var i = begin; i < end && i < srcArray.length; i++) {
        destArray[i - begin] = srcArray[i];
    }
    return destArray;
}

var SIGNMASK = 0x8000;
var SIGNBITS = 0xFFFF0000;
function uint16toSignedInt(n) {
    if (n & SIGNMASK) {
        n = n | SIGNBITS;
    }
    return n;
}

function uint8Fill(arr, len, val) {
    for (var i = 0; i < len; i++) {
        arr[i] = val;
    }
}
function Dictionary() {
    return {
        "DictId": "vdtDict",
        "mkeys": new Array(),
        "mvalues": new Array(),
        "getCount": function () {
            return (this.mkeys.length);
        },
        "values": function () {
            return (this.mvalues);
        },
        "keys": function () {
            return (this.mkeys);
        },
        /**
        Determine if dictionary contains a key
        @param key Key to check for
        @return True if key is found, otherwise false
        */
        "hasKey": function (key) {
            return (this.mkeys.indexOf(key) >= 0);
        },
        "has": function (key) {
            return (this.mkeys.indexOf(key) >= 0);
        },
        /**
        Add a key-value pair to the dictionary
        @param key Key to add
        @param value Value to add
        @return True if successful, false otherwise
        */
        "add": function (key, value) {
            if (!this.hasKey(key)) {
                this.mkeys.push(key);
                this.mvalues.push(value);
                return true;
            }
            return false; // key already exists
        },
        /**
        Look up a value in the dictionary by its key
        @param key Key of value to look up
        @return If the key exists, the the paired value is returned,
            otherwise null is returned
        */
        "get": function (key) {
            if (this.hasKey(key)) {
                return this.mvalues[this.mkeys.indexOf(key)];
            }
            else {
                return null;
            }
        },
        "set": function (key, value) {
            if (this.hasKey(key)) {
                this.mvalues[this.mkeys.indexOf(key)] = value;
            }
            else {
                this.mkeys.push(key);
                this.mvalues.push(value);
            }
        },
        /**
        Remove a key-value pair by its key
        @param key Key of key-value pair to remove
        @return If successful, the value paired with the given key is 
            returned, otherwise null.
        */
        "remove": function (key) {
            if (this.hasKey(key)) {
                var t = this.mkeys.indexOf(key);
                var u = this.mvalues[t];
                this.mkeys.splice(t, 1);
                this.mvalues.splice(t, 1);
                return u;
            }
            return null;
        },
        /**
        Counts the number of keys paired with the given value
        @param value Value to match to keys
        @return The number of keys associated with the value if
            any are found, otherwise -1
        */
        "countKeys": function (value) {
            if (this.mvalues.indexOf(value) >= 0) {
                kc = 0;
                for (i = 0; i < this.mvalues.length; i++) {
                    kc += (this.mvalues[i] == value) ? 1 : 0;
                }
                return kc;
            }
            return -1;
        }
    }
}

var TABLE0 = {
    FORMAT: 0,
    LENGTH: 2,
    LANGUAGE: 4,
    DATA_OFFSET: 6
};

var TABLE4 = {
    FORMAT: 0,
    LENGTH: 2,
    LANGUAGE: 4,
    SegCountX2: 6,
    SearchRange: 8,
    EntrySelector: 10,
    RangeShift: 12,
    EndCode: 14
};

var CmapModule = (function () {
    function Module() {
    }

    var Seg1BytesBound = 0xFF;
    var Seg2BytesBound = 0xFFFF;
    var Seg4BytesBound = 0xFFFFFFFF;

    function Segment() {
        this.start = 0;
        this.end = 0;
        this.delta = 0;
    }
    Segment.prototype = {
        toString: function () {
            return "rang =<" + this.start + " " + this.end + ">" + "delta=" + this.delta + " ";
        }
    }

    function encodeDelta(delta) {
        return delta > 0x7FFF ? delta - 0x10000 : (delta < -0x7FFF ? delta + 0x10000 : delta);
    }

    function getSegments(glyfsList, bound) {
        var segments = new Array();
        var delta = 0;
        var prevCode = -1;
        var prevDelta = -1;
        var segment = new Segment();
        var prevEndCode = 0;

        for (n in glyfsList) {
            var Unicode = glyfsList[n].Unicode;
            if (Unicode < 0 || Unicode > bound) {
                break;
            }
            if (prevCode < 0) {
                segment.start = Unicode;
            } else {
                if (Unicode != prevCode + 1) {
                    segment.end = prevCode;
                    delta = prevEndCode - segment.start + prevDelta + 1;
                    segment.delta = encodeDelta(delta);
                    prevEndCode = segment.end;
                    prevDelta = delta;
                    segments.push(segment);
                    segment = new Segment();
                    segment.start = Unicode;
                }
            }
            prevCode = Unicode;
        }
        if (prevCode > 0) {
            segment.end = prevCode;
            delta = prevEndCode - segment.start + prevDelta + 1;
            segment.delta = encodeDelta(delta);
            segments.push(segment);
        }
        return segments;
    }
    //function showSegments(segs) {
    //    for (n in segs) {
    //        Println("n=" + n + " : " + segs[n].toString());
    //    }
    //}
    //function showArray(arr) {
    //    for (n in arr) {
    //        Println("n=" + n + ":" + arr[n]);
    //    }
    //}
    //function showUnit16Array(arr) {
    //    var view = new DataView(arr.buffer);
    //    for (i = 0; i < arr.length; i += 2) {
    //        Println("n=" + i + ":" + view.getUint16(i));
    //    }
    //}
    function createSubTable0(glyfsList) {
        var table0 = new Uint8Array(262);
        var table0DataView = new DataView(table0.buffer);
        table0DataView.setUint16(TABLE0.FORMAT, 0); // format
        table0DataView.setUint16(TABLE0.LENGTH, 262); // length
        table0DataView.setUint16(TABLE0.LANGUAGE, 0); // language

        // Array of unicodes 0..255
        var count = glyfsList.length > 255 ? 255 : glyfsList.length;
        var j = 0;
        var offset = TABLE0.DATA_OFFSET;
        for (i = 0; i < 256; i++) {
            if (j >= count || count <= 0) {
                break;
            }
            if (i < glyfsList[j].Unicode) {
                table0DataView.setUint8(offset, 0);
            } else if (i == glyfsList[j].Unicode) {
                table0DataView.setUint8(offset, j);
                j++;
            }
            offset += 1;
        }
        return table0;
    }
    function getBaseLog(x, y) {
        return Math.log(y) / Math.log(x);
    }

    function createSubTable4(glyfsList, segments2bytes) {
        var bufSize = 24; // subtable 4 header and required array elements
        bufSize += segments2bytes.length * 8; // subtable 4 segments
        var table4 = new Uint8Array(bufSize);
        var table4DataView = new DataView(table4.buffer);

        table4DataView.setUint16(TABLE4.FORMAT, 4); // format
        table4DataView.setUint16(TABLE4.LENGTH, bufSize);// length
        table4DataView.setUint16(TABLE4.LANGUAGE, 0) // language
        var segCount = segments2bytes.length + 1;
        table4DataView.setUint16(TABLE4.SegCountX2, (segCount * 2)); // segCountX2
        var maxExponent = Math.floor(getBaseLog(2,segCount));
        var searchRange = 2 * Math.pow(2, maxExponent);
        table4DataView.setUint16(TABLE4.SearchRange, searchRange); // searchRange
        table4DataView.setUint16(TABLE4.EntrySelector, maxExponent); // entrySelector
        table4DataView.setUint16(TABLE4.RangeShift, (2 * segCount - searchRange)); // rangeShift

        var offset = TABLE4.EndCode;
        for (n in segments2bytes) {
            table4DataView.setUint16(offset, segments2bytes[n].end);
            offset += 2;
        }
        table4DataView.setUint16(offset, Seg2BytesBound); //endCountArray should be finished with 0xFFFF
        offset += 2;
        table4DataView.setUint16(offset, 0);
        offset += 2;
        for (n in segments2bytes) {
            table4DataView.setUint16(offset, segments2bytes[n].start);
            offset += 2;
        }
        table4DataView.setUint16(offset, Seg2BytesBound); //startCountArray should be finished with 0xFFFF
        offset += 2;
        for (n in segments2bytes) {
            table4DataView.setUint16(offset, segments2bytes[n].delta);
            offset += 2;
        }
        table4DataView.setUint16(offset, 1); // idDeltaArray should be finished with 1
        offset += 2;
        for (n in segments2bytes) {
            table4DataView.setUint16(offset, 0);
            offset += 2;
        }
        table4DataView.setUint16(offset, 0); // idDeltaArray should be finished with 1
        offset += 2;
        return table4;
    }

    function createSubTable12(segments4bytes) {
        var bufSize = 16; // subtable 12 header
        var segsLength = segments4bytes != null ? segments4bytes.length : 0;
        bufSize += segsLength * 12; // subtable 12 segments
        var table12 = new Uint8Array(bufSize); //fixed buffer size
        var table12DataView = new DataView(table12.buffer);

        table12DataView.setUint16(0, 12); // format
        table12DataView.setUint16(2, 0);  // reserved
        table12DataView.setUint32(4, bufSize); // length
        table12DataView.setUint32(8, 0); // language
        table12DataView.setUint32(12, segsLength); // nGroups
        var startGlyphCode = 0;
        var offset = 16;
        for (n in segments4bytes) {
            table12DataView.setUint32(offset, segments4bytes[n].start); // startCharCode
            offset += 4;
            table12DataView.setUint32(offset, segments4bytes[n].end); // endCharCode
            offset += 4;
            table12DataView.setUint32(offset, startGlyphCode); // startGlyphCode
            offset += 4;
            startGlyphCode += (segments4bytes[n].end - segments4bytes[n].start + 1);
        }
        return table12;
    }

    function writeSubTableHeader(dataView, startOffset, platformID, encodingID, subtableOffset) {
        dataView.setUint16(startOffset, platformID);
        dataView.setUint16(startOffset + 2, encodingID);
        dataView.setUint32(startOffset + 4, subtableOffset);
    }

    Module.createCMapTable = function (glyfsList) {
        var cmapArray = new Uint8Array();
        hasGLyphsOver2Bytes = false;
        //we will always have subtable 4
        var segments2bytes = getSegments(glyfsList, Seg2BytesBound); //get segments for unicodes < 0xFFFF if found unicodes >= 0xFF
        // We need subtable 12 only if found unicodes with > 2 bytes.
        if (typeof (glyfsList.length) === 'undefined' || glyfsList.length <= 0) {
            //Log("glyfsList exception");
            return cmapArray.buffer;
        }
        if (glyfsList[glyfsList.length - 1].Unicode > Seg2BytesBound) {
            hasGLyphsOver2Bytes = true;
        }
        //Println("hasGLyphsOver2Bytes = " + hasGLyphsOver2Bytes);
        var segments4bytes = hasGLyphsOver2Bytes ? getSegments(glyfsList, Seg4BytesBound) : null; //get segments for all icodes
        //Println("segments2bytes len = " + segments2bytes.length);
        //Println("segments4bytes len = " + (segments4bytes == null ? -1 : segments4bytes.length));

        //showSegments(segments2bytes);
        //showSegments(segments4bytes);
        // Create subtables first.
        var subTable0 = createSubTable0(glyfsList); // subtable 0
        //Println("subtable len=" + subTable0.length);
        //showArray(subTable0);
        var subTable4 = createSubTable4(glyfsList, segments2bytes); // subtable 4
        //Println("subtable4 len=" + subTable4.length);
        //showUnit16Array(subTable4);
        var subTable12 = segments4bytes != null ? createSubTable12(segments4bytes) : null; // subtable 12

        var subTableOffset = 4 + (hasGLyphsOver2Bytes ? 32 : 24);
        var bufSize = subTableOffset + subTable0.length + subTable4.length + (subTable12 != null ? subTable12.length : 0);

        cmapArray = new Uint8Array(bufSize);
        cmapDataView = new DataView(cmapArray.buffer);
        cmapDataView.setUint16(0, 0);  //version
        cmapDataView.setUint16(2, hasGLyphsOver2Bytes ? 4 : 3); //count
        // Create subtable headers. Subtables must be sorted by platformID, encodingID
        writeSubTableHeader(cmapDataView, 4, 0, 3, subTableOffset);
        writeSubTableHeader(cmapDataView, 12, 1, 0, subTableOffset + subTable4.length);
        writeSubTableHeader(cmapDataView, 20, 3, 1, subTableOffset);
        if (subTable12 != null) {
            writeSubTableHeader(cmapDataView, 28, 3, 10, subTableOffset + subTable0.length + subTable4.length); // subtable 12
        }
        // Write tables, order of table seem to be magic, it is taken from TTX tool
        cmapArray.set(subTable4, subTableOffset);
        cmapArray.set(subTable0, subTableOffset + subTable4.length);
        if (subTable12 != null) {
            cmapArray.set(subTable12, subTableOffset + subTable4.length + subTable0.length);
        }
        return cmapArray;
    }
    return Module;
}());

var LocaModule = (function () {
    function Module() {
    }

    function countTableSize(glyfsList, isShortFormat) {
        var result = (glyfsList.length + 1) * (isShortFormat ? 2 : 4); // by glyph count + tail
        return result;
    }

    Module.createLocaTable = function (glyfsList, glyfsTotalSize) {
        var isShortFormat = glyfsTotalSize < 0x20000;
        var tableSize = countTableSize(glyfsList, isShortFormat);
        var locaArray = new Uint8Array(tableSize);
        var locaDataView = new DataView(locaArray.buffer);

        var location = 0;
        var offset = 0;
        for (n in glyfsList) {
            if (isShortFormat) {
                locaDataView.setUint16(offset, location);
                offset += 2;
                if (glyfsList[n] != null && typeof (glyfsList[n].GlyfTable.length) !== 'undefined') {
                    location += glyfsList[n].GlyfTable.length / 2; // actual location must be divided to 2 in short format
                }
            } else {
                locaDataView.setUint32(offset, location);
                offset += 4;
                if (glyfsList[n] != null && typeof (glyfsList[n].GlyfTable.length) !== 'undefined') {
                    location += glyfsList[n].GlyfTable.length; ////actual location is stored as is in long format 
                }
            }
        }
        if (isShortFormat) {
            locaDataView.setUint16(offset, location);
            offset += 2;
        } else {
            locaDataView.setUint32(offset, location);
            offset += 4;
        }
        return locaArray;
    }
    return Module;
}());

var HheaModule = (function () {
    function Module() {
    }
    var tableSize = 36;

    Module.createHheaTable0 = function () {
        var HheaArray = new Uint8Array(tableSize);
        return HheaArray;
    }
    Module.createHheaTable5 = function (HheaArray, HheaTable, glyfsList, yMax, yMin) {
        var HheaDataView = new DataView(HheaArray.buffer);
        HheaArray.set(HheaTable.subarray(0, 4));
        var offset = 4;
        offset = DataViewWrite2(HheaDataView, offset, yMax);
        //yMin = 0xff6b;
        offset = DataViewWrite2(HheaDataView, offset, yMin);
        HheaArray.set(HheaTable.subarray(8, HheaArray.length - 2), offset);
        offset = HheaArray.length - 2;
        offset = DataViewWrite2(HheaDataView, offset, glyfsList.length);
        return HheaArray;
    }
    return Module;
}());

var HeadModule = (function () {
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
    Module.init = function () {
        xMin = 0;
        yMin = 0;
        xMax = 0;
        yMax = 0;
        this.xMin = 0;
        this.yMin = 0;
        this.xMax = 0;
        this.yMax = 0;
    }
    Module.createHeadTable = function (glyfsList, glyfsTotalSize, HeadTable) {
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
        HeadArray.set(HeadTable.subarray(0, 36));
        offset += 36;
        offset = DataViewWrite2(HeadDataView, offset, xMin);
        offset = DataViewWrite2(HeadDataView, offset, yMin);
        offset = DataViewWrite2(HeadDataView, offset, xMax);
        offset = DataViewWrite2(HeadDataView, offset, yMax);
        HeadArray.set(HeadTable.subarray(44, 50), offset);
        offset = 50;
        offset = DataViewWrite2(HeadDataView, offset, glyfsTotalSize < 0x20000 ? 0 : 1);
        offset = DataViewWrite2(HeadDataView, offset, 0);
        return HeadArray;
    }
    Module.getyMin = function () {
        return this.yMin;
    }
    Module.getyMax = function () {
        return this.yMax;
    }
    return Module;
}());


var GlyfModule = (function () {
    function Module() {
    }

    Module.getXMin = function (glyf) {
        var n = glyf[2] << 8 | glyf[3];
        return uint16toSignedInt(n);
    }
    Module.getYMin = function (glyf) {
        var n = glyf[4] << 8 | glyf[5];
        return uint16toSignedInt(n);
    }
    Module.getXMax = function (glyf) {
        var n = glyf[6] << 8 | glyf[7];
        return uint16toSignedInt(n);
    }
    Module.getYMax = function (glyf) {
        var n = glyf[8] << 8 | glyf[9];
        return uint16toSignedInt(n);
    }
    return Module;
}());

var Os2Module = (function () {
    function Module() {
    }
    var tableSize = 86;

    function getFirstCharIndex(glyfsList) {
        var min = 0xFFFF;
        for (n in glyfsList) {
            item = glyfsList[n];
            if (item.Unicode != 0 && item.Unicode < min) {
                min = item.Unicode;
                break;
            }
        }
        return min;
    }

    function getLastCharIndex(glyfsList) {
        var max = 0;
        var len = glyfsList.length;
        for (i = len - 1; i >= 0; i--) {
            item = glyfsList[i];
            if (item.Unicode <= 0xFFFF && item.Unicode > max) {
                max = item.Unicode;
                break;
            }
        }
        return max;
    }

    Module.createOs2Table = function (glyfsList, OS2Table, yMax, yMin) {
        var Os2Array = new Uint8Array(tableSize);
        var Os2DataView = new DataView(Os2Array.buffer);

        Os2Array.set(OS2Table.subarray(0, 64));
        var offset = 64;
        offset = DataViewWrite2(Os2DataView, offset, getFirstCharIndex(glyfsList));
        offset = DataViewWrite2(Os2DataView, offset, getLastCharIndex(glyfsList));
        Os2Array.set(OS2Table.subarray(68, 86), offset);
        offset = 74;
        offset = DataViewWrite2(Os2DataView, offset, yMax < 0 ? -yMax : yMax);
        offset = DataViewWrite2(Os2DataView, offset, yMin < 0 ? -yMin : yMin);
        Os2Array.set(OS2Table.subarray(78, 86), offset);
        
        return Os2Array;
    }
    return Module;
}());

var HmtxModule = (function () {
    function Module() {
    }
    var tableSize = 0;

    Module.createHmtxTable = function (glyfsList, HmtxTable, HorizAdvX) {
        tableSize = (glyfsList.length) * 4
        var HmtxArray = new Uint8Array(tableSize);
        var HmtxDataView = new DataView(HmtxArray.buffer);
        var offset = 0;
        var item;
        for (n in glyfsList) {
            item = glyfsList[n];
            if (item == null) {
                continue;
            }
            if (item.HorizAdvX < 0) {
                offset = DataViewWrite2(HmtxDataView, offset, HorizAdvX);
            } else {
                offset = DataViewWrite2(HmtxDataView, offset, item.HorizAdvX);
            }
            offset = DataViewWrite2(HmtxDataView, offset, item.LSB);
        }
        return HmtxArray;
    }
    return Module;
}());

var PostModule = (function () {
    function Module() {
    }
    var tableHeaderSize = 32;

    var nameMap = createMap();
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
        var result = 36;
        result += glyfsList.length * 2;
        for (n in names) {
            //name = names[n];
            result += names[n].length;
        }
        return result;
    }

    function pascalString(glyf) {
        var len = 0;
        var bytes = null;
        var start = 0;
        var unicode = "";
        if (nameMap.has(glyf.Unicode)) {
            unicode = nameMap.get(glyf.Unicode);
            len = unicode.length < 256 ? unicode.length : 255;
            bytes = new Uint8Array(len + 1);
            bytes[0] = len;
            start = 1;
        } else {
            len = 7;
            bytes = new Uint8Array(len + 1);
            bytes[0] = len;
            bytes[1] = "u".charCodeAt();
            bytes[2] = "n".charCodeAt();
            bytes[3] = "i".charCodeAt();
            var u = glyf.Unicode;
            var str = u.toString(16);
            var unicode = str;
            for (i = 0; i < 4 - str.length; i++) {
                unicode = "0" + unicode;
            }
            start = 4;
        }
        for (var i = 0; i < bytes.length - start; i++) {
            ch = unicode[i].charCodeAt();
            bytes[start + i] = ch < 128 ? ch : 95;
        }
        return bytes;
    }

    Module.createPostTable = function (glyfsList, PostTable) {
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
        offset = DataViewWrite2(PostDataView, offset, glyfsList.length);
        // Array of glyph name indexes
        var index = 258; // first index of custom glyph name, it is calculated as glyph name index + 258
        for (n in glyfsList) {
            item = glyfsList[n];
            if (item.Unicode != 0) {
                offset = DataViewWrite2(PostDataView, offset, index);
                index += 1;
            } else {
                offset = DataViewWrite2(PostDataView, offset, 0);
                index += 1;
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

var MaxpModule = (function () {
    function Module() {
    }
    var tableSize = 32;
    Module.createMaxpTable = function (glyfsList, MaxpTable) {
        var MaxpArray = new Uint8Array(tableSize);
        var MaxpDataView = new DataView(MaxpArray.buffer);


        var offset = 0;
        offset = DataViewWrite4(MaxpDataView, offset, 0x10000); // version
        offset = DataViewWrite2(MaxpDataView, offset, glyfsList.length); // numGlyph
        MaxpArray.set(MaxpTable.subarray(6, tableSize), offset);

        return MaxpArray;
    }
    return Module;
}());

var Err = new Object({
    number: 0,
    msg: ""
});

function TableTTFsClass() {
    this.Id = 1,
    this.FontName = "",
    this.OS2Table = new Uint8Array(),
    this.HeadTable = new Uint8Array(),
    this.HheaTable = new Uint8Array(),
    this.HmtxTable = new Uint8Array(),
    this.MaxpTable = new Uint8Array(),
    this.NameTable = new Uint8Array(),
    this.PostTable = new Uint8Array(),
    this.Cvt_Table = new Uint8Array(),
    this.FpgmTable = new Uint8Array(),
    this.PrepTable = new Uint8Array(),
    this.GaspTable = new Uint8Array(),
    this.HorizAdvX = 9,
    this.FontFace = ""
}

TableTTFsClass.prototype = {
    SetValueByFilename: function (filename, obj) {
        if (filename.endsWith(".txt")) {
            filename = filename.substring(0, filename.lastIndexOf(".txt"));
        }
        switch (filename) {
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
    SetValueByFilename: function (filename, obj) {
        if (filename.endsWith(".txt")) {
            filename = filename.substring(0, filename.lastIndexOf(".txt"));
        }
        switch (filename) {
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
function GlyfMapTable() {
    this.glyfMapTable = createMap();
}

GlyfMapTable.prototype = {
    add: function (id, Unicode, glyf) {
        if (this.glyfMapTable.has(id)) {
            return this.glyfMapTable.get(id).add(Unicode, glyf);
        } else {
            this.glyfMapTable.add(id, createMap());
            return this.glyfMapTable.get(id).add(Unicode, glyf);
        }
    },
    set: function (id, Unicode, glyf) {
        if (this.glyfMapTable.has(id)) {
            this.glyfMapTable.get(id).set(Unicode, glyf);
        } else {
            this.glyfMapTable.set(id, createMap());
            this.glyfMapTable.get(id).set(Unicode, glyf);
        }
    },
    has: function (id, Unicode) {
        if (this.glyfMapTable.has(id)) {
            return this.glyfMapTable.get(id).has(Unicode);
        }
        return false;
    },
    getOneFontGlyfs: function (fontid) {
        var GlyfsList = new Array();
        if (!this.glyfMapTable.has(fontid)) {
            return GlyfsList;
        }
        var gmap = this.glyfMapTable.get(fontid);
        if (typeof gmap.DictId !== 'undefined') {
            return gmap.values();
        }
        gmap.forEach(function (val, key, map) {
            GlyfsList.push(val);
        });
        return GlyfsList;
    }
};

//var Ttf2WoffModule = (function () {

//    function Module() {
//    }
//    function zlib_decompress(buffer) {
//        var inflate = new pako.Inflate();
//        inflate.push(new Uint8Array(buffer), true);
//        if (inflate.err) {
//            throw new Error(inflate.err);
//        }
//        return inflate.result;
//    }

//    function zlib_compress(buffer) {
//        var compressdata = new pako2.deflate(buffer);
//        return compressdata;
//    }

//    function ulong(t) {
//        /*jshint bitwise:false*/
//        t &= 0xffffffff;
//        if (t < 0) {
//            t += 0x100000000;
//        }
//        return t;
//    }

//    function longAlign(n) {
//        /*jshint bitwise:false*/
//        return (n + 3) & ~3;
//    }

//    function calc_checksum(buf) {
//        var sum = 0;
//        var nlongs = parseInt(buf.length / 4);

//        for (var i = 0; i < nlongs; ++i) {
//            var t = getUint32_Array(buf, i * 4);

//            sum = ulong(sum + t);
//        }
//        return sum;
//    }

//    var WOFF_OFFSET = {
//        MAGIC: 0,
//        FLAVOR: 4,
//        SIZE: 8,
//        NUM_TABLES: 12,
//        RESERVED: 14,
//        SFNT_SIZE: 16,
//        VERSION_MAJ: 20,
//        VERSION_MIN: 22,
//        META_OFFSET: 24,
//        META_LENGTH: 28,
//        META_ORIG_LENGTH: 32,
//        PRIV_OFFSET: 36,
//        PRIV_LENGTH: 40
//    };

//    var WOFF_ENTRY_OFFSET = {
//        TAG: 0,
//        OFFSET: 4,
//        COMPR_LENGTH: 8,
//        LENGTH: 12,
//        CHECKSUM: 16
//    };

//    var SFNT_OFFSET = {
//        TAG: 0,
//        CHECKSUM: 4,
//        OFFSET: 8,
//        LENGTH: 12
//    };

//    var SFNT_ENTRY_OFFSET = {
//        FLAVOR: 0,
//        VERSION_MAJ: 4,
//        VERSION_MIN: 6,
//        CHECKSUM_ADJUSTMENT: 8
//    };

//    var MAGIC = {
//        WOFF: 0x774F4646,
//        CHECKSUM_ADJUSTMENT: 0xB1B0AFBA
//    };

//    var SIZEOF = {
//        WOFF_HEADER: 44,
//        WOFF_ENTRY: 20,
//        SFNT_HEADER: 12,
//        SFNT_TABLE_ENTRY: 16
//    };

//    Module.ttf2woff = function (arrayIn, errorCode) {
//        var bufferIn = arrayIn.buffer;
//        var dataViewIn = new DataView(bufferIn);

//        var version = {
//            maj: 0,
//            min: 1
//        };
//        var numTables = dataViewIn.getUint16(4);
//        var flavor = 0x10000;

//        var woffHeader = new Uint8Array(SIZEOF.WOFF_HEADER);
//        var woffHeaderDataView = new DataView(woffHeader.buffer);

//        woffHeaderDataView.setUint32(WOFF_OFFSET.MAGIC, MAGIC.WOFF);
//        woffHeaderDataView.setUint16(WOFF_OFFSET.NUM_TABLES, numTables);
//        woffHeaderDataView.setUint16(WOFF_OFFSET.RESERVED, 0);
//        woffHeaderDataView.setUint32(WOFF_OFFSET.SFNT_SIZE, 0);
//        woffHeaderDataView.setUint32(WOFF_OFFSET.META_OFFSET, 0);
//        woffHeaderDataView.setUint32(WOFF_OFFSET.META_LENGTH, 0);
//        woffHeaderDataView.setUint32(WOFF_OFFSET.META_ORIG_LENGTH, 0);
//        woffHeaderDataView.setUint32(WOFF_OFFSET.PRIV_OFFSET, 0);
//        woffHeaderDataView.setUint32(WOFF_OFFSET.PRIV_LENGTH, 0);

//        var entries = [];

//        var i, tableEntry;

//        for (i = 0; i < numTables; ++i) {
//            var data = deepCopyUint8Array(arrayIn, SIZEOF.SFNT_HEADER + i * SIZEOF.SFNT_TABLE_ENTRY, SIZEOF.SFNT_HEADER + i * SIZEOF.SFNT_TABLE_ENTRY + SIZEOF.SFNT_TABLE_ENTRY);
//            var dataDataView = new DataView(data.buffer);

//            tableEntry = {
//                Tag: new Uint8Array(data.buffer, SFNT_OFFSET.TAG, 4),
//                checkSum: dataDataView.getUint32(SFNT_OFFSET.CHECKSUM),
//                Offset: dataDataView.getUint32(SFNT_OFFSET.OFFSET),
//                Length: dataDataView.getUint32(SFNT_OFFSET.LENGTH)
//            };
//            entries.push(tableEntry);
//        }
//        //entries = entries.sort(function (a, b) {
//        //  var aStr = a.Tag.toString();
//        //  var bStr = b.Tag.toString();

//        //  return aStr === bStr ? 0 : aStr < bStr ? -1 : 1;
//        //});
//        entries = entries.sort(function (a, b) {
//            var aVal = a.Offset;
//            var bVal = b.Offset;

//            return aVal == bVal ? 0 : aVal < bVal ? -1 : 1;
//        });
//        var offset = SIZEOF.WOFF_HEADER + numTables * SIZEOF.WOFF_ENTRY;
//        var woffSize = offset;
//        var sfntSize = SIZEOF.SFNT_HEADER + numTables * SIZEOF.SFNT_TABLE_ENTRY;

//        var woffTableArray = new Uint8Array(numTables * SIZEOF.WOFF_ENTRY);
//        var woffTableDataView = new DataView(woffTableArray.buffer);

//        var ttfTableEntry;
//        for (i = 0; i < numTables; ++i) {
//            ttfTableEntry = entries[i];

//            if (String.fromCharCode.apply(null, ttfTableEntry.Tag) !== 'head') {
//                var algntable = deepCopyUint8Array(arrayIn, ttfTableEntry.Offset, ttfTableEntry.Offset + longAlign(ttfTableEntry.Length));

//                if (calc_checksum(algntable) !== ttfTableEntry.checkSum) {
//                    console.error("Checksum error in =[%s]", String.fromCharCode.apply(null, ttfTableEntry.Tag));
//                }
//            }

//            woffTableDataView.setUint32(i * SIZEOF.WOFF_ENTRY + WOFF_ENTRY_OFFSET.TAG, getUint32_Array(ttfTableEntry.Tag));
//            woffTableDataView.setUint32(i * SIZEOF.WOFF_ENTRY + WOFF_ENTRY_OFFSET.LENGTH, ttfTableEntry.Length);
//            woffTableDataView.setUint32(i * SIZEOF.WOFF_ENTRY + WOFF_ENTRY_OFFSET.CHECKSUM, ttfTableEntry.checkSum);
//            sfntSize += longAlign(ttfTableEntry.Length);
//        }

//        var sfntOffset = SIZEOF.SFNT_HEADER + entries.length * SIZEOF.SFNT_TABLE_ENTRY;
//        var headerDataArray = deepCopyUint8Array(arrayIn, 0, SIZEOF.SFNT_HEADER);
//        var csum = calc_checksum(headerDataArray);

//        for (i = 0; i < entries.length; ++i) {
//            ttfTableEntry = entries[i];

//            var b = new Uint8Array(SIZEOF.SFNT_TABLE_ENTRY);
//            var bDataView = new DataView(b.buffer);

//            bDataView.setUint32(SFNT_OFFSET.TAG, getUint32_Array(ttfTableEntry.Tag));
//            bDataView.setUint32(SFNT_OFFSET.CHECKSUM, ttfTableEntry.checkSum);
//            bDataView.setUint32(SFNT_OFFSET.OFFSET, sfntOffset);
//            bDataView.setUint32(SFNT_OFFSET.LENGTH, ttfTableEntry.Length);
//            sfntOffset += longAlign(ttfTableEntry.Length);
//            csum += calc_checksum(b);
//            csum += ttfTableEntry.checkSum;
//        }
//        var checksumAdjustment = ulong(MAGIC.CHECKSUM_ADJUSTMENT - csum);

//        var len, woffDataChains = [];

//        for (i = 0; i < entries.length; ++i) {
//            ttfTableEntry = entries[i];

//            var sfntData = deepCopyUint8Array(arrayIn, ttfTableEntry.Offset, ttfTableEntry.Offset + ttfTableEntry.Length);
//            var sfntDataView = new DataView(sfntData.buffer);

//            if (String.fromCharCode.apply(null, tableEntry.Tag) === 'head') {
//                version.maj = sfntDataView.getUint16(SFNT_ENTRY_OFFSET.VERSION_MAJ);
//                version.min = sfntDataView.getUint16(SFNT_ENTRY_OFFSET.VERSION_MIN);
//                flavor = sfntDataView.getUint32(SFNT_ENTRY_OFFSET.FLAVOR);
//                sfntDataView.setUint32(SFNT_ENTRY_OFFSET.CHECKSUM_ADJUSTMENT, checksumAdjustment);
//            }

//            var res = zlib_compress(sfntData);

//            var compLength;

//            // We should use compression only if it really save space (standard requirement).
//            // Also, data should be aligned to long (with zeros?).
//            compLength = Math.min(res.length, sfntData.length);
//            len = longAlign(compLength);

//            var woffDataArray = new Uint8Array(len);

//            uint8Fill(woffDataArray, woffDataArray.length, 0);

//            if (res.length >= sfntData.length) {
//                woffDataArray.set(sfntData);
//            } else {
//                woffDataArray.set(res);
//            }

//            woffTableDataView.setUint32(i * SIZEOF.WOFF_ENTRY + WOFF_ENTRY_OFFSET.OFFSET, offset);

//            offset += woffDataArray.length;
//            woffSize += woffDataArray.length;

//            woffTableDataView.setUint32(i * SIZEOF.WOFF_ENTRY + WOFF_ENTRY_OFFSET.COMPR_LENGTH, compLength);

//            woffDataChains.push(woffDataArray);
//        }

//        woffHeaderDataView.setUint32(WOFF_OFFSET.SIZE, woffSize);
//        woffHeaderDataView.setUint32(WOFF_OFFSET.SFNT_SIZE, sfntSize);
//        woffHeaderDataView.setUint16(WOFF_OFFSET.VERSION_MAJ, version.maj);
//        woffHeaderDataView.setUint16(WOFF_OFFSET.VERSION_MIN, version.min);
//        woffHeaderDataView.setUint32(WOFF_OFFSET.FLAVOR, flavor);

//        var outArray = new Uint8Array(woffSize);

//        outArray.set(woffHeader);
//        outArray.set(woffTableArray, woffHeader.length);

//        var woffOffset = woffHeader.length + woffTableArray.length;
//        for (i = 0; i < woffDataChains.length; i++) {
//            outArray.set(woffDataChains[i], woffOffset);
//            woffOffset += woffDataChains[i].length;
//        }
//        errorCode.status = 0;
//        return outArray;
//    }
//    return Module;
//}());

var TTFMAGIC = {
    VERSION: 0x10000,
    CHECKSUM_ADJUSTMENT: 0xB1B0AFBA
};

var SIZEOF = {
    TTF_HEADER: 12,
    TTF_TABLE_ENTRY: 16
};

var TAG = {
    OS2: 0x4f532f32,
    CMAP: 0x636d6170,
    CVT_: 0x63767420,
    FPGM: 0x6670676d,
    GASP: 0x67617370,
    GLYF: 0x676c7966,
    HEAD: 0x68656164,
    HHEA: 0x68686561,
    HMTX: 0x686d7478,
    LOCA: 0x6c6f6361,
    MAXP: 0x6d617870,
    NAME: 0x6e616d65,
    POST: 0x706f7374,
    PREP: 0x70726570
}

var TAG10 = {
    OS2: 0x4f532f32,
    CMAP: 0x636d6170,
    GLYF: 0x676c7966,
    HEAD: 0x68656164,
    HHEA: 0x68686561,
    HMTX: 0x686d7478,
    LOCA: 0x6c6f6361,
    MAXP: 0x6d617870,
    NAME: 0x6e616d65,
    POST: 0x706f7374
}

function ulong(t) {
    /*jshint bitwise:false*/
    t &= 0xffffffff;
    if (t < 0) {
        t += 0x100000000;
    }
    return t;
}
function getUint(t) {
    /*jshint bitwise:false*/
    var r = 0;
    r = (t & 0xffffffff);
    if (r < 0) {
        t = r + 0x100000000;
    } else {
        t = r;
    }
    return t;
}
function calc_checksum(arr) {
    var sum = 0;
    var nlongs = parseInt(arr.length / 4);
    var arrDataView = new DataView(arr.buffer);

    for (var i = 0; i < nlongs; ++i) {
        var t = arrDataView.getUint32(i * 4);

        sum = ulong(sum + t);
    }
    var leftBytes = arr.length - nlongs * 4;
    if (leftBytes > 0) {
        var leftRes = 0;
        for (i = 0; i < 4; i++) {
            /*jshint bitwise:false*/
            leftRes = (leftRes << 8) + ((i < leftBytes) ? arrDataView.getUint8(nlongs * 4 + i) : 0);
        }
        sum += leftRes;
    }
    return sum;
}

function createTableEntryList(TableTTFs, glyfsList, offset, glyfsTotalSize, Err) {
    //Println("createTableEntryList start ... ");
    ttfTableEntryList = new Array();
    var cmapArray = CmapModule.createCMapTable(glyfsList);
    var locaArray = LocaModule.createLocaTable(glyfsList, glyfsTotalSize);
    var glyfsArray = new Uint8Array(glyfsTotalSize);

    var tmp_offset = 0;
    for (n in glyfsList) {
        if (glyfsList[n] != null && typeof (glyfsList[n].GlyfTable) != 'undefined') {
            glyfsArray.set(glyfsList[n].GlyfTable, tmp_offset);
            tmp_offset += glyfsList[n].GlyfTable.length;
        }
    }

    //hhea
    var hhea = new TableEntry();
    hhea.m_Tag = TAG.HHEA;
    hhea.m_DataBytes = HheaModule.createHheaTable0();
    hhea.m_Offset = offset;
    hhea.m_Length = hhea.m_DataBytes.length;
    hhea.m_CorLength = hhea.m_Length + (4 - hhea.m_Length % 4) % 4;
    offset += hhea.m_CorLength;
    ttfTableEntryList.push(hhea);

    //head
    var head = new TableEntry();
    head.m_Tag = TAG.HEAD;
    HeadModule.init();
    head.m_DataBytes = HeadModule.createHeadTable(glyfsList, glyfsTotalSize, TableTTFs.HeadTable);
    head.m_CheckSum = calc_checksum(head.m_DataBytes);
    head.m_Offset = offset;
    head.m_Length = head.m_DataBytes.length;
    head.m_CorLength = head.m_Length + (4 - head.m_Length % 4) % 4;
    offset += head.m_CorLength;
    ttfTableEntryList.push(head);

    //maxp
    var maxp = new TableEntry();
    maxp.m_Tag = TAG.MAXP;
    maxp.m_DataBytes = MaxpModule.createMaxpTable(glyfsList, TableTTFs.MaxpTable);
    maxp.m_CheckSum = calc_checksum(maxp.m_DataBytes);
    maxp.m_Offset = offset;
    maxp.m_Length = maxp.m_DataBytes.length;
    maxp.m_CorLength = maxp.m_Length + (4 - maxp.m_Length % 4) % 4;
    offset += maxp.m_CorLength;
    ttfTableEntryList.push(maxp);

    //OS/2
    var OS2 = new TableEntry();
    OS2.m_Tag = TAG.OS2;
    OS2.m_DataBytes = Os2Module.createOs2Table(glyfsList, TableTTFs.OS2Table, HeadModule.yMax, HeadModule.yMin);
    OS2.m_CheckSum = calc_checksum(OS2.m_DataBytes);
    OS2.m_Offset = offset;
    OS2.m_Length = OS2.m_DataBytes.length;
    OS2.m_CorLength = OS2.m_Length + (4 - OS2.m_Length % 4) % 4;
    offset += OS2.m_CorLength;
    ttfTableEntryList.push(OS2);
    //hhea的数据依赖于head和os/2
    hhea.m_DataBytes = HheaModule.createHheaTable5(hhea.m_DataBytes, TableTTFs.HheaTable, glyfsList, HeadModule.yMax, HeadModule.yMin);
    hhea.m_CheckSum = calc_checksum(hhea.m_DataBytes);

    //hmtx
    var hmtx = new TableEntry();
    hmtx.m_Tag = TAG.HMTX;
    hmtx.m_DataBytes = HmtxModule.createHmtxTable(glyfsList, TableTTFs.HmtxTable, TableTTFs.HorizAdvX);
    hmtx.m_CheckSum = calc_checksum(hmtx.m_DataBytes);
    hmtx.m_Offset = offset;
    hmtx.m_Length = hmtx.m_DataBytes.length;
    hmtx.m_CorLength = hmtx.m_Length + (4 - hmtx.m_Length % 4) % 4;
    offset += hmtx.m_CorLength;
    ttfTableEntryList.push(hmtx);

    //cmap
    var cmap = new TableEntry();
    cmap.m_Tag = TAG.CMAP;
    cmap.m_DataBytes = cmapArray;
    cmap.m_CheckSum = calc_checksum(cmapArray);
    cmap.m_Offset = offset;
    cmap.m_Length = cmapArray.length;
    cmap.m_CorLength = cmap.m_Length + (4 - cmap.m_Length % 4) % 4;
    offset += cmap.m_CorLength;
    ttfTableEntryList.push(cmap);

    //loca
    var loca = new TableEntry();
    loca.m_Tag = TAG.LOCA;
    loca.m_DataBytes = locaArray;
    loca.m_CheckSum = calc_checksum(locaArray);
    loca.m_Offset = offset;
    loca.m_Length = locaArray.length;
    loca.m_CorLength = loca.m_Length + (4 - loca.m_Length % 4) % 4;
    offset += loca.m_CorLength;
    ttfTableEntryList.push(loca);

    //glyf
    var glyf = new TableEntry();
    glyf.m_Tag = TAG.GLYF;
    glyf.m_DataBytes = glyfsArray;
    glyf.m_CheckSum = calc_checksum(glyfsArray);
    glyf.m_Offset = offset;
    glyf.m_Length = glyfsArray.length;
    glyf.m_CorLength = glyf.m_Length + (4 - glyf.m_Length % 4) % 4;
    offset += glyf.m_CorLength;
    ttfTableEntryList.push(glyf);

    //name
    var name = new TableEntry();
    name.m_Tag = TAG.NAME;
    name.m_DataBytes = new Uint8Array(TableTTFs.NameTable);
    name.m_CheckSum = calc_checksum(name.m_DataBytes);
    name.m_Offset = offset;
    name.m_Length = TableTTFs.NameTable.length;
    name.m_CorLength = name.m_Length + (4 - name.m_Length % 4) % 4;
    offset += name.m_CorLength;
    ttfTableEntryList.push(name);

    //post
    var post = new TableEntry();
    post.m_Tag = TAG.POST;
    post.m_DataBytes = PostModule.createPostTable(glyfsList, TableTTFs.PostTable);
    post.m_CheckSum = calc_checksum(post.m_DataBytes);
    post.m_Offset = offset;
    post.m_Length = post.m_DataBytes.length;
    post.m_CorLength = post.m_Length + (4 - post.m_Length % 4) % 4;
    offset += post.m_CorLength;
    ttfTableEntryList.push(post);

    //9-24日添加-保存灰度色
    if (TableTTFs.FpgmTable != null && TableTTFs.FpgmTable.length > 0) {

        //cvt_
        var cvt_ = new TableEntry();
        cvt_.m_Tag = TAG.CVT_;
        cvt_.m_DataBytes = new Uint8Array(TableTTFs.Cvt_Table);
        cvt_.m_CheckSum = calc_checksum(cvt_.m_DataBytes);
        cvt_.m_Offset = offset;
        cvt_.m_Length = TableTTFs.Cvt_Table.length;
        cvt_.m_CorLength = cvt_.m_Length + (4 - cvt_.m_Length % 4) % 4;
        offset += cvt_.m_CorLength;
        ttfTableEntryList.push(cvt_);

        //fpgm
        var fpgm = new TableEntry();
        fpgm.m_Tag = TAG.FPGM;
        fpgm.m_DataBytes = new Uint8Array(TableTTFs.FpgmTable);
        fpgm.m_CheckSum = calc_checksum(fpgm.m_DataBytes);
        fpgm.m_Offset = offset;
        fpgm.m_Length = TableTTFs.FpgmTable.length;
        fpgm.m_CorLength = fpgm.m_Length + (4 - fpgm.m_Length % 4) % 4;
        offset += fpgm.m_CorLength;
        ttfTableEntryList.push(fpgm);

        //prep
        var prep = new TableEntry();
        prep.m_Tag = TAG.PREP;
        prep.m_DataBytes = new Uint8Array(TableTTFs.PrepTable);
        prep.m_CheckSum = calc_checksum(prep.m_DataBytes);
        prep.m_Offset = offset;
        prep.m_Length = TableTTFs.PrepTable.length;
        prep.m_CorLength = prep.m_Length + (4 - prep.m_Length % 4) % 4;
        offset += prep.m_CorLength;
        ttfTableEntryList.push(prep);

        //gasp
        if (TableTTFs.GaspTable == null || TableTTFs.GaspTable.length == 0)   //如果Gasp为空，则添加一个默认的
            TableTTFs.GaspTable = new Uint8Array([0, 1, 0, 1, 255, 255, 0, 10]);
        var gasp = new TableEntry();
        gasp.m_Tag = TAG.GASP;
        gasp.m_DataBytes = new Uint8Array(TableTTFs.GaspTable);
        gasp.m_CheckSum = calc_checksum(gasp.m_DataBytes);
        gasp.m_Offset = offset;
        gasp.m_Length = TableTTFs.GaspTable.length;
        gasp.m_CorLength = gasp.m_Length + (4 - gasp.m_Length % 4) % 4;
        offset += gasp.m_CorLength;
        ttfTableEntryList.push(gasp);
    }

    //Println("ttf table size=" + ttfTableEntryList.length);
    //Println("createTableEntryList end!");
    return ttfTableEntryList;
}

function generateTTF(TableTTFs, glyfsList, Err) {
    //Println("SIZEOF SFNT_TABLE_ENTRY=" + SIZEOF.TTF_TABLE_ENTRY);
    //Println("glyfsList length=" + glyfsList.length);
    glyfsList = glyfsList.sort(function (a, b) {
        var aVal = parseInt(a.Unicode);
        var bVal = parseInt(b.Unicode);
        return aVal == bVal ? 0 : aVal < bVal ? -1 : 1;
    }
    );
    var glyfsTotalSize = 0;
    for (x in glyfsList) {
        if (typeof (glyfsList[x].GlyfTable.length) !== 'undefined' && glyfsList[x].GlyfTable.length >= 0) {
            glyfsTotalSize += glyfsList[x].GlyfTable.length;
        }
    }
    //Println("glyfsTotalSize= " + glyfsTotalSize);
    if (glyfsTotalSize <= 0) {
        //Println("glyfsTotalSize= " + glyfsTotalSize);
        //Println("parameter error");
        return;
    }
    tablesum = 10;
    if (typeof (TableTTFs.FpgmTable.length) == "undefined" || TableTTFs.FpgmTable.length <= 0) {
        tablesum = 10;
    } else {
        tablesum = 14;
    }
    //Println("tablesum= " + tablesum);
    var headerSize = SIZEOF.TTF_HEADER + SIZEOF.TTF_TABLE_ENTRY * tablesum;
    var bufSize = headerSize;
    var offset = headerSize;

    ttfTableEntryList = new Array();
    ttfTableEntryList = createTableEntryList(TableTTFs, glyfsList, offset, glyfsTotalSize, Err);
    for (x in ttfTableEntryList) {
        bufSize += ttfTableEntryList[x].m_CorLength;
    }

    //create TTF buffer
    var ttfArray = new Uint8Array(bufSize);
    var ttfDataView = new DataView(ttfArray.buffer);

    //special constants
    var entrySelector = Math.floor(Math.log(10) / Math.log(2));
    var searchRange = Math.pow(2, entrySelector) * 16;
    var rangeShift = tablesum * 16 - searchRange;
    var headOffset = 0;

    offset = 0;
    offset = DataViewWrite4(ttfDataView, offset, TTFMAGIC.VERSION);
    offset = DataViewWrite2(ttfDataView, offset, tablesum);
    offset = DataViewWrite2(ttfDataView, offset, searchRange);
    offset = DataViewWrite2(ttfDataView, offset, entrySelector);
    offset = DataViewWrite2(ttfDataView, offset, rangeShift);

    var tableOrder = TAG;
    if (tablesum == 14) {
        tableOrder = TAG;
    } else {
        tableOrder = TAG10;
    }
    var i = 0;
    for (n in tableOrder) {
        for (t in ttfTableEntryList) {
            item = ttfTableEntryList[t];
            if (item.m_Tag == tableOrder[n]) {
                offset = DataViewWrite4(ttfDataView, offset, item.m_Tag);
                offset = DataViewWrite4(ttfDataView, offset, item.m_CheckSum);
                offset = DataViewWrite4(ttfDataView, offset, item.m_Offset);
                offset = DataViewWrite4(ttfDataView, offset, item.m_Length);
                break;
            }
        }
    }

    for (t in ttfTableEntryList) {
        item = ttfTableEntryList[t];
        if (item.m_Tag == TAG.HEAD) {
            headOffset = offset;
        }
        ttfArray.set(item.m_DataBytes, offset);
        offset += item.m_DataBytes.length;
        for (i = item.m_Length; i < item.m_CorLength; i++) {
            offset = DataViewWrite1(ttfDataView, offset, 0);
        }
    }
    checkSumAdjustment = getUint((TTFMAGIC.CHECKSUM_ADJUSTMENT - calc_checksum(ttfArray)));
    // Write font checksum (corrected by magic value) into HEAD table
    DataViewWrite4(ttfDataView, headOffset + 8, checkSumAdjustment);

    //Println("bufSize= " + bufSize);
    return ttfArray;
}

var count_file = 1;
function generateTTFFile(TableTTFs, TableGlyfsList, Err) {
    var ttfArray = generateTTF(TableTTFs, TableGlyfsList, Err);
    return ttfArray;
    //var container = document.getElementById('fonts');
    //var link = container.insertBefore(document.createElement('a'), container.firstElementChild);
    //link.textContent = link.download = "test" + count_file + ".ttf";
    //link.href = buffer2url_woff(ttfArray);

    //var woffArray = Ttf2WoffModule.ttf2woff(ttfArray, Err);
    //container = document.getElementById('fonts');
    //link = container.insertBefore(document.createElement('a'), container.firstElementChild);
    //link.textContent = link.download = "test" + count_file + ".woff";
    //link.href = buffer2url_woff(woffArray);
    //count_file++;
    
    //return woffArray;
}

function readBlobAsDataURL(blob, callback, accesskey) {
    var a = new FileReader();
    a.onload = function (e) { callback(e.target.result); };
    a.readAsDataURL(blob);
}
//example:



function createfontface(accesskey, woffArray) {
    var blob = new Blob([woffArray], { type: 'application/font-woff' });
    readBlobAsDataURL(blob, function (basewoff) {
        var fontface = ".youziku-" + accesskey + "{ font-family:'yzk-" + accesskey + "' } @font-face { font-family:'yzk-" + accesskey + "'; src:url('" + basewoff + "') format('truetype'); }  ";
        var cssid = "yzk-" + accesskey;
        var stylelist = document.getElementsByName(cssid);
        if (stylelist.length > 0) {
            for (var i = 0; i < stylelist.length; i++) {
                document.getElementsByTagName("head")[0].removeChild(stylelist[i]);
            }
        }
        var t = document.createElement('style');
        t.setAttribute("type", "text/css");
        t.setAttribute("name", cssid);
        document.getElementsByTagName("head")[0].appendChild(t);
        if (t.styleSheet) {
            t.styleSheet.cssText = fontface;
        } else if (document.getBoxObjectFor) {
            t.innerHTML = fontface;
        } else {
            t.appendChild(document.createTextNode(fontface))
        }
    }, accesskey);


    //var basewoff = BASE64Module.fromByteArray(woffArray);
    //var fontface = ".youziku-" + accesskey + "{ font-family:'yzk-" + accesskey + "' } @font-face { font-family:'yzk-" + accesskey + "'; src:url('data:application/font-woff;base64," + basewoff + "') format('woff'); }  ";
    //var cssid = "yzk-" + accesskey;
    //var stylelist = document.getElementsByName(cssid);
    //if (stylelist.length > 0) {
    //    for (var i = 0; i < stylelist.length; i++) {
    //        document.getElementsByTagName("head")[0].removeChild(stylelist[i]);
    //    }
    //}
    //var t = document.createElement('style');
    //t.setAttribute("type", "text/css");
    //t.setAttribute("name", cssid);
    //document.getElementsByTagName("head")[0].appendChild(t);
    //if (t.styleSheet) {
    //    t.styleSheet.cssText = fontface;
    //} else if (document.getBoxObjectFor) {
    //    t.innerHTML = fontface;
    //} else {
    //    t.appendChild(document.createTextNode(fontface))
    //}

}
function chengfont(inputid, newaccessKey) {
    var objinput = document.getElementById(inputid);
    if (objinput) {
        if (hasClass(objinput.className, "youziku")) {
            var oldclass = objinput.className.trim().split(" ")[0];
            objinput.className = objinput.className.replace(oldclass, "youziku-" + newaccessKey);
            FontProcessModule.getInitFontInfo(newaccessKey);      
        }
    }
}

// ================= main =======================
var ttfInfoMap = createMap();
var glyfInfoMap = new GlyfMapTable();
var globalFontId = 0;

FontProcessModule = (function () {
    function Module() {
        
    }
    var InitFontInfoURL = "http://fs.youziku.com/font/GetFontInfo";
    var GlyfsURL = "http://fs.youziku.com/font/GetFontGlyfs";

    function submitData(URL, json, callback, key,accesskey) {
        var xhr = new createXHR();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status != 200 && xhr.status != 304) {
                    //Println('HTTP error ' + xhr.status);
                    return;
                }
                callback(xhr.responseText, true, key, accesskey);
            }
        }
        xhr.open('POST', URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.send(json);
    }

    function InitReq(accessKey) {
        this.accessKey = accessKey;
    }

    function GlyfsReq(fontid, unicodes) {
        this.Fontid = fontid;
        this.Unicodes = unicodes;
    }

    function processInit(json, isSave, accessKey) {
        var info = JSON.parse(json);
        //Println("Notice:" + info.Head.HeadTable);
        //Println("Notice:" + info.Head.OS2Table);
        var ttfInfo = new TableTTFsClass();
        var TableGlyfsList = new Array();

        var headInfo = info.Head;
        ttfInfo.Id = headInfo.FontId;
        ttfInfo.OS2Table = BASE64Module.toByteArray(headInfo.OS2Table);
        ttfInfo.HeadTable = BASE64Module.toByteArray(headInfo.HeadTable);
        ttfInfo.HheaTable = BASE64Module.toByteArray(headInfo.HheaTable);
        ttfInfo.HmtxTable = BASE64Module.toByteArray(headInfo.HmtxTable);
        ttfInfo.MaxpTable = BASE64Module.toByteArray(headInfo.MaxpTable);
        ttfInfo.NameTable = BASE64Module.toByteArray(headInfo.NameTable);
        ttfInfo.PostTable = BASE64Module.toByteArray(headInfo.PostTable);
        ttfInfo.Cvt_Table = BASE64Module.toByteArray(headInfo.Cvt_Table);
        ttfInfo.FpgmTable = BASE64Module.toByteArray(headInfo.FpgmTable);
        ttfInfo.PrepTable = BASE64Module.toByteArray(headInfo.PrepTable);
        ttfInfo.GaspTable = BASE64Module.toByteArray(headInfo.GaspTable);
        ttfInfo.HorizAdvX = headInfo.HorizAdvX;
        ttfInfo.FontFace = headInfo.FontFace;
        globalFontId = ttfInfo.Id;

        var glyfs = info.GlyfsList;
        for (var n in glyfs) {
            //Println("Notice:" + n + " " + glyfs[n].Unicode);
            //Println("Notice:" + n + " " + glyfs[n].GlyfTable);
            if (glyfs[n].Unicode == 0) {
                // continue;
            }
            var decode = BASE64Module.toByteArray(glyfs[n].GlyfTable);
            var glyf = new TableGlyfs();
            glyf.Id = glyfs[n].FontId;
            glyf.Unicode = glyfs[n].Unicode;
            glyf.HorizAdvX = glyfs[n].HorizAdvX;
            glyf.LSB = glyfs[n].LSB;
            glyf.GlyfTable = decode;
            TableGlyfsList.push(glyf);
            glyfInfoMap.set(glyf.Id, glyf.Unicode, glyf);
        }
        ttfInfoMap.set(ttfInfo.Id, ttfInfo);

        if (!isSave) {
          var fontId = ttfInfo.Id;
          var cacheJson = store.get("cachefont_"+fontId);
          if (cacheJson != null) {
            var cacheObjs = JSON.parse(cacheJson);
            for (var n in cacheObjs) {
              var cacheGlyf = cacheObjs[n];
              var glyf = new TableGlyfs();
              glyf.Id = cacheGlyf.Id;
              glyf.Unicode = cacheGlyf.Unicode;
              glyf.HorizAdvX = cacheGlyf.HorizAdvX;
              glyf.LSB = cacheGlyf.LSB;
              glyf.GlyfTable = objectToUint8Array(cacheGlyf.GlyfTable);
              glyfInfoMap.set(glyf.Id, glyf.Unicode, glyf);
            }
          }
        }
        if (isSave) {
            store.set(accessKey, json);
        }
        var objs = yzkgetElementsByClass(accessKey);
        for (var n in objs) {
            objs[n].setAttribute("fontid", "" + ttfInfo.Id);
            objs[n].setAttribute("accessKey", accessKey);
        }
        generateOneFont(ttfInfo.Id, accessKey);
        ////初始化完成以后再检测一下，有无新字
        var objs1 = yzkgetElementsByClass(accessKey);
        for (var input in objs1) {            
            var foid = objs[input].attributes['fontid'].nodeValue;
            var ataccessKey = objs[input].attributes['accessKey'].nodeValue;
            var fid = parseInt(foid);
            var fonts = objs[input].value;
            
            var unicodes = new Array();
            for (var n in fonts) {
                unicodes.push(fonts.charCodeAt(n));                
            }
            FontProcessModule.getGlyfs(fid, unicodes, ataccessKey);
        }
        
    }
    function processGlyfs(json, isSave, fontId, accessKey) {
        var glyfs = JSON.parse(json);
        var fontid = 0;
        for (var n in glyfs) {
            if (glyfs[n].Unicode == 0 || glyfs[n].GlyfTable == null) {
                continue;
            }

            var decode = BASE64Module.toByteArray(glyfs[n].GlyfTable);
            var glyf = new TableGlyfs();
            glyf.Id = glyfs[n].FontId;
            fontid = glyf.Id;
            glyf.Unicode = glyfs[n].Unicode;
            glyf.HorizAdvX = glyfs[n].HorizAdvX;
            glyf.LSB = glyfs[n].LSB;
            glyf.GlyfTable = decode;
            glyfInfoMap.set(glyf.Id, glyf.Unicode, glyf);
        }
        if (isSave) {
            store.set("cachefont_" + fontId, JSON.stringify(glyfInfoMap.getOneFontGlyfs(fontid)));
        }
        generateOneFont(fontid,accessKey);
    }


    function generateOneFont(fontid, accessKey) {
        if (fontid == 0) {
            return null;
        }
        var ttfInfo = ttfInfoMap.get(fontid);
        var glyfsList = glyfInfoMap.getOneFontGlyfs(fontid);

        var woffArray = generateTTFFile(ttfInfo, glyfsList, Err);
        createfontface(accessKey, woffArray);
        return woffArray;
    }
    Module.getInitFontInfo = function (accessKey) {
        var req = new InitReq(accessKey);
        var json = JSON.stringify(req);

        var initFontInfo = store.get(accessKey);
        if (initFontInfo == null) {
            submitData(InitFontInfoURL, json, processInit, accessKey);
        } else {
            processInit(initFontInfo, false, accessKey);
        }
    }
    Module.getGlyfs = function (fontid, unicodes, accessKey) {
        
        globalFontId = fontid;    
        var needGetUnicodes = new Array();

        for (var n in unicodes) {
            var u = unicodes[n];
            if (glyfInfoMap.has(globalFontId, u)) {
                continue;
            }
            needGetUnicodes.push(u);
        }
        if (needGetUnicodes.length <= 0) {
            return null;
        }
        var needGetUnicodes2 = new Array();
        var cacheJson = store.get("cachefont_" + globalFontId);
        if (cacheJson != null) {
            var cacheObjs = JSON.parse(cacheJson);
            var cacheMap = createMap();
            for (var n in cacheObjs) {
                cacheMap.set(cacheObjs[n].Unicode, cacheObjs[n]);
            }
            for (var n in needGetUnicodes) {
                var u = needGetUnicodes[n];
                if (cacheMap.has(u)) {
                    var glyf = new TableGlyfs();
                    var cacheGlyf = cacheMap.get(u);
                    glyf.Id = cacheGlyf.Id;
                    globalFontId = glyf.Id;
                    glyf.Unicode = cacheGlyf.Unicode;
                    glyf.HorizAdvX = cacheGlyf.HorizAdvX;
                    glyf.LSB = cacheGlyf.LSB;
                    glyf.GlyfTable = objectToUint8Array(cacheGlyf.GlyfTable);
                    glyfInfoMap.set(glyf.Id, glyf.Unicode, glyf);
                    continue;
                }
                needGetUnicodes2.push(u);
            }
        } else {
            needGetUnicodes2 = needGetUnicodes;
        }
        if (needGetUnicodes2.length <= 0) {
            return generateOneFont(globalFontId, accessKey);             
        }
        var req = new GlyfsReq(globalFontId, needGetUnicodes2);
        var json = JSON.stringify(req);
        submitData(GlyfsURL, json, processGlyfs, globalFontId, accessKey);
    }
    return Module;
}());

//=======================main end==================
///* pako 0.2.5 nodeca/pako */
//!function (e) { if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else { var f; "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.pako = e() } }(function () {
//    var define, module, exports; return (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); throw new Error("Cannot find module '" + o + "'") } var f = n[o] = { exports: {} }; t[o][0].call(f.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e) }, f, f.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++) s(r[o]); return s })({
//        1: [function (_dereq_, module, exports) {
//            'use strict';


//            var zlib_inflate = _dereq_('./zlib/inflate.js');
//            var utils = _dereq_('./utils/common');
//            var strings = _dereq_('./utils/strings');
//            var c = _dereq_('./zlib/constants');
//            var msg = _dereq_('./zlib/messages');
//            var zstream = _dereq_('./zlib/zstream');
//            var gzheader = _dereq_('./zlib/gzheader');


//            /**
//             * class Inflate
//             *
//             * Generic JS-style wrapper for zlib calls. If you don't need
//             * streaming behaviour - use more simple functions: [[inflate]]
//             * and [[inflateRaw]].
//             **/

//            /* internal
//             * inflate.chunks -> Array
//             *
//             * Chunks of output data, if [[Inflate#onData]] not overriden.
//             **/

//            /**
//             * Inflate.result -> Uint8Array|Array|String
//             *
//             * Uncompressed result, generated by default [[Inflate#onData]]
//             * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
//             * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
//             **/

//            /**
//             * Inflate.err -> Number
//             *
//             * Error code after inflate finished. 0 (Z_OK) on success.
//             * Should be checked if broken data possible.
//             **/

//            /**
//             * Inflate.msg -> String
//             *
//             * Error message, if [[Inflate.err]] != 0
//             **/


//            /**
//             * new Inflate(options)
//             * - options (Object): zlib inflate options.
//             *
//             * Creates new inflator instance with specified params. Throws exception
//             * on bad params. Supported options:
//             *
//             * - `windowBits`
//             *
//             * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
//             * for more information on these.
//             *
//             * Additional options, for internal needs:
//             *
//             * - `chunkSize` - size of generated data chunks (16K by default)
//             * - `raw` (Boolean) - do raw inflate
//             * - `to` (String) - if equal to 'string', then result will be converted
//             *   from utf8 to utf16 (javascript) string. When string output requested,
//             *   chunk length can differ from `chunkSize`, depending on content.
//             *
//             * By default, when no options set, autodetect deflate/gzip data format via
//             * wrapper header.
//             *
//             * ##### Example:
//             *
//             * ```javascript
//             * var pako = require('pako')
//             *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
//             *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
//             *
//             * var inflate = new pako.Inflate({ level: 3});
//             *
//             * inflate.push(chunk1, false);
//             * inflate.push(chunk2, true);  // true -> last chunk
//             *
//             * if (inflate.err) { throw new Error(inflate.err); }
//             *
//             * console.log(inflate.result);
//             * ```
//             **/
//            var Inflate = function (options) {

//                this.options = utils.assign({
//                    chunkSize: 16384,
//                    windowBits: 0,
//                    to: ''
//                }, options || {});

//                var opt = this.options;

//                // Force window size for `raw` data, if not set directly,
//                // because we have no header for autodetect.
//                if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
//                    opt.windowBits = -opt.windowBits;
//                    if (opt.windowBits === 0) { opt.windowBits = -15; }
//                }

//                // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
//                if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
//                    !(options && options.windowBits)) {
//                    opt.windowBits += 32;
//                }

//                // Gzip header has no info about windows size, we can do autodetect only
//                // for deflate. So, if window size not set, force it to max when gzip possible
//                if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
//                    // bit 3 (16) -> gzipped data
//                    // bit 4 (32) -> autodetect gzip/deflate
//                    if ((opt.windowBits & 15) === 0) {
//                        opt.windowBits |= 15;
//                    }
//                }

//                this.err = 0;      // error code, if happens (0 = Z_OK)
//                this.msg = '';     // error message
//                this.ended = false;  // used to avoid multiple onEnd() calls
//                this.chunks = [];     // chunks of compressed data

//                this.strm = new zstream();
//                this.strm.avail_out = 0;

//                var status = zlib_inflate.inflateInit2(
//                  this.strm,
//                  opt.windowBits
//                );

//                if (status !== c.Z_OK) {
//                    throw new Error(msg[status]);
//                }

//                this.header = new gzheader();

//                zlib_inflate.inflateGetHeader(this.strm, this.header);
//            };

//            /**
//             * Inflate#push(data[, mode]) -> Boolean
//             * - data (Uint8Array|Array|String): input data
//             * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
//             *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` meansh Z_FINISH.
//             *
//             * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
//             * new output chunks. Returns `true` on success. The last data block must have
//             * mode Z_FINISH (or `true`). That flush internal pending buffers and call
//             * [[Inflate#onEnd]].
//             *
//             * On fail call [[Inflate#onEnd]] with error code and return false.
//             *
//             * We strongly recommend to use `Uint8Array` on input for best speed (output
//             * format is detected automatically). Also, don't skip last param and always
//             * use the same type in your code (boolean or number). That will improve JS speed.
//             *
//             * For regular `Array`-s make sure all elements are [0..255].
//             *
//             * ##### Example
//             *
//             * ```javascript
//             * push(chunk, false); // push one of data chunks
//             * ...
//             * push(chunk, true);  // push last chunk
//             * ```
//             **/
//            Inflate.prototype.push = function (data, mode) {
//                var strm = this.strm;
//                var chunkSize = this.options.chunkSize;
//                var status, _mode;
//                var next_out_utf8, tail, utf8str;

//                if (this.ended) { return false; }
//                _mode = (mode === ~~mode) ? mode : ((mode === true) ? c.Z_FINISH : c.Z_NO_FLUSH);

//                // Convert data if needed
//                if (typeof data === 'string') {
//                    // Only binary strings can be decompressed on practice
//                    strm.input = strings.binstring2buf(data);
//                } else {
//                    strm.input = data;
//                }

//                strm.next_in = 0;
//                strm.avail_in = strm.input.length;

//                do {
//                    if (strm.avail_out === 0) {
//                        strm.output = new utils.Buf8(chunkSize);
//                        strm.next_out = 0;
//                        strm.avail_out = chunkSize;
//                    }

//                    status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);    /* no bad return value */

//                    if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
//                        this.onEnd(status);
//                        this.ended = true;
//                        return false;
//                    }

//                    if (strm.next_out) {
//                        if (strm.avail_out === 0 || status === c.Z_STREAM_END || (strm.avail_in === 0 && _mode === c.Z_FINISH)) {

//                            if (this.options.to === 'string') {

//                                next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

//                                tail = strm.next_out - next_out_utf8;
//                                utf8str = strings.buf2string(strm.output, next_out_utf8);

//                                // move tail
//                                strm.next_out = tail;
//                                strm.avail_out = chunkSize - tail;
//                                if (tail) { utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }

//                                this.onData(utf8str);

//                            } else {
//                                this.onData(utils.shrinkBuf(strm.output, strm.next_out));
//                            }
//                        }
//                    }
//                } while ((strm.avail_in > 0) && status !== c.Z_STREAM_END);

//                if (status === c.Z_STREAM_END) {
//                    _mode = c.Z_FINISH;
//                }
//                // Finalize on the last chunk.
//                if (_mode === c.Z_FINISH) {
//                    status = zlib_inflate.inflateEnd(this.strm);
//                    this.onEnd(status);
//                    this.ended = true;
//                    return status === c.Z_OK;
//                }

//                return true;
//            };


//            /**
//             * Inflate#onData(chunk) -> Void
//             * - chunk (Uint8Array|Array|String): ouput data. Type of array depends
//             *   on js engine support. When string output requested, each chunk
//             *   will be string.
//             *
//             * By default, stores data blocks in `chunks[]` property and glue
//             * those in `onEnd`. Override this handler, if you need another behaviour.
//             **/
//            Inflate.prototype.onData = function (chunk) {
//                this.chunks.push(chunk);
//            };


//            /**
//             * Inflate#onEnd(status) -> Void
//             * - status (Number): inflate status. 0 (Z_OK) on success,
//             *   other if not.
//             *
//             * Called once after you tell inflate that input stream complete
//             * or error happenned. By default - join collected chunks,
//             * free memory and fill `results` / `err` properties.
//             **/
//            Inflate.prototype.onEnd = function (status) {
//                // On success - join
//                if (status === c.Z_OK) {
//                    if (this.options.to === 'string') {
//                        // Glue & convert here, until we teach pako to send
//                        // utf8 alligned strings to onData
//                        this.result = this.chunks.join('');
//                    } else {
//                        this.result = utils.flattenChunks(this.chunks);
//                    }
//                }
//                this.chunks = [];
//                this.err = status;
//                this.msg = this.strm.msg;
//            };


//            /**
//             * inflate(data[, options]) -> Uint8Array|Array|String
//             * - data (Uint8Array|Array|String): input data to decompress.
//             * - options (Object): zlib inflate options.
//             *
//             * Decompress `data` with inflate/ungzip and `options`. Autodetect
//             * format via wrapper header by default. That's why we don't provide
//             * separate `ungzip` method.
//             *
//             * Supported options are:
//             *
//             * - windowBits
//             *
//             * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
//             * for more information.
//             *
//             * Sugar (options):
//             *
//             * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
//             *   negative windowBits implicitly.
//             * - `to` (String) - if equal to 'string', then result will be converted
//             *   from utf8 to utf16 (javascript) string. When string output requested,
//             *   chunk length can differ from `chunkSize`, depending on content.
//             *
//             *
//             * ##### Example:
//             *
//             * ```javascript
//             * var pako = require('pako')
//             *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
//             *   , output;
//             *
//             * try {
//             *   output = pako.inflate(input);
//             * } catch (err)
//             *   console.log(err);
//             * }
//             * ```
//             **/
//            function inflate(input, options) {
//                var inflator = new Inflate(options);

//                inflator.push(input, true);

//                // That will never happens, if you don't cheat with options :)
//                if (inflator.err) { throw inflator.msg; }

//                return inflator.result;
//            }


//            /**
//             * inflateRaw(data[, options]) -> Uint8Array|Array|String
//             * - data (Uint8Array|Array|String): input data to decompress.
//             * - options (Object): zlib inflate options.
//             *
//             * The same as [[inflate]], but creates raw data, without wrapper
//             * (header and adler32 crc).
//             **/
//            function inflateRaw(input, options) {
//                options = options || {};
//                options.raw = true;
//                return inflate(input, options);
//            }


//            /**
//             * ungzip(data[, options]) -> Uint8Array|Array|String
//             * - data (Uint8Array|Array|String): input data to decompress.
//             * - options (Object): zlib inflate options.
//             *
//             * Just shortcut to [[inflate]], because it autodetects format
//             * by header.content. Done for convenience.
//             **/


//            exports.Inflate = Inflate;
//            exports.inflate = inflate;
//            exports.inflateRaw = inflateRaw;
//            exports.ungzip = inflate;

//        }, { "./utils/common": 2, "./utils/strings": 3, "./zlib/constants": 5, "./zlib/gzheader": 7, "./zlib/inflate.js": 9, "./zlib/messages": 11, "./zlib/zstream": 12 }], 2: [function (_dereq_, module, exports) {
//            'use strict';


//            var TYPED_OK = (typeof Uint8Array !== 'undefined') &&
//                            (typeof Uint16Array !== 'undefined') &&
//                            (typeof Int32Array !== 'undefined');


//            exports.assign = function (obj /*from1, from2, from3, ...*/) {
//                var sources = Array.prototype.slice.call(arguments, 1);
//                while (sources.length) {
//                    var source = sources.shift();
//                    if (!source) { continue; }

//                    if (typeof (source) !== 'object') {
//                        throw new TypeError(source + 'must be non-object');
//                    }

//                    for (var p in source) {
//                        if (source.hasOwnProperty(p)) {
//                            obj[p] = source[p];
//                        }
//                    }
//                }

//                return obj;
//            };


//            // reduce buffer size, avoiding mem copy
//            exports.shrinkBuf = function (buf, size) {
//                if (buf.length === size) { return buf; }
//                if (buf.subarray) { return buf.subarray(0, size); }
//                buf.length = size;
//                return buf;
//            };


//            var fnTyped = {
//                arraySet: function (dest, src, src_offs, len, dest_offs) {
//                    if (src.subarray && dest.subarray) {
//                        dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
//                        return;
//                    }
//                    // Fallback to ordinary array
//                    for (var i = 0; i < len; i++) {
//                        dest[dest_offs + i] = src[src_offs + i];
//                    }
//                },
//                // Join array of chunks to single array.
//                flattenChunks: function (chunks) {
//                    var i, l, len, pos, chunk, result;

//                    // calculate data length
//                    len = 0;
//                    for (i = 0, l = chunks.length; i < l; i++) {
//                        len += chunks[i].length;
//                    }

//                    // join chunks
//                    result = new Uint8Array(len);
//                    pos = 0;
//                    for (i = 0, l = chunks.length; i < l; i++) {
//                        chunk = chunks[i];
//                        result.set(chunk, pos);
//                        pos += chunk.length;
//                    }

//                    return result;
//                }
//            };

//            var fnUntyped = {
//                arraySet: function (dest, src, src_offs, len, dest_offs) {
//                    for (var i = 0; i < len; i++) {
//                        dest[dest_offs + i] = src[src_offs + i];
//                    }
//                },
//                // Join array of chunks to single array.
//                flattenChunks: function (chunks) {
//                    return [].concat.apply([], chunks);
//                }
//            };


//            // Enable/Disable typed arrays use, for testing
//            //
//            exports.setTyped = function (on) {
//                if (on) {
//                    exports.Buf8 = Uint8Array;
//                    exports.Buf16 = Uint16Array;
//                    exports.Buf32 = Int32Array;
//                    exports.assign(exports, fnTyped);
//                } else {
//                    exports.Buf8 = Array;
//                    exports.Buf16 = Array;
//                    exports.Buf32 = Array;
//                    exports.assign(exports, fnUntyped);
//                }
//            };

//            exports.setTyped(TYPED_OK);
//        }, {}], 3: [function (_dereq_, module, exports) {
//            // String encode/decode helpers
//            'use strict';


//            var utils = _dereq_('./common');


//            // Quick check if we can use fast array to bin string conversion
//            //
//            // - apply(Array) can fail on Android 2.2
//            // - apply(Uint8Array) can fail on iOS 5.1 Safary
//            //
//            var STR_APPLY_OK = true;
//            var STR_APPLY_UIA_OK = true;

//            try { String.fromCharCode.apply(null, [0]); } catch (__) { STR_APPLY_OK = false; }
//            try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


//            // Table with utf8 lengths (calculated by first byte of sequence)
//            // Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
//            // because max possible codepoint is 0x10ffff
//            var _utf8len = new utils.Buf8(256);
//            for (var i = 0; i < 256; i++) {
//                _utf8len[i] = (i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1);
//            }
//            _utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


//            // convert string to array (typed, when possible)
//            exports.string2buf = function (str) {
//                var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

//                // count binary size
//                for (m_pos = 0; m_pos < str_len; m_pos++) {
//                    c = str.charCodeAt(m_pos);
//                    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
//                        c2 = str.charCodeAt(m_pos + 1);
//                        if ((c2 & 0xfc00) === 0xdc00) {
//                            c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
//                            m_pos++;
//                        }
//                    }
//                    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
//                }

//                // allocate buffer
//                buf = new utils.Buf8(buf_len);

//                // convert
//                for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
//                    c = str.charCodeAt(m_pos);
//                    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
//                        c2 = str.charCodeAt(m_pos + 1);
//                        if ((c2 & 0xfc00) === 0xdc00) {
//                            c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
//                            m_pos++;
//                        }
//                    }
//                    if (c < 0x80) {
//                        /* one byte */
//                        buf[i++] = c;
//                    } else if (c < 0x800) {
//                        /* two bytes */
//                        buf[i++] = 0xC0 | (c >>> 6);
//                        buf[i++] = 0x80 | (c & 0x3f);
//                    } else if (c < 0x10000) {
//                        /* three bytes */
//                        buf[i++] = 0xE0 | (c >>> 12);
//                        buf[i++] = 0x80 | (c >>> 6 & 0x3f);
//                        buf[i++] = 0x80 | (c & 0x3f);
//                    } else {
//                        /* four bytes */
//                        buf[i++] = 0xf0 | (c >>> 18);
//                        buf[i++] = 0x80 | (c >>> 12 & 0x3f);
//                        buf[i++] = 0x80 | (c >>> 6 & 0x3f);
//                        buf[i++] = 0x80 | (c & 0x3f);
//                    }
//                }

//                return buf;
//            };

//            // Helper (used in 2 places)
//            function buf2binstring(buf, len) {
//                // use fallback for big arrays to avoid stack overflow
//                if (len < 65537) {
//                    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
//                        return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
//                    }
//                }

//                var result = '';
//                for (var i = 0; i < len; i++) {
//                    result += String.fromCharCode(buf[i]);
//                }
//                return result;
//            }


//            // Convert byte array to binary string
//            exports.buf2binstring = function (buf) {
//                return buf2binstring(buf, buf.length);
//            };


//            // Convert binary string (typed, when possible)
//            exports.binstring2buf = function (str) {
//                var buf = new utils.Buf8(str.length);
//                for (var i = 0, len = buf.length; i < len; i++) {
//                    buf[i] = str.charCodeAt(i);
//                }
//                return buf;
//            };


//            // convert array to string
//            exports.buf2string = function (buf, max) {
//                var i, out, c, c_len;
//                var len = max || buf.length;

//                // Reserve max possible length (2 words per char)
//                // NB: by unknown reasons, Array is significantly faster for
//                //     String.fromCharCode.apply than Uint16Array.
//                var utf16buf = new Array(len * 2);

//                for (out = 0, i = 0; i < len;) {
//                    c = buf[i++];
//                    // quick process ascii
//                    if (c < 0x80) { utf16buf[out++] = c; continue; }

//                    c_len = _utf8len[c];
//                    // skip 5 & 6 byte codes
//                    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

//                    // apply mask on first byte
//                    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
//                    // join the rest
//                    while (c_len > 1 && i < len) {
//                        c = (c << 6) | (buf[i++] & 0x3f);
//                        c_len--;
//                    }

//                    // terminated by end of string?
//                    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

//                    if (c < 0x10000) {
//                        utf16buf[out++] = c;
//                    } else {
//                        c -= 0x10000;
//                        utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
//                        utf16buf[out++] = 0xdc00 | (c & 0x3ff);
//                    }
//                }

//                return buf2binstring(utf16buf, out);
//            };


//            // Calculate max possible position in utf8 buffer,
//            // that will not break sequence. If that's not possible
//            // - (very small limits) return max size as is.
//            //
//            // buf[] - utf8 bytes array
//            // max   - length limit (mandatory);
//            exports.utf8border = function (buf, max) {
//                var pos;

//                max = max || buf.length;
//                if (max > buf.length) { max = buf.length; }

//                // go back from last position, until start of sequence found
//                pos = max - 1;
//                while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

//                // Fuckup - very small and broken sequence,
//                // return max, because we should return something anyway.
//                if (pos < 0) { return max; }

//                // If we came to start of buffer - that means vuffer is too small,
//                // return max too.
//                if (pos === 0) { return max; }

//                return (pos + _utf8len[buf[pos]] > max) ? pos : max;
//            };

//        }, { "./common": 2 }], 4: [function (_dereq_, module, exports) {
//            'use strict';

//            // Note: adler32 takes 12% for level 0 and 2% for level 6.
//            // It doesn't worth to make additional optimizationa as in original.
//            // Small size is preferable.

//            function adler32(adler, buf, len, pos) {
//                var s1 = (adler & 0xffff) | 0
//                  , s2 = ((adler >>> 16) & 0xffff) | 0
//                  , n = 0;

//                while (len !== 0) {
//                    // Set limit ~ twice less than 5552, to keep
//                    // s2 in 31-bits, because we force signed ints.
//                    // in other case %= will fail.
//                    n = len > 2000 ? 2000 : len;
//                    len -= n;

//                    do {
//                        s1 = (s1 + buf[pos++]) | 0;
//                        s2 = (s2 + s1) | 0;
//                    } while (--n);

//                    s1 %= 65521;
//                    s2 %= 65521;
//                }

//                return (s1 | (s2 << 16)) | 0;
//            }


//            module.exports = adler32;
//        }, {}], 5: [function (_dereq_, module, exports) {
//            module.exports = {

//                /* Allowed flush values; see deflate() and inflate() below for details */
//                Z_NO_FLUSH: 0,
//                Z_PARTIAL_FLUSH: 1,
//                Z_SYNC_FLUSH: 2,
//                Z_FULL_FLUSH: 3,
//                Z_FINISH: 4,
//                Z_BLOCK: 5,
//                Z_TREES: 6,

//                /* Return codes for the compression/decompression functions. Negative values
//                * are errors, positive values are used for special but normal events.
//                */
//                Z_OK: 0,
//                Z_STREAM_END: 1,
//                Z_NEED_DICT: 2,
//                Z_ERRNO: -1,
//                Z_STREAM_ERROR: -2,
//                Z_DATA_ERROR: -3,
//                //Z_MEM_ERROR:     -4,
//                Z_BUF_ERROR: -5,
//                //Z_VERSION_ERROR: -6,

//                /* compression levels */
//                Z_NO_COMPRESSION: 0,
//                Z_BEST_SPEED: 1,
//                Z_BEST_COMPRESSION: 9,
//                Z_DEFAULT_COMPRESSION: -1,


//                Z_FILTERED: 1,
//                Z_HUFFMAN_ONLY: 2,
//                Z_RLE: 3,
//                Z_FIXED: 4,
//                Z_DEFAULT_STRATEGY: 0,

//                /* Possible values of the data_type field (though see inflate()) */
//                Z_BINARY: 0,
//                Z_TEXT: 1,
//                //Z_ASCII:                1, // = Z_TEXT (deprecated)
//                Z_UNKNOWN: 2,

//                /* The deflate compression method */
//                Z_DEFLATED: 8
//                //Z_NULL:                 null // Use -1 or null inline, depending on var type
//            };
//        }, {}], 6: [function (_dereq_, module, exports) {
//            'use strict';

//            // Note: we can't get significant speed boost here.
//            // So write code to minimize size - no pregenerated tables
//            // and array tools dependencies.


//            // Use ordinary array, since untyped makes no boost here
//            function makeTable() {
//                var c, table = [];

//                for (var n = 0; n < 256; n++) {
//                    c = n;
//                    for (var k = 0; k < 8; k++) {
//                        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
//                    }
//                    table[n] = c;
//                }

//                return table;
//            }

//            // Create table on load. Just 255 signed longs. Not a problem.
//            var crcTable = makeTable();


//            function crc32(crc, buf, len, pos) {
//                var t = crcTable
//                  , end = pos + len;

//                crc = crc ^ (-1);

//                for (var i = pos; i < end; i++) {
//                    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
//                }

//                return (crc ^ (-1)); // >>> 0;
//            }


//            module.exports = crc32;
//        }, {}], 7: [function (_dereq_, module, exports) {
//            'use strict';


//            function GZheader() {
//                /* true if compressed data believed to be text */
//                this.text = 0;
//                /* modification time */
//                this.time = 0;
//                /* extra flags (not used when writing a gzip file) */
//                this.xflags = 0;
//                /* operating system */
//                this.os = 0;
//                /* pointer to extra field or Z_NULL if none */
//                this.extra = null;
//                /* extra field length (valid if extra != Z_NULL) */
//                this.extra_len = 0; // Actually, we don't need it in JS,
//                // but leave for few code modifications

//                //
//                // Setup limits is not necessary because in js we should not preallocate memory 
//                // for inflate use constant limit in 65536 bytes
//                //

//                /* space at extra (only when reading header) */
//                // this.extra_max  = 0;
//                /* pointer to zero-terminated file name or Z_NULL */
//                this.name = '';
//                /* space at name (only when reading header) */
//                // this.name_max   = 0;
//                /* pointer to zero-terminated comment or Z_NULL */
//                this.comment = '';
//                /* space at comment (only when reading header) */
//                // this.comm_max   = 0;
//                /* true if there was or will be a header crc */
//                this.hcrc = 0;
//                /* true when done reading gzip header (not used when writing a gzip file) */
//                this.done = false;
//            }

//            module.exports = GZheader;
//        }, {}], 8: [function (_dereq_, module, exports) {
//            'use strict';

//            // See state defs from inflate.js
//            var BAD = 30;       /* got a data error -- remain here until reset */
//            var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

//            /*
//               Decode literal, length, and distance codes and write out the resulting
//               literal and match bytes until either not enough input or output is
//               available, an end-of-block is encountered, or a data error is encountered.
//               When large enough input and output buffers are supplied to inflate(), for
//               example, a 16K input buffer and a 64K output buffer, more than 95% of the
//               inflate execution time is spent in this routine.
            
//               Entry assumptions:
            
//                    state.mode === LEN
//                    strm.avail_in >= 6
//                    strm.avail_out >= 258
//                    start >= strm.avail_out
//                    state.bits < 8
            
//               On return, state.mode is one of:
            
//                    LEN -- ran out of enough output space or enough available input
//                    TYPE -- reached end of block code, inflate() to interpret next block
//                    BAD -- error in block data
            
//               Notes:
            
//                - The maximum input bits used by a length/distance pair is 15 bits for the
//                  length code, 5 bits for the length extra, 15 bits for the distance code,
//                  and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
//                  Therefore if strm.avail_in >= 6, then there is enough input to avoid
//                  checking for available input while decoding.
            
//                - The maximum bytes that a single length/distance pair can output is 258
//                  bytes, which is the maximum length that can be coded.  inflate_fast()
//                  requires strm.avail_out >= 258 for each loop to avoid checking for
//                  output space.
//             */
//            module.exports = function inflate_fast(strm, start) {
//                var state;
//                var _in;                    /* local strm.input */
//                var last;                   /* have enough input while in < last */
//                var _out;                   /* local strm.output */
//                var beg;                    /* inflate()'s initial strm.output */
//                var end;                    /* while out < end, enough space available */
//                //#ifdef INFLATE_STRICT
//                var dmax;                   /* maximum distance from zlib header */
//                //#endif
//                var wsize;                  /* window size or zero if not using window */
//                var whave;                  /* valid bytes in the window */
//                var wnext;                  /* window write index */
//                var window;                 /* allocated sliding window, if wsize != 0 */
//                var hold;                   /* local strm.hold */
//                var bits;                   /* local strm.bits */
//                var lcode;                  /* local strm.lencode */
//                var dcode;                  /* local strm.distcode */
//                var lmask;                  /* mask for first level of length codes */
//                var dmask;                  /* mask for first level of distance codes */
//                var here;                   /* retrieved table entry */
//                var op;                     /* code bits, operation, extra bits, or */
//                /*  window position, window bytes to copy */
//                var len;                    /* match length, unused bytes */
//                var dist;                   /* match distance */
//                var from;                   /* where to copy match from */
//                var from_source;


//                var input, output; // JS specific, because we have no pointers

//                /* copy state to local variables */
//                state = strm.state;
//                //here = state.here;
//                _in = strm.next_in;
//                input = strm.input;
//                last = _in + (strm.avail_in - 5);
//                _out = strm.next_out;
//                output = strm.output;
//                beg = _out - (start - strm.avail_out);
//                end = _out + (strm.avail_out - 257);
//                //#ifdef INFLATE_STRICT
//                dmax = state.dmax;
//                //#endif
//                wsize = state.wsize;
//                whave = state.whave;
//                wnext = state.wnext;
//                window = state.window;
//                hold = state.hold;
//                bits = state.bits;
//                lcode = state.lencode;
//                dcode = state.distcode;
//                lmask = (1 << state.lenbits) - 1;
//                dmask = (1 << state.distbits) - 1;


//                /* decode literals and length/distances until end-of-block or not enough
//                   input data or output space */

//                top:
//                    do {
//                        if (bits < 15) {
//                            hold += input[_in++] << bits;
//                            bits += 8;
//                            hold += input[_in++] << bits;
//                            bits += 8;
//                        }

//                        here = lcode[hold & lmask];

//                        dolen:
//                            for (; ;) { // Goto emulation
//                                op = here >>> 24/*here.bits*/;
//                                hold >>>= op;
//                                bits -= op;
//                                op = (here >>> 16) & 0xff/*here.op*/;
//                                if (op === 0) {                          /* literal */
//                                    //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
//                                    //        "inflate:         literal '%c'\n" :
//                                    //        "inflate:         literal 0x%02x\n", here.val));
//                                    output[_out++] = here & 0xffff/*here.val*/;
//                                }
//                                else if (op & 16) {                     /* length base */
//                                    len = here & 0xffff/*here.val*/;
//                                    op &= 15;                           /* number of extra bits */
//                                    if (op) {
//                                        if (bits < op) {
//                                            hold += input[_in++] << bits;
//                                            bits += 8;
//                                        }
//                                        len += hold & ((1 << op) - 1);
//                                        hold >>>= op;
//                                        bits -= op;
//                                    }
//                                    //Tracevv((stderr, "inflate:         length %u\n", len));
//                                    if (bits < 15) {
//                                        hold += input[_in++] << bits;
//                                        bits += 8;
//                                        hold += input[_in++] << bits;
//                                        bits += 8;
//                                    }
//                                    here = dcode[hold & dmask];

//                                    dodist:
//                                        for (; ;) { // goto emulation
//                                            op = here >>> 24/*here.bits*/;
//                                            hold >>>= op;
//                                            bits -= op;
//                                            op = (here >>> 16) & 0xff/*here.op*/;

//                                            if (op & 16) {                      /* distance base */
//                                                dist = here & 0xffff/*here.val*/;
//                                                op &= 15;                       /* number of extra bits */
//                                                if (bits < op) {
//                                                    hold += input[_in++] << bits;
//                                                    bits += 8;
//                                                    if (bits < op) {
//                                                        hold += input[_in++] << bits;
//                                                        bits += 8;
//                                                    }
//                                                }
//                                                dist += hold & ((1 << op) - 1);
//                                                //#ifdef INFLATE_STRICT
//                                                if (dist > dmax) {
//                                                    strm.msg = 'invalid distance too far back';
//                                                    state.mode = BAD;
//                                                    break top;
//                                                }
//                                                //#endif
//                                                hold >>>= op;
//                                                bits -= op;
//                                                //Tracevv((stderr, "inflate:         distance %u\n", dist));
//                                                op = _out - beg;                /* max distance in output */
//                                                if (dist > op) {                /* see if copy from window */
//                                                    op = dist - op;               /* distance back in window */
//                                                    if (op > whave) {
//                                                        if (state.sane) {
//                                                            strm.msg = 'invalid distance too far back';
//                                                            state.mode = BAD;
//                                                            break top;
//                                                        }

//                                                        // (!) This block is disabled in zlib defailts,
//                                                        // don't enable it for binary compatibility
//                                                        //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                                                        //                if (len <= op - whave) {
//                                                        //                  do {
//                                                        //                    output[_out++] = 0;
//                                                        //                  } while (--len);
//                                                        //                  continue top;
//                                                        //                }
//                                                        //                len -= op - whave;
//                                                        //                do {
//                                                        //                  output[_out++] = 0;
//                                                        //                } while (--op > whave);
//                                                        //                if (op === 0) {
//                                                        //                  from = _out - dist;
//                                                        //                  do {
//                                                        //                    output[_out++] = output[from++];
//                                                        //                  } while (--len);
//                                                        //                  continue top;
//                                                        //                }
//                                                        //#endif
//                                                    }
//                                                    from = 0; // window index
//                                                    from_source = window;
//                                                    if (wnext === 0) {           /* very common case */
//                                                        from += wsize - op;
//                                                        if (op < len) {         /* some from window */
//                                                            len -= op;
//                                                            do {
//                                                                output[_out++] = window[from++];
//                                                            } while (--op);
//                                                            from = _out - dist;  /* rest from output */
//                                                            from_source = output;
//                                                        }
//                                                    }
//                                                    else if (wnext < op) {      /* wrap around window */
//                                                        from += wsize + wnext - op;
//                                                        op -= wnext;
//                                                        if (op < len) {         /* some from end of window */
//                                                            len -= op;
//                                                            do {
//                                                                output[_out++] = window[from++];
//                                                            } while (--op);
//                                                            from = 0;
//                                                            if (wnext < len) {  /* some from start of window */
//                                                                op = wnext;
//                                                                len -= op;
//                                                                do {
//                                                                    output[_out++] = window[from++];
//                                                                } while (--op);
//                                                                from = _out - dist;      /* rest from output */
//                                                                from_source = output;
//                                                            }
//                                                        }
//                                                    }
//                                                    else {                      /* contiguous in window */
//                                                        from += wnext - op;
//                                                        if (op < len) {         /* some from window */
//                                                            len -= op;
//                                                            do {
//                                                                output[_out++] = window[from++];
//                                                            } while (--op);
//                                                            from = _out - dist;  /* rest from output */
//                                                            from_source = output;
//                                                        }
//                                                    }
//                                                    while (len > 2) {
//                                                        output[_out++] = from_source[from++];
//                                                        output[_out++] = from_source[from++];
//                                                        output[_out++] = from_source[from++];
//                                                        len -= 3;
//                                                    }
//                                                    if (len) {
//                                                        output[_out++] = from_source[from++];
//                                                        if (len > 1) {
//                                                            output[_out++] = from_source[from++];
//                                                        }
//                                                    }
//                                                }
//                                                else {
//                                                    from = _out - dist;          /* copy direct from output */
//                                                    do {                        /* minimum length is three */
//                                                        output[_out++] = output[from++];
//                                                        output[_out++] = output[from++];
//                                                        output[_out++] = output[from++];
//                                                        len -= 3;
//                                                    } while (len > 2);
//                                                    if (len) {
//                                                        output[_out++] = output[from++];
//                                                        if (len > 1) {
//                                                            output[_out++] = output[from++];
//                                                        }
//                                                    }
//                                                }
//                                            }
//                                            else if ((op & 64) === 0) {          /* 2nd level distance code */
//                                                here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
//                                                continue dodist;
//                                            }
//                                            else {
//                                                strm.msg = 'invalid distance code';
//                                                state.mode = BAD;
//                                                break top;
//                                            }

//                                            break; // need to emulate goto via "continue"
//                                        }
//                                }
//                                else if ((op & 64) === 0) {              /* 2nd level length code */
//                                    here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
//                                    continue dolen;
//                                }
//                                else if (op & 32) {                     /* end-of-block */
//                                    //Tracevv((stderr, "inflate:         end of block\n"));
//                                    state.mode = TYPE;
//                                    break top;
//                                }
//                                else {
//                                    strm.msg = 'invalid literal/length code';
//                                    state.mode = BAD;
//                                    break top;
//                                }

//                                break; // need to emulate goto via "continue"
//                            }
//                    } while (_in < last && _out < end);

//                /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
//                len = bits >> 3;
//                _in -= len;
//                bits -= len << 3;
//                hold &= (1 << bits) - 1;

//                /* update state and return */
//                strm.next_in = _in;
//                strm.next_out = _out;
//                strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
//                strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
//                state.hold = hold;
//                state.bits = bits;
//                return;
//            };

//        }, {}], 9: [function (_dereq_, module, exports) {
//            'use strict';


//            var utils = _dereq_('../utils/common');
//            var adler32 = _dereq_('./adler32');
//            var crc32 = _dereq_('./crc32');
//            var inflate_fast = _dereq_('./inffast');
//            var inflate_table = _dereq_('./inftrees');

//            var CODES = 0;
//            var LENS = 1;
//            var DISTS = 2;

//            /* Public constants ==========================================================*/
//            /* ===========================================================================*/


//            /* Allowed flush values; see deflate() and inflate() below for details */
//            //var Z_NO_FLUSH      = 0;
//            //var Z_PARTIAL_FLUSH = 1;
//            //var Z_SYNC_FLUSH    = 2;
//            //var Z_FULL_FLUSH    = 3;
//            var Z_FINISH = 4;
//            var Z_BLOCK = 5;
//            var Z_TREES = 6;


//            /* Return codes for the compression/decompression functions. Negative values
//             * are errors, positive values are used for special but normal events.
//             */
//            var Z_OK = 0;
//            var Z_STREAM_END = 1;
//            var Z_NEED_DICT = 2;
//            //var Z_ERRNO         = -1;
//            var Z_STREAM_ERROR = -2;
//            var Z_DATA_ERROR = -3;
//            var Z_MEM_ERROR = -4;
//            var Z_BUF_ERROR = -5;
//            //var Z_VERSION_ERROR = -6;

//            /* The deflate compression method */
//            var Z_DEFLATED = 8;


//            /* STATES ====================================================================*/
//            /* ===========================================================================*/


//            var HEAD = 1;       /* i: waiting for magic header */
//            var FLAGS = 2;      /* i: waiting for method and flags (gzip) */
//            var TIME = 3;       /* i: waiting for modification time (gzip) */
//            var OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
//            var EXLEN = 5;      /* i: waiting for extra length (gzip) */
//            var EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
//            var NAME = 7;       /* i: waiting for end of file name (gzip) */
//            var COMMENT = 8;    /* i: waiting for end of comment (gzip) */
//            var HCRC = 9;       /* i: waiting for header crc (gzip) */
//            var DICTID = 10;    /* i: waiting for dictionary check value */
//            var DICT = 11;      /* waiting for inflateSetDictionary() call */
//            var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */
//            var TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
//            var STORED = 14;    /* i: waiting for stored size (length and complement) */
//            var COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
//            var COPY = 16;      /* i/o: waiting for input or output to copy stored block */
//            var TABLE = 17;     /* i: waiting for dynamic block table lengths */
//            var LENLENS = 18;   /* i: waiting for code length code lengths */
//            var CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
//            var LEN_ = 20;      /* i: same as LEN below, but only first time in */
//            var LEN = 21;       /* i: waiting for length/lit/eob code */
//            var LENEXT = 22;    /* i: waiting for length extra bits */
//            var DIST = 23;      /* i: waiting for distance code */
//            var DISTEXT = 24;   /* i: waiting for distance extra bits */
//            var MATCH = 25;     /* o: waiting for output space to copy string */
//            var LIT = 26;       /* o: waiting for output space to write literal */
//            var CHECK = 27;     /* i: waiting for 32-bit check value */
//            var LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
//            var DONE = 29;      /* finished check, done -- remain here until reset */
//            var BAD = 30;       /* got a data error -- remain here until reset */
//            var MEM = 31;       /* got an inflate() memory error -- remain here until reset */
//            var SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

//            /* ===========================================================================*/



//            var ENOUGH_LENS = 852;
//            var ENOUGH_DISTS = 592;
//            //var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

//            var MAX_WBITS = 15;
//            /* 32K LZ77 window */
//            var DEF_WBITS = MAX_WBITS;


//            function ZSWAP32(q) {
//                return (((q >>> 24) & 0xff) +
//                        ((q >>> 8) & 0xff00) +
//                        ((q & 0xff00) << 8) +
//                        ((q & 0xff) << 24));
//            }


//            function InflateState() {
//                this.mode = 0;             /* current inflate mode */
//                this.last = false;          /* true if processing last block */
//                this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
//                this.havedict = false;      /* true if dictionary provided */
//                this.flags = 0;             /* gzip header method and flags (0 if zlib) */
//                this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
//                this.check = 0;             /* protected copy of check value */
//                this.total = 0;             /* protected copy of output count */
//                // TODO: may be {}
//                this.head = null;           /* where to save gzip header information */

//                /* sliding window */
//                this.wbits = 0;             /* log base 2 of requested window size */
//                this.wsize = 0;             /* window size or zero if not using window */
//                this.whave = 0;             /* valid bytes in the window */
//                this.wnext = 0;             /* window write index */
//                this.window = null;         /* allocated sliding window, if needed */

//                /* bit accumulator */
//                this.hold = 0;              /* input bit accumulator */
//                this.bits = 0;              /* number of bits in "in" */

//                /* for string and stored block copying */
//                this.length = 0;            /* literal or length of data to copy */
//                this.offset = 0;            /* distance back to copy string from */

//                /* for table and code decoding */
//                this.extra = 0;             /* extra bits needed */

//                /* fixed and dynamic code tables */
//                this.lencode = null;          /* starting table for length/literal codes */
//                this.distcode = null;         /* starting table for distance codes */
//                this.lenbits = 0;           /* index bits for lencode */
//                this.distbits = 0;          /* index bits for distcode */

//                /* dynamic table building */
//                this.ncode = 0;             /* number of code length code lengths */
//                this.nlen = 0;              /* number of length code lengths */
//                this.ndist = 0;             /* number of distance code lengths */
//                this.have = 0;              /* number of code lengths in lens[] */
//                this.next = null;              /* next available space in codes[] */

//                this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
//                this.work = new utils.Buf16(288); /* work area for code table building */

//                /*
//                 because we don't have pointers in js, we use lencode and distcode directly
//                 as buffers so we don't need codes
//                */
//                //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
//                this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
//                this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
//                this.sane = 0;                   /* if false, allow invalid distance too far */
//                this.back = 0;                   /* bits back of last unprocessed length/lit */
//                this.was = 0;                    /* initial length of match */
//            }

//            function inflateResetKeep(strm) {
//                var state;

//                if (!strm || !strm.state) { return Z_STREAM_ERROR; }
//                state = strm.state;
//                strm.total_in = strm.total_out = state.total = 0;
//                strm.msg = ''; /*Z_NULL*/
//                if (state.wrap) {       /* to support ill-conceived Java test suite */
//                    strm.adler = state.wrap & 1;
//                }
//                state.mode = HEAD;
//                state.last = 0;
//                state.havedict = 0;
//                state.dmax = 32768;
//                state.head = null/*Z_NULL*/;
//                state.hold = 0;
//                state.bits = 0;
//                //state.lencode = state.distcode = state.next = state.codes;
//                state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
//                state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

//                state.sane = 1;
//                state.back = -1;
//                //Tracev((stderr, "inflate: reset\n"));
//                return Z_OK;
//            }

//            function inflateReset(strm) {
//                var state;

//                if (!strm || !strm.state) { return Z_STREAM_ERROR; }
//                state = strm.state;
//                state.wsize = 0;
//                state.whave = 0;
//                state.wnext = 0;
//                return inflateResetKeep(strm);

//            }

//            function inflateReset2(strm, windowBits) {
//                var wrap;
//                var state;

//                /* get the state */
//                if (!strm || !strm.state) { return Z_STREAM_ERROR; }
//                state = strm.state;

//                /* extract wrap request from windowBits parameter */
//                if (windowBits < 0) {
//                    wrap = 0;
//                    windowBits = -windowBits;
//                }
//                else {
//                    wrap = (windowBits >> 4) + 1;
//                    if (windowBits < 48) {
//                        windowBits &= 15;
//                    }
//                }

//                /* set number of window bits, free window if different */
//                if (windowBits && (windowBits < 8 || windowBits > 15)) {
//                    return Z_STREAM_ERROR;
//                }
//                if (state.window !== null && state.wbits !== windowBits) {
//                    state.window = null;
//                }

//                /* update state and reset the rest of it */
//                state.wrap = wrap;
//                state.wbits = windowBits;
//                return inflateReset(strm);
//            }

//            function inflateInit2(strm, windowBits) {
//                var ret;
//                var state;

//                if (!strm) { return Z_STREAM_ERROR; }
//                //strm.msg = Z_NULL;                 /* in case we return an error */

//                state = new InflateState();

//                //if (state === Z_NULL) return Z_MEM_ERROR;
//                //Tracev((stderr, "inflate: allocated\n"));
//                strm.state = state;
//                state.window = null/*Z_NULL*/;
//                ret = inflateReset2(strm, windowBits);
//                if (ret !== Z_OK) {
//                    strm.state = null/*Z_NULL*/;
//                }
//                return ret;
//            }

//            function inflateInit(strm) {
//                return inflateInit2(strm, DEF_WBITS);
//            }


//            /*
//             Return state with length and distance decoding tables and index sizes set to
//             fixed code decoding.  Normally this returns fixed tables from inffixed.h.
//             If BUILDFIXED is defined, then instead this routine builds the tables the
//             first time it's called, and returns those tables the first time and
//             thereafter.  This reduces the size of the code by about 2K bytes, in
//             exchange for a little execution time.  However, BUILDFIXED should not be
//             used for threaded applications, since the rewriting of the tables and virgin
//             may not be thread-safe.
//             */
//            var virgin = true;

//            var lenfix, distfix; // We have no pointers in JS, so keep tables separate

//            function fixedtables(state) {
//                /* build fixed huffman tables if first call (may not be thread safe) */
//                if (virgin) {
//                    var sym;

//                    lenfix = new utils.Buf32(512);
//                    distfix = new utils.Buf32(32);

//                    /* literal/length table */
//                    sym = 0;
//                    while (sym < 144) { state.lens[sym++] = 8; }
//                    while (sym < 256) { state.lens[sym++] = 9; }
//                    while (sym < 280) { state.lens[sym++] = 7; }
//                    while (sym < 288) { state.lens[sym++] = 8; }

//                    inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });

//                    /* distance table */
//                    sym = 0;
//                    while (sym < 32) { state.lens[sym++] = 5; }

//                    inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });

//                    /* do this just once */
//                    virgin = false;
//                }

//                state.lencode = lenfix;
//                state.lenbits = 9;
//                state.distcode = distfix;
//                state.distbits = 5;
//            }


//            /*
//             Update the window with the last wsize (normally 32K) bytes written before
//             returning.  If window does not exist yet, create it.  This is only called
//             when a window is already in use, or when output has been written during this
//             inflate call, but the end of the deflate stream has not been reached yet.
//             It is also called to create a window for dictionary data when a dictionary
//             is loaded.
            
//             Providing output buffers larger than 32K to inflate() should provide a speed
//             advantage, since only the last 32K of output is copied to the sliding window
//             upon return from inflate(), and since all distances after the first 32K of
//             output will fall in the output data, making match copies simpler and faster.
//             The advantage may be dependent on the size of the processor's data caches.
//             */
//            function updatewindow(strm, src, end, copy) {
//                var dist;
//                var state = strm.state;

//                /* if it hasn't been done already, allocate space for the window */
//                if (state.window === null) {
//                    state.wsize = 1 << state.wbits;
//                    state.wnext = 0;
//                    state.whave = 0;

//                    state.window = new utils.Buf8(state.wsize);
//                }

//                /* copy state->wsize or less output bytes into the circular window */
//                if (copy >= state.wsize) {
//                    utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
//                    state.wnext = 0;
//                    state.whave = state.wsize;
//                }
//                else {
//                    dist = state.wsize - state.wnext;
//                    if (dist > copy) {
//                        dist = copy;
//                    }
//                    //zmemcpy(state->window + state->wnext, end - copy, dist);
//                    utils.arraySet(state.window, src, end - copy, dist, state.wnext);
//                    copy -= dist;
//                    if (copy) {
//                        //zmemcpy(state->window, end - copy, copy);
//                        utils.arraySet(state.window, src, end - copy, copy, 0);
//                        state.wnext = copy;
//                        state.whave = state.wsize;
//                    }
//                    else {
//                        state.wnext += dist;
//                        if (state.wnext === state.wsize) { state.wnext = 0; }
//                        if (state.whave < state.wsize) { state.whave += dist; }
//                    }
//                }
//                return 0;
//            }

//            function inflate(strm, flush) {
//                var state;
//                var input, output;          // input/output buffers
//                var next;                   /* next input INDEX */
//                var put;                    /* next output INDEX */
//                var have, left;             /* available input and output */
//                var hold;                   /* bit buffer */
//                var bits;                   /* bits in bit buffer */
//                var _in, _out;              /* save starting available input and output */
//                var copy;                   /* number of stored or match bytes to copy */
//                var from;                   /* where to copy match bytes from */
//                var from_source;
//                var here = 0;               /* current decoding table entry */
//                var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
//                //var last;                   /* parent table entry */
//                var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
//                var len;                    /* length to copy for repeats, bits to drop */
//                var ret;                    /* return code */
//                var hbuf = new utils.Buf8(4);    /* buffer for gzip header crc calculation */
//                var opts;

//                var n; // temporary var for NEED_BITS

//                var order = /* permutation of code lengths */
//                  [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];


//                if (!strm || !strm.state || !strm.output ||
//                    (!strm.input && strm.avail_in !== 0)) {
//                    return Z_STREAM_ERROR;
//                }

//                state = strm.state;
//                if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


//                //--- LOAD() ---
//                put = strm.next_out;
//                output = strm.output;
//                left = strm.avail_out;
//                next = strm.next_in;
//                input = strm.input;
//                have = strm.avail_in;
//                hold = state.hold;
//                bits = state.bits;
//                //---

//                _in = have;
//                _out = left;
//                ret = Z_OK;

//                inf_leave: // goto emulation
//                    for (; ;) {
//                        switch (state.mode) {
//                            case HEAD:
//                                if (state.wrap === 0) {
//                                    state.mode = TYPEDO;
//                                    break;
//                                }
//                                //=== NEEDBITS(16);
//                                while (bits < 16) {
//                                    if (have === 0) { break inf_leave; }
//                                    have--;
//                                    hold += input[next++] << bits;
//                                    bits += 8;
//                                }
//                                //===//
//                                if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
//                                    state.check = 0/*crc32(0L, Z_NULL, 0)*/;
//                                    //=== CRC2(state.check, hold);
//                                    hbuf[0] = hold & 0xff;
//                                    hbuf[1] = (hold >>> 8) & 0xff;
//                                    state.check = crc32(state.check, hbuf, 2, 0);
//                                    //===//

//                                    //=== INITBITS();
//                                    hold = 0;
//                                    bits = 0;
//                                    //===//
//                                    state.mode = FLAGS;
//                                    break;
//                                }
//                                state.flags = 0;           /* expect zlib header */
//                                if (state.head) {
//                                    state.head.done = false;
//                                }
//                                if (!(state.wrap & 1) ||   /* check if zlib header allowed */
//                                  (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
//                                    strm.msg = 'incorrect header check';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
//                                    strm.msg = 'unknown compression method';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                //--- DROPBITS(4) ---//
//                                hold >>>= 4;
//                                bits -= 4;
//                                //---//
//                                len = (hold & 0x0f)/*BITS(4)*/ + 8;
//                                if (state.wbits === 0) {
//                                    state.wbits = len;
//                                }
//                                else if (len > state.wbits) {
//                                    strm.msg = 'invalid window size';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                state.dmax = 1 << len;
//                                //Tracev((stderr, "inflate:   zlib header ok\n"));
//                                strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
//                                state.mode = hold & 0x200 ? DICTID : TYPE;
//                                //=== INITBITS();
//                                hold = 0;
//                                bits = 0;
//                                //===//
//                                break;
//                            case FLAGS:
//                                //=== NEEDBITS(16); */
//                                while (bits < 16) {
//                                    if (have === 0) { break inf_leave; }
//                                    have--;
//                                    hold += input[next++] << bits;
//                                    bits += 8;
//                                }
//                                //===//
//                                state.flags = hold;
//                                if ((state.flags & 0xff) !== Z_DEFLATED) {
//                                    strm.msg = 'unknown compression method';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                if (state.flags & 0xe000) {
//                                    strm.msg = 'unknown header flags set';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                if (state.head) {
//                                    state.head.text = ((hold >> 8) & 1);
//                                }
//                                if (state.flags & 0x0200) {
//                                    //=== CRC2(state.check, hold);
//                                    hbuf[0] = hold & 0xff;
//                                    hbuf[1] = (hold >>> 8) & 0xff;
//                                    state.check = crc32(state.check, hbuf, 2, 0);
//                                    //===//
//                                }
//                                //=== INITBITS();
//                                hold = 0;
//                                bits = 0;
//                                //===//
//                                state.mode = TIME;
//                                /* falls through */
//                            case TIME:
//                                //=== NEEDBITS(32); */
//                                while (bits < 32) {
//                                    if (have === 0) { break inf_leave; }
//                                    have--;
//                                    hold += input[next++] << bits;
//                                    bits += 8;
//                                }
//                                //===//
//                                if (state.head) {
//                                    state.head.time = hold;
//                                }
//                                if (state.flags & 0x0200) {
//                                    //=== CRC4(state.check, hold)
//                                    hbuf[0] = hold & 0xff;
//                                    hbuf[1] = (hold >>> 8) & 0xff;
//                                    hbuf[2] = (hold >>> 16) & 0xff;
//                                    hbuf[3] = (hold >>> 24) & 0xff;
//                                    state.check = crc32(state.check, hbuf, 4, 0);
//                                    //===
//                                }
//                                //=== INITBITS();
//                                hold = 0;
//                                bits = 0;
//                                //===//
//                                state.mode = OS;
//                                /* falls through */
//                            case OS:
//                                //=== NEEDBITS(16); */
//                                while (bits < 16) {
//                                    if (have === 0) { break inf_leave; }
//                                    have--;
//                                    hold += input[next++] << bits;
//                                    bits += 8;
//                                }
//                                //===//
//                                if (state.head) {
//                                    state.head.xflags = (hold & 0xff);
//                                    state.head.os = (hold >> 8);
//                                }
//                                if (state.flags & 0x0200) {
//                                    //=== CRC2(state.check, hold);
//                                    hbuf[0] = hold & 0xff;
//                                    hbuf[1] = (hold >>> 8) & 0xff;
//                                    state.check = crc32(state.check, hbuf, 2, 0);
//                                    //===//
//                                }
//                                //=== INITBITS();
//                                hold = 0;
//                                bits = 0;
//                                //===//
//                                state.mode = EXLEN;
//                                /* falls through */
//                            case EXLEN:
//                                if (state.flags & 0x0400) {
//                                    //=== NEEDBITS(16); */
//                                    while (bits < 16) {
//                                        if (have === 0) { break inf_leave; }
//                                        have--;
//                                        hold += input[next++] << bits;
//                                        bits += 8;
//                                    }
//                                    //===//
//                                    state.length = hold;
//                                    if (state.head) {
//                                        state.head.extra_len = hold;
//                                    }
//                                    if (state.flags & 0x0200) {
//                                        //=== CRC2(state.check, hold);
//                                        hbuf[0] = hold & 0xff;
//                                        hbuf[1] = (hold >>> 8) & 0xff;
//                                        state.check = crc32(state.check, hbuf, 2, 0);
//                                        //===//
//                                    }
//                                    //=== INITBITS();
//                                    hold = 0;
//                                    bits = 0;
//                                    //===//
//                                }
//                                else if (state.head) {
//                                    state.head.extra = null/*Z_NULL*/;
//                                }
//                                state.mode = EXTRA;
//                                /* falls through */
//                            case EXTRA:
//                                if (state.flags & 0x0400) {
//                                    copy = state.length;
//                                    if (copy > have) { copy = have; }
//                                    if (copy) {
//                                        if (state.head) {
//                                            len = state.head.extra_len - state.length;
//                                            if (!state.head.extra) {
//                                                // Use untyped array for more conveniend processing later
//                                                state.head.extra = new Array(state.head.extra_len);
//                                            }
//                                            utils.arraySet(
//                                              state.head.extra,
//                                              input,
//                                              next,
//                                              // extra field is limited to 65536 bytes
//                                              // - no need for additional size check
//                                              copy,
//                                              /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
//                                              len
//                                            );
//                                            //zmemcpy(state.head.extra + len, next,
//                                            //        len + copy > state.head.extra_max ?
//                                            //        state.head.extra_max - len : copy);
//                                        }
//                                        if (state.flags & 0x0200) {
//                                            state.check = crc32(state.check, input, copy, next);
//                                        }
//                                        have -= copy;
//                                        next += copy;
//                                        state.length -= copy;
//                                    }
//                                    if (state.length) { break inf_leave; }
//                                }
//                                state.length = 0;
//                                state.mode = NAME;
//                                /* falls through */
//                            case NAME:
//                                if (state.flags & 0x0800) {
//                                    if (have === 0) { break inf_leave; }
//                                    copy = 0;
//                                    do {
//                                        // TODO: 2 or 1 bytes?
//                                        len = input[next + copy++];
//                                        /* use constant limit because in js we should not preallocate memory */
//                                        if (state.head && len &&
//                                            (state.length < 65536 /*state.head.name_max*/)) {
//                                            state.head.name += String.fromCharCode(len);
//                                        }
//                                    } while (len && copy < have);

//                                    if (state.flags & 0x0200) {
//                                        state.check = crc32(state.check, input, copy, next);
//                                    }
//                                    have -= copy;
//                                    next += copy;
//                                    if (len) { break inf_leave; }
//                                }
//                                else if (state.head) {
//                                    state.head.name = null;
//                                }
//                                state.length = 0;
//                                state.mode = COMMENT;
//                                /* falls through */
//                            case COMMENT:
//                                if (state.flags & 0x1000) {
//                                    if (have === 0) { break inf_leave; }
//                                    copy = 0;
//                                    do {
//                                        len = input[next + copy++];
//                                        /* use constant limit because in js we should not preallocate memory */
//                                        if (state.head && len &&
//                                            (state.length < 65536 /*state.head.comm_max*/)) {
//                                            state.head.comment += String.fromCharCode(len);
//                                        }
//                                    } while (len && copy < have);
//                                    if (state.flags & 0x0200) {
//                                        state.check = crc32(state.check, input, copy, next);
//                                    }
//                                    have -= copy;
//                                    next += copy;
//                                    if (len) { break inf_leave; }
//                                }
//                                else if (state.head) {
//                                    state.head.comment = null;
//                                }
//                                state.mode = HCRC;
//                                /* falls through */
//                            case HCRC:
//                                if (state.flags & 0x0200) {
//                                    //=== NEEDBITS(16); */
//                                    while (bits < 16) {
//                                        if (have === 0) { break inf_leave; }
//                                        have--;
//                                        hold += input[next++] << bits;
//                                        bits += 8;
//                                    }
//                                    //===//
//                                    if (hold !== (state.check & 0xffff)) {
//                                        strm.msg = 'header crc mismatch';
//                                        state.mode = BAD;
//                                        break;
//                                    }
//                                    //=== INITBITS();
//                                    hold = 0;
//                                    bits = 0;
//                                    //===//
//                                }
//                                if (state.head) {
//                                    state.head.hcrc = ((state.flags >> 9) & 1);
//                                    state.head.done = true;
//                                }
//                                strm.adler = state.check = 0 /*crc32(0L, Z_NULL, 0)*/;
//                                state.mode = TYPE;
//                                break;
//                            case DICTID:
//                                //=== NEEDBITS(32); */
//                                while (bits < 32) {
//                                    if (have === 0) { break inf_leave; }
//                                    have--;
//                                    hold += input[next++] << bits;
//                                    bits += 8;
//                                }
//                                //===//
//                                strm.adler = state.check = ZSWAP32(hold);
//                                //=== INITBITS();
//                                hold = 0;
//                                bits = 0;
//                                //===//
//                                state.mode = DICT;
//                                /* falls through */
//                            case DICT:
//                                if (state.havedict === 0) {
//                                    //--- RESTORE() ---
//                                    strm.next_out = put;
//                                    strm.avail_out = left;
//                                    strm.next_in = next;
//                                    strm.avail_in = have;
//                                    state.hold = hold;
//                                    state.bits = bits;
//                                    //---
//                                    return Z_NEED_DICT;
//                                }
//                                strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
//                                state.mode = TYPE;
//                                /* falls through */
//                            case TYPE:
//                                if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
//                                /* falls through */
//                            case TYPEDO:
//                                if (state.last) {
//                                    //--- BYTEBITS() ---//
//                                    hold >>>= bits & 7;
//                                    bits -= bits & 7;
//                                    //---//
//                                    state.mode = CHECK;
//                                    break;
//                                }
//                                //=== NEEDBITS(3); */
//                                while (bits < 3) {
//                                    if (have === 0) { break inf_leave; }
//                                    have--;
//                                    hold += input[next++] << bits;
//                                    bits += 8;
//                                }
//                                //===//
//                                state.last = (hold & 0x01)/*BITS(1)*/;
//                                //--- DROPBITS(1) ---//
//                                hold >>>= 1;
//                                bits -= 1;
//                                //---//

//                                switch ((hold & 0x03)/*BITS(2)*/) {
//                                    case 0:                             /* stored block */
//                                        //Tracev((stderr, "inflate:     stored block%s\n",
//                                        //        state.last ? " (last)" : ""));
//                                        state.mode = STORED;
//                                        break;
//                                    case 1:                             /* fixed block */
//                                        fixedtables(state);
//                                        //Tracev((stderr, "inflate:     fixed codes block%s\n",
//                                        //        state.last ? " (last)" : ""));
//                                        state.mode = LEN_;             /* decode codes */
//                                        if (flush === Z_TREES) {
//                                            //--- DROPBITS(2) ---//
//                                            hold >>>= 2;
//                                            bits -= 2;
//                                            //---//
//                                            break inf_leave;
//                                        }
//                                        break;
//                                    case 2:                             /* dynamic block */
//                                        //Tracev((stderr, "inflate:     dynamic codes block%s\n",
//                                        //        state.last ? " (last)" : ""));
//                                        state.mode = TABLE;
//                                        break;
//                                    case 3:
//                                        strm.msg = 'invalid block type';
//                                        state.mode = BAD;
//                                }
//                                //--- DROPBITS(2) ---//
//                                hold >>>= 2;
//                                bits -= 2;
//                                //---//
//                                break;
//                            case STORED:
//                                //--- BYTEBITS() ---// /* go to byte boundary */
//                                hold >>>= bits & 7;
//                                bits -= bits & 7;
//                                //---//
//                                //=== NEEDBITS(32); */
//                                while (bits < 32) {
//                                    if (have === 0) { break inf_leave; }
//                                    have--;
//                                    hold += input[next++] << bits;
//                                    bits += 8;
//                                }
//                                //===//
//                                if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
//                                    strm.msg = 'invalid stored block lengths';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                state.length = hold & 0xffff;
//                                //Tracev((stderr, "inflate:       stored length %u\n",
//                                //        state.length));
//                                //=== INITBITS();
//                                hold = 0;
//                                bits = 0;
//                                //===//
//                                state.mode = COPY_;
//                                if (flush === Z_TREES) { break inf_leave; }
//                                /* falls through */
//                            case COPY_:
//                                state.mode = COPY;
//                                /* falls through */
//                            case COPY:
//                                copy = state.length;
//                                if (copy) {
//                                    if (copy > have) { copy = have; }
//                                    if (copy > left) { copy = left; }
//                                    if (copy === 0) { break inf_leave; }
//                                    //--- zmemcpy(put, next, copy); ---
//                                    utils.arraySet(output, input, next, copy, put);
//                                    //---//
//                                    have -= copy;
//                                    next += copy;
//                                    left -= copy;
//                                    put += copy;
//                                    state.length -= copy;
//                                    break;
//                                }
//                                //Tracev((stderr, "inflate:       stored end\n"));
//                                state.mode = TYPE;
//                                break;
//                            case TABLE:
//                                //=== NEEDBITS(14); */
//                                while (bits < 14) {
//                                    if (have === 0) { break inf_leave; }
//                                    have--;
//                                    hold += input[next++] << bits;
//                                    bits += 8;
//                                }
//                                //===//
//                                state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
//                                //--- DROPBITS(5) ---//
//                                hold >>>= 5;
//                                bits -= 5;
//                                //---//
//                                state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
//                                //--- DROPBITS(5) ---//
//                                hold >>>= 5;
//                                bits -= 5;
//                                //---//
//                                state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
//                                //--- DROPBITS(4) ---//
//                                hold >>>= 4;
//                                bits -= 4;
//                                //---//
//                                //#ifndef PKZIP_BUG_WORKAROUND
//                                if (state.nlen > 286 || state.ndist > 30) {
//                                    strm.msg = 'too many length or distance symbols';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                //#endif
//                                //Tracev((stderr, "inflate:       table sizes ok\n"));
//                                state.have = 0;
//                                state.mode = LENLENS;
//                                /* falls through */
//                            case LENLENS:
//                                while (state.have < state.ncode) {
//                                    //=== NEEDBITS(3);
//                                    while (bits < 3) {
//                                        if (have === 0) { break inf_leave; }
//                                        have--;
//                                        hold += input[next++] << bits;
//                                        bits += 8;
//                                    }
//                                    //===//
//                                    state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
//                                    //--- DROPBITS(3) ---//
//                                    hold >>>= 3;
//                                    bits -= 3;
//                                    //---//
//                                }
//                                while (state.have < 19) {
//                                    state.lens[order[state.have++]] = 0;
//                                }
//                                // We have separate tables & no pointers. 2 commented lines below not needed.
//                                //state.next = state.codes;
//                                //state.lencode = state.next;
//                                // Switch to use dynamic table
//                                state.lencode = state.lendyn;
//                                state.lenbits = 7;

//                                opts = { bits: state.lenbits };
//                                ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
//                                state.lenbits = opts.bits;

//                                if (ret) {
//                                    strm.msg = 'invalid code lengths set';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                //Tracev((stderr, "inflate:       code lengths ok\n"));
//                                state.have = 0;
//                                state.mode = CODELENS;
//                                /* falls through */
//                            case CODELENS:
//                                while (state.have < state.nlen + state.ndist) {
//                                    for (; ;) {
//                                        here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
//                                        here_bits = here >>> 24;
//                                        here_op = (here >>> 16) & 0xff;
//                                        here_val = here & 0xffff;

//                                        if ((here_bits) <= bits) { break; }
//                                        //--- PULLBYTE() ---//
//                                        if (have === 0) { break inf_leave; }
//                                        have--;
//                                        hold += input[next++] << bits;
//                                        bits += 8;
//                                        //---//
//                                    }
//                                    if (here_val < 16) {
//                                        //--- DROPBITS(here.bits) ---//
//                                        hold >>>= here_bits;
//                                        bits -= here_bits;
//                                        //---//
//                                        state.lens[state.have++] = here_val;
//                                    }
//                                    else {
//                                        if (here_val === 16) {
//                                            //=== NEEDBITS(here.bits + 2);
//                                            n = here_bits + 2;
//                                            while (bits < n) {
//                                                if (have === 0) { break inf_leave; }
//                                                have--;
//                                                hold += input[next++] << bits;
//                                                bits += 8;
//                                            }
//                                            //===//
//                                            //--- DROPBITS(here.bits) ---//
//                                            hold >>>= here_bits;
//                                            bits -= here_bits;
//                                            //---//
//                                            if (state.have === 0) {
//                                                strm.msg = 'invalid bit length repeat';
//                                                state.mode = BAD;
//                                                break;
//                                            }
//                                            len = state.lens[state.have - 1];
//                                            copy = 3 + (hold & 0x03);//BITS(2);
//                                            //--- DROPBITS(2) ---//
//                                            hold >>>= 2;
//                                            bits -= 2;
//                                            //---//
//                                        }
//                                        else if (here_val === 17) {
//                                            //=== NEEDBITS(here.bits + 3);
//                                            n = here_bits + 3;
//                                            while (bits < n) {
//                                                if (have === 0) { break inf_leave; }
//                                                have--;
//                                                hold += input[next++] << bits;
//                                                bits += 8;
//                                            }
//                                            //===//
//                                            //--- DROPBITS(here.bits) ---//
//                                            hold >>>= here_bits;
//                                            bits -= here_bits;
//                                            //---//
//                                            len = 0;
//                                            copy = 3 + (hold & 0x07);//BITS(3);
//                                            //--- DROPBITS(3) ---//
//                                            hold >>>= 3;
//                                            bits -= 3;
//                                            //---//
//                                        }
//                                        else {
//                                            //=== NEEDBITS(here.bits + 7);
//                                            n = here_bits + 7;
//                                            while (bits < n) {
//                                                if (have === 0) { break inf_leave; }
//                                                have--;
//                                                hold += input[next++] << bits;
//                                                bits += 8;
//                                            }
//                                            //===//
//                                            //--- DROPBITS(here.bits) ---//
//                                            hold >>>= here_bits;
//                                            bits -= here_bits;
//                                            //---//
//                                            len = 0;
//                                            copy = 11 + (hold & 0x7f);//BITS(7);
//                                            //--- DROPBITS(7) ---//
//                                            hold >>>= 7;
//                                            bits -= 7;
//                                            //---//
//                                        }
//                                        if (state.have + copy > state.nlen + state.ndist) {
//                                            strm.msg = 'invalid bit length repeat';
//                                            state.mode = BAD;
//                                            break;
//                                        }
//                                        while (copy--) {
//                                            state.lens[state.have++] = len;
//                                        }
//                                    }
//                                }

//                                /* handle error breaks in while */
//                                if (state.mode === BAD) { break; }

//                                /* check for end-of-block code (better have one) */
//                                if (state.lens[256] === 0) {
//                                    strm.msg = 'invalid code -- missing end-of-block';
//                                    state.mode = BAD;
//                                    break;
//                                }

//                                /* build code tables -- note: do not change the lenbits or distbits
//                                   values here (9 and 6) without reading the comments in inftrees.h
//                                   concerning the ENOUGH constants, which depend on those values */
//                                state.lenbits = 9;

//                                opts = { bits: state.lenbits };
//                                ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
//                                // We have separate tables & no pointers. 2 commented lines below not needed.
//                                // state.next_index = opts.table_index;
//                                state.lenbits = opts.bits;
//                                // state.lencode = state.next;

//                                if (ret) {
//                                    strm.msg = 'invalid literal/lengths set';
//                                    state.mode = BAD;
//                                    break;
//                                }

//                                state.distbits = 6;
//                                //state.distcode.copy(state.codes);
//                                // Switch to use dynamic table
//                                state.distcode = state.distdyn;
//                                opts = { bits: state.distbits };
//                                ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
//                                // We have separate tables & no pointers. 2 commented lines below not needed.
//                                // state.next_index = opts.table_index;
//                                state.distbits = opts.bits;
//                                // state.distcode = state.next;

//                                if (ret) {
//                                    strm.msg = 'invalid distances set';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                //Tracev((stderr, 'inflate:       codes ok\n'));
//                                state.mode = LEN_;
//                                if (flush === Z_TREES) { break inf_leave; }
//                                /* falls through */
//                            case LEN_:
//                                state.mode = LEN;
//                                /* falls through */
//                            case LEN:
//                                if (have >= 6 && left >= 258) {
//                                    //--- RESTORE() ---
//                                    strm.next_out = put;
//                                    strm.avail_out = left;
//                                    strm.next_in = next;
//                                    strm.avail_in = have;
//                                    state.hold = hold;
//                                    state.bits = bits;
//                                    //---
//                                    inflate_fast(strm, _out);
//                                    //--- LOAD() ---
//                                    put = strm.next_out;
//                                    output = strm.output;
//                                    left = strm.avail_out;
//                                    next = strm.next_in;
//                                    input = strm.input;
//                                    have = strm.avail_in;
//                                    hold = state.hold;
//                                    bits = state.bits;
//                                    //---

//                                    if (state.mode === TYPE) {
//                                        state.back = -1;
//                                    }
//                                    break;
//                                }
//                                state.back = 0;
//                                for (; ;) {
//                                    here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
//                                    here_bits = here >>> 24;
//                                    here_op = (here >>> 16) & 0xff;
//                                    here_val = here & 0xffff;

//                                    if (here_bits <= bits) { break; }
//                                    //--- PULLBYTE() ---//
//                                    if (have === 0) { break inf_leave; }
//                                    have--;
//                                    hold += input[next++] << bits;
//                                    bits += 8;
//                                    //---//
//                                }
//                                if (here_op && (here_op & 0xf0) === 0) {
//                                    last_bits = here_bits;
//                                    last_op = here_op;
//                                    last_val = here_val;
//                                    for (; ;) {
//                                        here = state.lencode[last_val +
//                                                ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
//                                        here_bits = here >>> 24;
//                                        here_op = (here >>> 16) & 0xff;
//                                        here_val = here & 0xffff;

//                                        if ((last_bits + here_bits) <= bits) { break; }
//                                        //--- PULLBYTE() ---//
//                                        if (have === 0) { break inf_leave; }
//                                        have--;
//                                        hold += input[next++] << bits;
//                                        bits += 8;
//                                        //---//
//                                    }
//                                    //--- DROPBITS(last.bits) ---//
//                                    hold >>>= last_bits;
//                                    bits -= last_bits;
//                                    //---//
//                                    state.back += last_bits;
//                                }
//                                //--- DROPBITS(here.bits) ---//
//                                hold >>>= here_bits;
//                                bits -= here_bits;
//                                //---//
//                                state.back += here_bits;
//                                state.length = here_val;
//                                if (here_op === 0) {
//                                    //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
//                                    //        "inflate:         literal '%c'\n" :
//                                    //        "inflate:         literal 0x%02x\n", here.val));
//                                    state.mode = LIT;
//                                    break;
//                                }
//                                if (here_op & 32) {
//                                    //Tracevv((stderr, "inflate:         end of block\n"));
//                                    state.back = -1;
//                                    state.mode = TYPE;
//                                    break;
//                                }
//                                if (here_op & 64) {
//                                    strm.msg = 'invalid literal/length code';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                state.extra = here_op & 15;
//                                state.mode = LENEXT;
//                                /* falls through */
//                            case LENEXT:
//                                if (state.extra) {
//                                    //=== NEEDBITS(state.extra);
//                                    n = state.extra;
//                                    while (bits < n) {
//                                        if (have === 0) { break inf_leave; }
//                                        have--;
//                                        hold += input[next++] << bits;
//                                        bits += 8;
//                                    }
//                                    //===//
//                                    state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
//                                    //--- DROPBITS(state.extra) ---//
//                                    hold >>>= state.extra;
//                                    bits -= state.extra;
//                                    //---//
//                                    state.back += state.extra;
//                                }
//                                //Tracevv((stderr, "inflate:         length %u\n", state.length));
//                                state.was = state.length;
//                                state.mode = DIST;
//                                /* falls through */
//                            case DIST:
//                                for (; ;) {
//                                    here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
//                                    here_bits = here >>> 24;
//                                    here_op = (here >>> 16) & 0xff;
//                                    here_val = here & 0xffff;

//                                    if ((here_bits) <= bits) { break; }
//                                    //--- PULLBYTE() ---//
//                                    if (have === 0) { break inf_leave; }
//                                    have--;
//                                    hold += input[next++] << bits;
//                                    bits += 8;
//                                    //---//
//                                }
//                                if ((here_op & 0xf0) === 0) {
//                                    last_bits = here_bits;
//                                    last_op = here_op;
//                                    last_val = here_val;
//                                    for (; ;) {
//                                        here = state.distcode[last_val +
//                                                ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
//                                        here_bits = here >>> 24;
//                                        here_op = (here >>> 16) & 0xff;
//                                        here_val = here & 0xffff;

//                                        if ((last_bits + here_bits) <= bits) { break; }
//                                        //--- PULLBYTE() ---//
//                                        if (have === 0) { break inf_leave; }
//                                        have--;
//                                        hold += input[next++] << bits;
//                                        bits += 8;
//                                        //---//
//                                    }
//                                    //--- DROPBITS(last.bits) ---//
//                                    hold >>>= last_bits;
//                                    bits -= last_bits;
//                                    //---//
//                                    state.back += last_bits;
//                                }
//                                //--- DROPBITS(here.bits) ---//
//                                hold >>>= here_bits;
//                                bits -= here_bits;
//                                //---//
//                                state.back += here_bits;
//                                if (here_op & 64) {
//                                    strm.msg = 'invalid distance code';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                state.offset = here_val;
//                                state.extra = (here_op) & 15;
//                                state.mode = DISTEXT;
//                                /* falls through */
//                            case DISTEXT:
//                                if (state.extra) {
//                                    //=== NEEDBITS(state.extra);
//                                    n = state.extra;
//                                    while (bits < n) {
//                                        if (have === 0) { break inf_leave; }
//                                        have--;
//                                        hold += input[next++] << bits;
//                                        bits += 8;
//                                    }
//                                    //===//
//                                    state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
//                                    //--- DROPBITS(state.extra) ---//
//                                    hold >>>= state.extra;
//                                    bits -= state.extra;
//                                    //---//
//                                    state.back += state.extra;
//                                }
//                                //#ifdef INFLATE_STRICT
//                                if (state.offset > state.dmax) {
//                                    strm.msg = 'invalid distance too far back';
//                                    state.mode = BAD;
//                                    break;
//                                }
//                                //#endif
//                                //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
//                                state.mode = MATCH;
//                                /* falls through */
//                            case MATCH:
//                                if (left === 0) { break inf_leave; }
//                                copy = _out - left;
//                                if (state.offset > copy) {         /* copy from window */
//                                    copy = state.offset - copy;
//                                    if (copy > state.whave) {
//                                        if (state.sane) {
//                                            strm.msg = 'invalid distance too far back';
//                                            state.mode = BAD;
//                                            break;
//                                        }
//                                        // (!) This block is disabled in zlib defailts,
//                                        // don't enable it for binary compatibility
//                                        //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                                        //          Trace((stderr, "inflate.c too far\n"));
//                                        //          copy -= state.whave;
//                                        //          if (copy > state.length) { copy = state.length; }
//                                        //          if (copy > left) { copy = left; }
//                                        //          left -= copy;
//                                        //          state.length -= copy;
//                                        //          do {
//                                        //            output[put++] = 0;
//                                        //          } while (--copy);
//                                        //          if (state.length === 0) { state.mode = LEN; }
//                                        //          break;
//                                        //#endif
//                                    }
//                                    if (copy > state.wnext) {
//                                        copy -= state.wnext;
//                                        from = state.wsize - copy;
//                                    }
//                                    else {
//                                        from = state.wnext - copy;
//                                    }
//                                    if (copy > state.length) { copy = state.length; }
//                                    from_source = state.window;
//                                }
//                                else {                              /* copy from output */
//                                    from_source = output;
//                                    from = put - state.offset;
//                                    copy = state.length;
//                                }
//                                if (copy > left) { copy = left; }
//                                left -= copy;
//                                state.length -= copy;
//                                do {
//                                    output[put++] = from_source[from++];
//                                } while (--copy);
//                                if (state.length === 0) { state.mode = LEN; }
//                                break;
//                            case LIT:
//                                if (left === 0) { break inf_leave; }
//                                output[put++] = state.length;
//                                left--;
//                                state.mode = LEN;
//                                break;
//                            case CHECK:
//                                if (state.wrap) {
//                                    //=== NEEDBITS(32);
//                                    while (bits < 32) {
//                                        if (have === 0) { break inf_leave; }
//                                        have--;
//                                        // Use '|' insdead of '+' to make sure that result is signed
//                                        hold |= input[next++] << bits;
//                                        bits += 8;
//                                    }
//                                    //===//
//                                    _out -= left;
//                                    strm.total_out += _out;
//                                    state.total += _out;
//                                    if (_out) {
//                                        strm.adler = state.check =
//                                            /*UPDATE(state.check, put - _out, _out);*/
//                                            (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

//                                    }
//                                    _out = left;
//                                    // NB: crc32 stored as signed 32-bit int, ZSWAP32 returns signed too
//                                    if ((state.flags ? hold : ZSWAP32(hold)) !== state.check) {
//                                        strm.msg = 'incorrect data check';
//                                        state.mode = BAD;
//                                        break;
//                                    }
//                                    //=== INITBITS();
//                                    hold = 0;
//                                    bits = 0;
//                                    //===//
//                                    //Tracev((stderr, "inflate:   check matches trailer\n"));
//                                }
//                                state.mode = LENGTH;
//                                /* falls through */
//                            case LENGTH:
//                                if (state.wrap && state.flags) {
//                                    //=== NEEDBITS(32);
//                                    while (bits < 32) {
//                                        if (have === 0) { break inf_leave; }
//                                        have--;
//                                        hold += input[next++] << bits;
//                                        bits += 8;
//                                    }
//                                    //===//
//                                    if (hold !== (state.total & 0xffffffff)) {
//                                        strm.msg = 'incorrect length check';
//                                        state.mode = BAD;
//                                        break;
//                                    }
//                                    //=== INITBITS();
//                                    hold = 0;
//                                    bits = 0;
//                                    //===//
//                                    //Tracev((stderr, "inflate:   length matches trailer\n"));
//                                }
//                                state.mode = DONE;
//                                /* falls through */
//                            case DONE:
//                                ret = Z_STREAM_END;
//                                break inf_leave;
//                            case BAD:
//                                ret = Z_DATA_ERROR;
//                                break inf_leave;
//                            case MEM:
//                                return Z_MEM_ERROR;
//                            case SYNC:
//                                /* falls through */
//                            default:
//                                return Z_STREAM_ERROR;
//                        }
//                    }

//                // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

//                /*
//                   Return from inflate(), updating the total counts and the check value.
//                   If there was no progress during the inflate() call, return a buffer
//                   error.  Call updatewindow() to create and/or update the window state.
//                   Note: a memory error from inflate() is non-recoverable.
//                 */

//                //--- RESTORE() ---
//                strm.next_out = put;
//                strm.avail_out = left;
//                strm.next_in = next;
//                strm.avail_in = have;
//                state.hold = hold;
//                state.bits = bits;
//                //---

//                if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
//                                    (state.mode < CHECK || flush !== Z_FINISH))) {
//                    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
//                        state.mode = MEM;
//                        return Z_MEM_ERROR;
//                    }
//                }
//                _in -= strm.avail_in;
//                _out -= strm.avail_out;
//                strm.total_in += _in;
//                strm.total_out += _out;
//                state.total += _out;
//                if (state.wrap && _out) {
//                    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
//                      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
//                }
//                strm.data_type = state.bits + (state.last ? 64 : 0) +
//                                  (state.mode === TYPE ? 128 : 0) +
//                                  (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
//                if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
//                    ret = Z_BUF_ERROR;
//                }
//                return ret;
//            }

//            function inflateEnd(strm) {

//                if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
//                    return Z_STREAM_ERROR;
//                }

//                var state = strm.state;
//                if (state.window) {
//                    state.window = null;
//                }
//                strm.state = null;
//                return Z_OK;
//            }

//            function inflateGetHeader(strm, head) {
//                var state;

//                /* check state */
//                if (!strm || !strm.state) { return Z_STREAM_ERROR; }
//                state = strm.state;
//                if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }

//                /* save header structure */
//                state.head = head;
//                head.done = false;
//                return Z_OK;
//            }


//            exports.inflateReset = inflateReset;
//            exports.inflateReset2 = inflateReset2;
//            exports.inflateResetKeep = inflateResetKeep;
//            exports.inflateInit = inflateInit;
//            exports.inflateInit2 = inflateInit2;
//            exports.inflate = inflate;
//            exports.inflateEnd = inflateEnd;
//            exports.inflateGetHeader = inflateGetHeader;
//            exports.inflateInfo = 'pako inflate (from Nodeca project)';

//            /* Not implemented
//            exports.inflateCopy = inflateCopy;
//            exports.inflateGetDictionary = inflateGetDictionary;
//            exports.inflateMark = inflateMark;
//            exports.inflatePrime = inflatePrime;
//            exports.inflateSetDictionary = inflateSetDictionary;
//            exports.inflateSync = inflateSync;
//            exports.inflateSyncPoint = inflateSyncPoint;
//            exports.inflateUndermine = inflateUndermine;
//            */
//        }, { "../utils/common": 2, "./adler32": 4, "./crc32": 6, "./inffast": 8, "./inftrees": 10 }], 10: [function (_dereq_, module, exports) {
//            'use strict';


//            var utils = _dereq_('../utils/common');

//            var MAXBITS = 15;
//            var ENOUGH_LENS = 852;
//            var ENOUGH_DISTS = 592;
//            //var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

//            var CODES = 0;
//            var LENS = 1;
//            var DISTS = 2;

//            var lbase = [ /* Length codes 257..285 base */
//              3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
//              35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
//            ];

//            var lext = [ /* Length codes 257..285 extra */
//              16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
//              19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
//            ];

//            var dbase = [ /* Distance codes 0..29 base */
//              1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
//              257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
//              8193, 12289, 16385, 24577, 0, 0
//            ];

//            var dext = [ /* Distance codes 0..29 extra */
//              16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
//              23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
//              28, 28, 29, 29, 64, 64
//            ];

//            module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
//                var bits = opts.bits;
//                //here = opts.here; /* table entry for duplication */

//                var len = 0;               /* a code's length in bits */
//                var sym = 0;               /* index of code symbols */
//                var min = 0, max = 0;          /* minimum and maximum code lengths */
//                var root = 0;              /* number of index bits for root table */
//                var curr = 0;              /* number of index bits for current table */
//                var drop = 0;              /* code bits to drop for sub-table */
//                var left = 0;                   /* number of prefix codes available */
//                var used = 0;              /* code entries in table used */
//                var huff = 0;              /* Huffman code */
//                var incr;              /* for incrementing code, index */
//                var fill;              /* index for replicating entries */
//                var low;               /* low bits for current root entry */
//                var mask;              /* mask for low root bits */
//                var next;             /* next available space in table */
//                var base = null;     /* base value table to use */
//                var base_index = 0;
//                //  var shoextra;    /* extra bits table to use */
//                var end;                    /* use base and extra for symbol > end */
//                var count = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
//                var offs = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
//                var extra = null;
//                var extra_index = 0;

//                var here_bits, here_op, here_val;

//                /*
//                 Process a set of code lengths to create a canonical Huffman code.  The
//                 code lengths are lens[0..codes-1].  Each length corresponds to the
//                 symbols 0..codes-1.  The Huffman code is generated by first sorting the
//                 symbols by length from short to long, and retaining the symbol order
//                 for codes with equal lengths.  Then the code starts with all zero bits
//                 for the first code of the shortest length, and the codes are integer
//                 increments for the same length, and zeros are appended as the length
//                 increases.  For the deflate format, these bits are stored backwards
//                 from their more natural integer increment ordering, and so when the
//                 decoding tables are built in the large loop below, the integer codes
//                 are incremented backwards.
              
//                 This routine assumes, but does not check, that all of the entries in
//                 lens[] are in the range 0..MAXBITS.  The caller must assure this.
//                 1..MAXBITS is interpreted as that code length.  zero means that that
//                 symbol does not occur in this code.
              
//                 The codes are sorted by computing a count of codes for each length,
//                 creating from that a table of starting indices for each length in the
//                 sorted table, and then entering the symbols in order in the sorted
//                 table.  The sorted table is work[], with that space being provided by
//                 the caller.
              
//                 The length counts are used for other purposes as well, i.e. finding
//                 the minimum and maximum length codes, determining if there are any
//                 codes at all, checking for a valid set of lengths, and looking ahead
//                 at length counts to determine sub-table sizes when building the
//                 decoding tables.
//                 */

//                /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
//                for (len = 0; len <= MAXBITS; len++) {
//                    count[len] = 0;
//                }
//                for (sym = 0; sym < codes; sym++) {
//                    count[lens[lens_index + sym]]++;
//                }

//                /* bound code lengths, force root to be within code lengths */
//                root = bits;
//                for (max = MAXBITS; max >= 1; max--) {
//                    if (count[max] !== 0) { break; }
//                }
//                if (root > max) {
//                    root = max;
//                }
//                if (max === 0) {                     /* no symbols to code at all */
//                    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
//                    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
//                    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
//                    table[table_index++] = (1 << 24) | (64 << 16) | 0;


//                    //table.op[opts.table_index] = 64;
//                    //table.bits[opts.table_index] = 1;
//                    //table.val[opts.table_index++] = 0;
//                    table[table_index++] = (1 << 24) | (64 << 16) | 0;

//                    opts.bits = 1;
//                    return 0;     /* no symbols, but wait for decoding to report error */
//                }
//                for (min = 1; min < max; min++) {
//                    if (count[min] !== 0) { break; }
//                }
//                if (root < min) {
//                    root = min;
//                }

//                /* check for an over-subscribed or incomplete set of lengths */
//                left = 1;
//                for (len = 1; len <= MAXBITS; len++) {
//                    left <<= 1;
//                    left -= count[len];
//                    if (left < 0) {
//                        return -1;
//                    }        /* over-subscribed */
//                }
//                if (left > 0 && (type === CODES || max !== 1)) {
//                    return -1;                      /* incomplete set */
//                }

//                /* generate offsets into symbol table for each length for sorting */
//                offs[1] = 0;
//                for (len = 1; len < MAXBITS; len++) {
//                    offs[len + 1] = offs[len] + count[len];
//                }

//                /* sort symbols by length, by symbol order within each length */
//                for (sym = 0; sym < codes; sym++) {
//                    if (lens[lens_index + sym] !== 0) {
//                        work[offs[lens[lens_index + sym]]++] = sym;
//                    }
//                }

//                /*
//                 Create and fill in decoding tables.  In this loop, the table being
//                 filled is at next and has curr index bits.  The code being used is huff
//                 with length len.  That code is converted to an index by dropping drop
//                 bits off of the bottom.  For codes where len is less than drop + curr,
//                 those top drop + curr - len bits are incremented through all values to
//                 fill the table with replicated entries.
              
//                 root is the number of index bits for the root table.  When len exceeds
//                 root, sub-tables are created pointed to by the root entry with an index
//                 of the low root bits of huff.  This is saved in low to check for when a
//                 new sub-table should be started.  drop is zero when the root table is
//                 being filled, and drop is root when sub-tables are being filled.
              
//                 When a new sub-table is needed, it is necessary to look ahead in the
//                 code lengths to determine what size sub-table is needed.  The length
//                 counts are used for this, and so count[] is decremented as codes are
//                 entered in the tables.
              
//                 used keeps track of how many table entries have been allocated from the
//                 provided *table space.  It is checked for LENS and DIST tables against
//                 the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
//                 the initial root table size constants.  See the comments in inftrees.h
//                 for more information.
              
//                 sym increments through all symbols, and the loop terminates when
//                 all codes of length max, i.e. all codes, have been processed.  This
//                 routine permits incomplete codes, so another loop after this one fills
//                 in the rest of the decoding tables with invalid code markers.
//                 */

//                /* set up for code type */
//                // poor man optimization - use if-else instead of switch,
//                // to avoid deopts in old v8
//                if (type === CODES) {
//                    base = extra = work;    /* dummy value--not used */
//                    end = 19;
//                } else if (type === LENS) {
//                    base = lbase;
//                    base_index -= 257;
//                    extra = lext;
//                    extra_index -= 257;
//                    end = 256;
//                } else {                    /* DISTS */
//                    base = dbase;
//                    extra = dext;
//                    end = -1;
//                }

//                /* initialize opts for loop */
//                huff = 0;                   /* starting code */
//                sym = 0;                    /* starting code symbol */
//                len = min;                  /* starting code length */
//                next = table_index;              /* current table to fill in */
//                curr = root;                /* current table index bits */
//                drop = 0;                   /* current bits to drop from code for index */
//                low = -1;                   /* trigger new sub-table when len > root */
//                used = 1 << root;          /* use root table entries */
//                mask = used - 1;            /* mask for comparing low */

//                /* check available table space */
//                if ((type === LENS && used > ENOUGH_LENS) ||
//                  (type === DISTS && used > ENOUGH_DISTS)) {
//                    return 1;
//                }

//                var i = 0;
//                /* process all codes and make table entries */
//                for (; ;) {
//                    i++;
//                    /* create table entry */
//                    here_bits = len - drop;
//                    if (work[sym] < end) {
//                        here_op = 0;
//                        here_val = work[sym];
//                    }
//                    else if (work[sym] > end) {
//                        here_op = extra[extra_index + work[sym]];
//                        here_val = base[base_index + work[sym]];
//                    }
//                    else {
//                        here_op = 32 + 64;         /* end of block */
//                        here_val = 0;
//                    }

//                    /* replicate for those indices with low len bits equal to huff */
//                    incr = 1 << (len - drop);
//                    fill = 1 << curr;
//                    min = fill;                 /* save offset to next table */
//                    do {
//                        fill -= incr;
//                        table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val | 0;
//                    } while (fill !== 0);

//                    /* backwards increment the len-bit code huff */
//                    incr = 1 << (len - 1);
//                    while (huff & incr) {
//                        incr >>= 1;
//                    }
//                    if (incr !== 0) {
//                        huff &= incr - 1;
//                        huff += incr;
//                    } else {
//                        huff = 0;
//                    }

//                    /* go to next symbol, update count, len */
//                    sym++;
//                    if (--count[len] === 0) {
//                        if (len === max) { break; }
//                        len = lens[lens_index + work[sym]];
//                    }

//                    /* create new sub-table if needed */
//                    if (len > root && (huff & mask) !== low) {
//                        /* if first time, transition to sub-tables */
//                        if (drop === 0) {
//                            drop = root;
//                        }

//                        /* increment past last table */
//                        next += min;            /* here min is 1 << curr */

//                        /* determine length of next table */
//                        curr = len - drop;
//                        left = 1 << curr;
//                        while (curr + drop < max) {
//                            left -= count[curr + drop];
//                            if (left <= 0) { break; }
//                            curr++;
//                            left <<= 1;
//                        }

//                        /* check for enough space */
//                        used += 1 << curr;
//                        if ((type === LENS && used > ENOUGH_LENS) ||
//                          (type === DISTS && used > ENOUGH_DISTS)) {
//                            return 1;
//                        }

//                        /* point entry in root table to sub-table */
//                        low = huff & mask;
//                        /*table.op[low] = curr;
//                        table.bits[low] = root;
//                        table.val[low] = next - opts.table_index;*/
//                        table[low] = (root << 24) | (curr << 16) | (next - table_index) | 0;
//                    }
//                }

//                /* fill in remaining table entry if code is incomplete (guaranteed to have
//                 at most one remaining entry, since if the code is incomplete, the
//                 maximum code length that was allowed to get this far is one bit) */
//                if (huff !== 0) {
//                    //table.op[next + huff] = 64;            /* invalid code marker */
//                    //table.bits[next + huff] = len - drop;
//                    //table.val[next + huff] = 0;
//                    table[next + huff] = ((len - drop) << 24) | (64 << 16) | 0;
//                }

//                /* set return parameters */
//                //opts.table_index += used;
//                opts.bits = root;
//                return 0;
//            };

//        }, { "../utils/common": 2 }], 11: [function (_dereq_, module, exports) {
//            'use strict';

//            module.exports = {
//                '2': 'need dictionary',     /* Z_NEED_DICT       2  */
//                '1': 'stream end',          /* Z_STREAM_END      1  */
//                '0': '',                    /* Z_OK              0  */
//                '-1': 'file error',          /* Z_ERRNO         (-1) */
//                '-2': 'stream error',        /* Z_STREAM_ERROR  (-2) */
//                '-3': 'data error',          /* Z_DATA_ERROR    (-3) */
//                '-4': 'insufficient memory', /* Z_MEM_ERROR     (-4) */
//                '-5': 'buffer error',        /* Z_BUF_ERROR     (-5) */
//                '-6': 'incompatible version' /* Z_VERSION_ERROR (-6) */
//            };
//        }, {}], 12: [function (_dereq_, module, exports) {
//            'use strict';


//            function ZStream() {
//                /* next input byte */
//                this.input = null; // JS specific, because we have no pointers
//                this.next_in = 0;
//                /* number of bytes available at input */
//                this.avail_in = 0;
//                /* total number of input bytes read so far */
//                this.total_in = 0;
//                /* next output byte should be put there */
//                this.output = null; // JS specific, because we have no pointers
//                this.next_out = 0;
//                /* remaining free space at output */
//                this.avail_out = 0;
//                /* total number of bytes output so far */
//                this.total_out = 0;
//                /* last error message, NULL if no error */
//                this.msg = ''/*Z_NULL*/;
//                /* not visible by applications */
//                this.state = null;
//                /* best guess about the data type: binary or text */
//                this.data_type = 2/*Z_UNKNOWN*/;
//                /* adler32 value of the uncompressed data */
//                this.adler = 0;
//            }

//            module.exports = ZStream;
//        }, {}]
//    }, {}, [1])
//    (1)
//});
////
///* pako 0.2.5 nodeca/pako */
//!function (e) {
//    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
//    else if ("function" == typeof define && define.amd) define([], e); else { var f; "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.pako2 = e() }
//}
//  (function () {
//      var define, module, exports; return (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); throw new Error("Cannot find module '" + o + "'") } var f = n[o] = { exports: {} }; t[o][0].call(f.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e) }, f, f.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++) s(r[o]); return s })({
//          1: [function (_dereq_, module, exports) {
//              'use strict';


//              var zlib_deflate = _dereq_('./zlib/deflate.js');
//              var utils = _dereq_('./utils/common');
//              var strings = _dereq_('./utils/strings');
//              var msg = _dereq_('./zlib/messages');
//              var zstream = _dereq_('./zlib/zstream');


//              /* Public constants ==========================================================*/
//              /* ===========================================================================*/

//              var Z_NO_FLUSH = 0;
//              var Z_FINISH = 4;

//              var Z_OK = 0;
//              var Z_STREAM_END = 1;

//              var Z_DEFAULT_COMPRESSION = -1;

//              var Z_DEFAULT_STRATEGY = 0;

//              var Z_DEFLATED = 8;

//              /* ===========================================================================*/


//              /**
//               * class Deflate
//               *
//               * Generic JS-style wrapper for zlib calls. If you don't need
//               * streaming behaviour - use more simple functions: [[deflate]],
//               * [[deflateRaw]] and [[gzip]].
//               **/

//              /* internal
//               * Deflate.chunks -> Array
//               *
//               * Chunks of output data, if [[Deflate#onData]] not overriden.
//               **/

//              /**
//               * Deflate.result -> Uint8Array|Array
//               *
//               * Compressed result, generated by default [[Deflate#onData]]
//               * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
//               * (call [[Deflate#push]] with `Z_FINISH` / `true` param).
//               **/

//              /**
//               * Deflate.err -> Number
//               *
//               * Error code after deflate finished. 0 (Z_OK) on success.
//               * You will not need it in real life, because deflate errors
//               * are possible only on wrong options or bad `onData` / `onEnd`
//               * custom handlers.
//               **/

//              /**
//               * Deflate.msg -> String
//               *
//               * Error message, if [[Deflate.err]] != 0
//               **/


//              /**
//               * new Deflate(options)
//               * - options (Object): zlib deflate options.
//               *
//               * Creates new deflator instance with specified params. Throws exception
//               * on bad params. Supported options:
//               *
//               * - `level`
//               * - `windowBits`
//               * - `memLevel`
//               * - `strategy`
//               *
//               * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
//               * for more information on these.
//               *
//               * Additional options, for internal needs:
//               *
//               * - `chunkSize` - size of generated data chunks (16K by default)
//               * - `raw` (Boolean) - do raw deflate
//               * - `gzip` (Boolean) - create gzip wrapper
//               * - `to` (String) - if equal to 'string', then result will be "binary string"
//               *    (each char code [0..255])
//               * - `header` (Object) - custom header for gzip
//               *   - `text` (Boolean) - true if compressed data believed to be text
//               *   - `time` (Number) - modification time, unix timestamp
//               *   - `os` (Number) - operation system code
//               *   - `extra` (Array) - array of bytes with extra data (max 65536)
//               *   - `name` (String) - file name (binary string)
//               *   - `comment` (String) - comment (binary string)
//               *   - `hcrc` (Boolean) - true if header crc should be added
//               *
//               * ##### Example:
//               *
//               * ```javascript
//               * var pako = require('pako')
//               *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
//               *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
//               *
//               * var deflate = new pako.Deflate({ level: 3});
//               *
//               * deflate.push(chunk1, false);
//               * deflate.push(chunk2, true);  // true -> last chunk
//               *
//               * if (deflate.err) { throw new Error(deflate.err); }
//               *
//               * console.log(deflate.result);
//               * ```
//               **/
//              var Deflate = function (options) {

//                  this.options = utils.assign({
//                      level: Z_DEFAULT_COMPRESSION,
//                      method: Z_DEFLATED,
//                      chunkSize: 16384,
//                      windowBits: 15,
//                      memLevel: 8,
//                      strategy: Z_DEFAULT_STRATEGY,
//                      to: ''
//                  }, options || {});

//                  var opt = this.options;

//                  if (opt.raw && (opt.windowBits > 0)) {
//                      opt.windowBits = -opt.windowBits;
//                  }

//                  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
//                      opt.windowBits += 16;
//                  }

//                  this.err = 0;      // error code, if happens (0 = Z_OK)
//                  this.msg = '';     // error message
//                  this.ended = false;  // used to avoid multiple onEnd() calls
//                  this.chunks = [];     // chunks of compressed data

//                  this.strm = new zstream();
//                  this.strm.avail_out = 0;

//                  var status = zlib_deflate.deflateInit2(
//                    this.strm,
//                    opt.level,
//                    opt.method,
//                    opt.windowBits,
//                    opt.memLevel,
//                    opt.strategy
//                  );

//                  if (status !== Z_OK) {
//                      throw new Error(msg[status]);
//                  }

//                  if (opt.header) {
//                      zlib_deflate.deflateSetHeader(this.strm, opt.header);
//                  }
//              };

//              /**
//               * Deflate#push(data[, mode]) -> Boolean
//               * - data (Uint8Array|Array|String): input data. Strings will be converted to
//               *   utf8 byte sequence.
//               * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
//               *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` meansh Z_FINISH.
//               *
//               * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
//               * new compressed chunks. Returns `true` on success. The last data block must have
//               * mode Z_FINISH (or `true`). That flush internal pending buffers and call
//               * [[Deflate#onEnd]].
//               *
//               * On fail call [[Deflate#onEnd]] with error code and return false.
//               *
//               * We strongly recommend to use `Uint8Array` on input for best speed (output
//               * array format is detected automatically). Also, don't skip last param and always
//               * use the same type in your code (boolean or number). That will improve JS speed.
//               *
//               * For regular `Array`-s make sure all elements are [0..255].
//               *
//               * ##### Example
//               *
//               * ```javascript
//               * push(chunk, false); // push one of data chunks
//               * ...
//               * push(chunk, true);  // push last chunk
//               * ```
//               **/
//              Deflate.prototype.push = function (data, mode) {
//                  var strm = this.strm;
//                  var chunkSize = this.options.chunkSize;
//                  var status, _mode;

//                  if (this.ended) { return false; }

//                  _mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH : Z_NO_FLUSH);

//                  // Convert data if needed
//                  if (typeof data === 'string') {
//                      // If we need to compress text, change encoding to utf8.
//                      strm.input = strings.string2buf(data);
//                  } else {
//                      strm.input = data;
//                  }

//                  strm.next_in = 0;
//                  strm.avail_in = strm.input.length;

//                  do {
//                      if (strm.avail_out === 0) {
//                          strm.output = new utils.Buf8(chunkSize);
//                          strm.next_out = 0;
//                          strm.avail_out = chunkSize;
//                      }
//                      status = zlib_deflate.deflate(strm, _mode);    /* no bad return value */

//                      if (status !== Z_STREAM_END && status !== Z_OK) {
//                          this.onEnd(status);
//                          this.ended = true;
//                          return false;
//                      }
//                      if (strm.avail_out === 0 || (strm.avail_in === 0 && _mode === Z_FINISH)) {
//                          if (this.options.to === 'string') {
//                              this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
//                          } else {
//                              this.onData(utils.shrinkBuf(strm.output, strm.next_out));
//                          }
//                      }
//                  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);

//                  // Finalize on the last chunk.
//                  if (_mode === Z_FINISH) {
//                      status = zlib_deflate.deflateEnd(this.strm);
//                      this.onEnd(status);
//                      this.ended = true;
//                      return status === Z_OK;
//                  }

//                  return true;
//              };


//              /**
//               * Deflate#onData(chunk) -> Void
//               * - chunk (Uint8Array|Array|String): ouput data. Type of array depends
//               *   on js engine support. When string output requested, each chunk
//               *   will be string.
//               *
//               * By default, stores data blocks in `chunks[]` property and glue
//               * those in `onEnd`. Override this handler, if you need another behaviour.
//               **/
//              Deflate.prototype.onData = function (chunk) {
//                  this.chunks.push(chunk);
//              };


//              /**
//               * Deflate#onEnd(status) -> Void
//               * - status (Number): deflate status. 0 (Z_OK) on success,
//               *   other if not.
//               *
//               * Called once after you tell deflate that input stream complete
//               * or error happenned. By default - join collected chunks,
//               * free memory and fill `results` / `err` properties.
//               **/
//              Deflate.prototype.onEnd = function (status) {
//                  // On success - join
//                  if (status === Z_OK) {
//                      if (this.options.to === 'string') {
//                          this.result = this.chunks.join('');
//                      } else {
//                          this.result = utils.flattenChunks(this.chunks);
//                      }
//                  }
//                  this.chunks = [];
//                  this.err = status;
//                  this.msg = this.strm.msg;
//              };


//              /**
//               * deflate(data[, options]) -> Uint8Array|Array|String
//               * - data (Uint8Array|Array|String): input data to compress.
//               * - options (Object): zlib deflate options.
//               *
//               * Compress `data` with deflate alrorythm and `options`.
//               *
//               * Supported options are:
//               *
//               * - level
//               * - windowBits
//               * - memLevel
//               * - strategy
//               *
//               * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
//               * for more information on these.
//               *
//               * Sugar (options):
//               *
//               * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
//               *   negative windowBits implicitly.
//               * - `to` (String) - if equal to 'string', then result will be "binary string"
//               *    (each char code [0..255])
//               *
//               * ##### Example:
//               *
//               * ```javascript
//               * var pako = require('pako')
//               *   , data = Uint8Array([1,2,3,4,5,6,7,8,9]);
//               *
//               * console.log(pako.deflate(data));
//               * ```
//               **/
//              function deflate(input, options) {
//                  var deflator = new Deflate(options);

//                  deflator.push(input, true);

//                  // That will never happens, if you don't cheat with options :)
//                  if (deflator.err) { throw deflator.msg; }

//                  return deflator.result;
//              }


//              /**
//               * deflateRaw(data[, options]) -> Uint8Array|Array|String
//               * - data (Uint8Array|Array|String): input data to compress.
//               * - options (Object): zlib deflate options.
//               *
//               * The same as [[deflate]], but creates raw data, without wrapper
//               * (header and adler32 crc).
//               **/
//              function deflateRaw(input, options) {
//                  options = options || {};
//                  options.raw = true;
//                  return deflate(input, options);
//              }


//              /**
//               * gzip(data[, options]) -> Uint8Array|Array|String
//               * - data (Uint8Array|Array|String): input data to compress.
//               * - options (Object): zlib deflate options.
//               *
//               * The same as [[deflate]], but create gzip wrapper instead of
//               * deflate one.
//               **/
//              function gzip(input, options) {
//                  options = options || {};
//                  options.gzip = true;
//                  return deflate(input, options);
//              }


//              exports.Deflate = Deflate;
//              exports.deflate = deflate;
//              exports.deflateRaw = deflateRaw;
//              exports.gzip = gzip;
//          }, { "./utils/common": 2, "./utils/strings": 3, "./zlib/deflate.js": 6, "./zlib/messages": 7, "./zlib/zstream": 9 }], 2: [function (_dereq_, module, exports) {
//              'use strict';


//              var TYPED_OK = (typeof Uint8Array !== 'undefined') &&
//                              (typeof Uint16Array !== 'undefined') &&
//                              (typeof Int32Array !== 'undefined');


//              exports.assign = function (obj /*from1, from2, from3, ...*/) {
//                  var sources = Array.prototype.slice.call(arguments, 1);
//                  while (sources.length) {
//                      var source = sources.shift();
//                      if (!source) { continue; }

//                      if (typeof (source) !== 'object') {
//                          throw new TypeError(source + 'must be non-object');
//                      }

//                      for (var p in source) {
//                          if (source.hasOwnProperty(p)) {
//                              obj[p] = source[p];
//                          }
//                      }
//                  }

//                  return obj;
//              };


//              // reduce buffer size, avoiding mem copy
//              exports.shrinkBuf = function (buf, size) {
//                  if (buf.length === size) { return buf; }
//                  if (buf.subarray) { return buf.subarray(0, size); }
//                  buf.length = size;
//                  return buf;
//              };


//              var fnTyped = {
//                  arraySet: function (dest, src, src_offs, len, dest_offs) {
//                      if (src.subarray && dest.subarray) {
//                          dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
//                          return;
//                      }
//                      // Fallback to ordinary array
//                      for (var i = 0; i < len; i++) {
//                          dest[dest_offs + i] = src[src_offs + i];
//                      }
//                  },
//                  // Join array of chunks to single array.
//                  flattenChunks: function (chunks) {
//                      var i, l, len, pos, chunk, result;

//                      // calculate data length
//                      len = 0;
//                      for (i = 0, l = chunks.length; i < l; i++) {
//                          len += chunks[i].length;
//                      }

//                      // join chunks
//                      result = new Uint8Array(len);
//                      pos = 0;
//                      for (i = 0, l = chunks.length; i < l; i++) {
//                          chunk = chunks[i];
//                          result.set(chunk, pos);
//                          pos += chunk.length;
//                      }

//                      return result;
//                  }
//              };

//              var fnUntyped = {
//                  arraySet: function (dest, src, src_offs, len, dest_offs) {
//                      for (var i = 0; i < len; i++) {
//                          dest[dest_offs + i] = src[src_offs + i];
//                      }
//                  },
//                  // Join array of chunks to single array.
//                  flattenChunks: function (chunks) {
//                      return [].concat.apply([], chunks);
//                  }
//              };


//              // Enable/Disable typed arrays use, for testing
//              //
//              exports.setTyped = function (on) {
//                  if (on) {
//                      exports.Buf8 = Uint8Array;
//                      exports.Buf16 = Uint16Array;
//                      exports.Buf32 = Int32Array;
//                      exports.assign(exports, fnTyped);
//                  } else {
//                      exports.Buf8 = Array;
//                      exports.Buf16 = Array;
//                      exports.Buf32 = Array;
//                      exports.assign(exports, fnUntyped);
//                  }
//              };

//              exports.setTyped(TYPED_OK);
//          }, {}], 3: [function (_dereq_, module, exports) {
//              // String encode/decode helpers
//              'use strict';


//              var utils = _dereq_('./common');


//              // Quick check if we can use fast array to bin string conversion
//              //
//              // - apply(Array) can fail on Android 2.2
//              // - apply(Uint8Array) can fail on iOS 5.1 Safary
//              //
//              var STR_APPLY_OK = true;
//              var STR_APPLY_UIA_OK = true;

//              try { String.fromCharCode.apply(null, [0]); } catch (__) { STR_APPLY_OK = false; }
//              try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


//              // Table with utf8 lengths (calculated by first byte of sequence)
//              // Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
//              // because max possible codepoint is 0x10ffff
//              var _utf8len = new utils.Buf8(256);
//              for (var i = 0; i < 256; i++) {
//                  _utf8len[i] = (i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1);
//              }
//              _utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


//              // convert string to array (typed, when possible)
//              exports.string2buf = function (str) {
//                  var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

//                  // count binary size
//                  for (m_pos = 0; m_pos < str_len; m_pos++) {
//                      c = str.charCodeAt(m_pos);
//                      if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
//                          c2 = str.charCodeAt(m_pos + 1);
//                          if ((c2 & 0xfc00) === 0xdc00) {
//                              c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
//                              m_pos++;
//                          }
//                      }
//                      buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
//                  }

//                  // allocate buffer
//                  buf = new utils.Buf8(buf_len);

//                  // convert
//                  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
//                      c = str.charCodeAt(m_pos);
//                      if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
//                          c2 = str.charCodeAt(m_pos + 1);
//                          if ((c2 & 0xfc00) === 0xdc00) {
//                              c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
//                              m_pos++;
//                          }
//                      }
//                      if (c < 0x80) {
//                          /* one byte */
//                          buf[i++] = c;
//                      } else if (c < 0x800) {
//                          /* two bytes */
//                          buf[i++] = 0xC0 | (c >>> 6);
//                          buf[i++] = 0x80 | (c & 0x3f);
//                      } else if (c < 0x10000) {
//                          /* three bytes */
//                          buf[i++] = 0xE0 | (c >>> 12);
//                          buf[i++] = 0x80 | (c >>> 6 & 0x3f);
//                          buf[i++] = 0x80 | (c & 0x3f);
//                      } else {
//                          /* four bytes */
//                          buf[i++] = 0xf0 | (c >>> 18);
//                          buf[i++] = 0x80 | (c >>> 12 & 0x3f);
//                          buf[i++] = 0x80 | (c >>> 6 & 0x3f);
//                          buf[i++] = 0x80 | (c & 0x3f);
//                      }
//                  }

//                  return buf;
//              };

//              // Helper (used in 2 places)
//              function buf2binstring(buf, len) {
//                  // use fallback for big arrays to avoid stack overflow
//                  if (len < 65537) {
//                      if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
//                          return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
//                      }
//                  }

//                  var result = '';
//                  for (var i = 0; i < len; i++) {
//                      result += String.fromCharCode(buf[i]);
//                  }
//                  return result;
//              }


//              // Convert byte array to binary string
//              exports.buf2binstring = function (buf) {
//                  return buf2binstring(buf, buf.length);
//              };


//              // Convert binary string (typed, when possible)
//              exports.binstring2buf = function (str) {
//                  var buf = new utils.Buf8(str.length);
//                  for (var i = 0, len = buf.length; i < len; i++) {
//                      buf[i] = str.charCodeAt(i);
//                  }
//                  return buf;
//              };


//              // convert array to string
//              exports.buf2string = function (buf, max) {
//                  var i, out, c, c_len;
//                  var len = max || buf.length;

//                  // Reserve max possible length (2 words per char)
//                  // NB: by unknown reasons, Array is significantly faster for
//                  //     String.fromCharCode.apply than Uint16Array.
//                  var utf16buf = new Array(len * 2);

//                  for (out = 0, i = 0; i < len;) {
//                      c = buf[i++];
//                      // quick process ascii
//                      if (c < 0x80) { utf16buf[out++] = c; continue; }

//                      c_len = _utf8len[c];
//                      // skip 5 & 6 byte codes
//                      if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

//                      // apply mask on first byte
//                      c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
//                      // join the rest
//                      while (c_len > 1 && i < len) {
//                          c = (c << 6) | (buf[i++] & 0x3f);
//                          c_len--;
//                      }

//                      // terminated by end of string?
//                      if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

//                      if (c < 0x10000) {
//                          utf16buf[out++] = c;
//                      } else {
//                          c -= 0x10000;
//                          utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
//                          utf16buf[out++] = 0xdc00 | (c & 0x3ff);
//                      }
//                  }

//                  return buf2binstring(utf16buf, out);
//              };


//              // Calculate max possible position in utf8 buffer,
//              // that will not break sequence. If that's not possible
//              // - (very small limits) return max size as is.
//              //
//              // buf[] - utf8 bytes array
//              // max   - length limit (mandatory);
//              exports.utf8border = function (buf, max) {
//                  var pos;

//                  max = max || buf.length;
//                  if (max > buf.length) { max = buf.length; }

//                  // go back from last position, until start of sequence found
//                  pos = max - 1;
//                  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

//                  // Fuckup - very small and broken sequence,
//                  // return max, because we should return something anyway.
//                  if (pos < 0) { return max; }

//                  // If we came to start of buffer - that means vuffer is too small,
//                  // return max too.
//                  if (pos === 0) { return max; }

//                  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
//              };

//          }, { "./common": 2 }], 4: [function (_dereq_, module, exports) {
//              'use strict';

//              // Note: adler32 takes 12% for level 0 and 2% for level 6.
//              // It doesn't worth to make additional optimizationa as in original.
//              // Small size is preferable.

//              function adler32(adler, buf, len, pos) {
//                  var s1 = (adler & 0xffff) | 0
//                    , s2 = ((adler >>> 16) & 0xffff) | 0
//                    , n = 0;

//                  while (len !== 0) {
//                      // Set limit ~ twice less than 5552, to keep
//                      // s2 in 31-bits, because we force signed ints.
//                      // in other case %= will fail.
//                      n = len > 2000 ? 2000 : len;
//                      len -= n;

//                      do {
//                          s1 = (s1 + buf[pos++]) | 0;
//                          s2 = (s2 + s1) | 0;
//                      } while (--n);

//                      s1 %= 65521;
//                      s2 %= 65521;
//                  }

//                  return (s1 | (s2 << 16)) | 0;
//              }


//              module.exports = adler32;
//          }, {}], 5: [function (_dereq_, module, exports) {
//              'use strict';

//              // Note: we can't get significant speed boost here.
//              // So write code to minimize size - no pregenerated tables
//              // and array tools dependencies.


//              // Use ordinary array, since untyped makes no boost here
//              function makeTable() {
//                  var c, table = [];

//                  for (var n = 0; n < 256; n++) {
//                      c = n;
//                      for (var k = 0; k < 8; k++) {
//                          c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
//                      }
//                      table[n] = c;
//                  }

//                  return table;
//              }

//              // Create table on load. Just 255 signed longs. Not a problem.
//              var crcTable = makeTable();


//              function crc32(crc, buf, len, pos) {
//                  var t = crcTable
//                    , end = pos + len;

//                  crc = crc ^ (-1);

//                  for (var i = pos; i < end; i++) {
//                      crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
//                  }

//                  return (crc ^ (-1)); // >>> 0;
//              }


//              module.exports = crc32;
//          }, {}], 6: [function (_dereq_, module, exports) {
//              'use strict';

//              var utils = _dereq_('../utils/common');
//              var trees = _dereq_('./trees');
//              var adler32 = _dereq_('./adler32');
//              var crc32 = _dereq_('./crc32');
//              var msg = _dereq_('./messages');

//              /* Public constants ==========================================================*/
//              /* ===========================================================================*/


//              /* Allowed flush values; see deflate() and inflate() below for details */
//              var Z_NO_FLUSH = 0;
//              var Z_PARTIAL_FLUSH = 1;
//              //var Z_SYNC_FLUSH    = 2;
//              var Z_FULL_FLUSH = 3;
//              var Z_FINISH = 4;
//              var Z_BLOCK = 5;
//              //var Z_TREES         = 6;


//              /* Return codes for the compression/decompression functions. Negative values
//               * are errors, positive values are used for special but normal events.
//               */
//              var Z_OK = 0;
//              var Z_STREAM_END = 1;
//              //var Z_NEED_DICT     = 2;
//              //var Z_ERRNO         = -1;
//              var Z_STREAM_ERROR = -2;
//              var Z_DATA_ERROR = -3;
//              //var Z_MEM_ERROR     = -4;
//              var Z_BUF_ERROR = -5;
//              //var Z_VERSION_ERROR = -6;


//              /* compression levels */
//              //var Z_NO_COMPRESSION      = 0;
//              //var Z_BEST_SPEED          = 1;
//              //var Z_BEST_COMPRESSION    = 9;
//              var Z_DEFAULT_COMPRESSION = -1;


//              var Z_FILTERED = 1;
//              var Z_HUFFMAN_ONLY = 2;
//              var Z_RLE = 3;
//              var Z_FIXED = 4;
//              var Z_DEFAULT_STRATEGY = 0;

//              /* Possible values of the data_type field (though see inflate()) */
//              //var Z_BINARY              = 0;
//              //var Z_TEXT                = 1;
//              //var Z_ASCII               = 1; // = Z_TEXT
//              var Z_UNKNOWN = 2;


//              /* The deflate compression method */
//              var Z_DEFLATED = 8;

//              /*============================================================================*/


//              var MAX_MEM_LEVEL = 9;
//              /* Maximum value for memLevel in deflateInit2 */
//              var MAX_WBITS = 15;
//              /* 32K LZ77 window */
//              var DEF_MEM_LEVEL = 8;


//              var LENGTH_CODES = 29;
//              /* number of length codes, not counting the special END_BLOCK code */
//              var LITERALS = 256;
//              /* number of literal bytes 0..255 */
//              var L_CODES = LITERALS + 1 + LENGTH_CODES;
//              /* number of Literal or Length codes, including the END_BLOCK code */
//              var D_CODES = 30;
//              /* number of distance codes */
//              var BL_CODES = 19;
//              /* number of codes used to transfer the bit lengths */
//              var HEAP_SIZE = 2 * L_CODES + 1;
//              /* maximum heap size */
//              var MAX_BITS = 15;
//              /* All codes must not exceed MAX_BITS bits */

//              var MIN_MATCH = 3;
//              var MAX_MATCH = 258;
//              var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

//              var PRESET_DICT = 0x20;

//              var INIT_STATE = 42;
//              var EXTRA_STATE = 69;
//              var NAME_STATE = 73;
//              var COMMENT_STATE = 91;
//              var HCRC_STATE = 103;
//              var BUSY_STATE = 113;
//              var FINISH_STATE = 666;

//              var BS_NEED_MORE = 1; /* block not completed, need more input or more output */
//              var BS_BLOCK_DONE = 2; /* block flush performed */
//              var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
//              var BS_FINISH_DONE = 4; /* finish done, accept no more input or output */

//              var OS_CODE = 0x03; // Unix Don't detect, use this default.

//              function err(strm, errorCode) {
//                  strm.msg = msg[errorCode];
//                  return errorCode;
//              }

//              function rank(f) {
//                  return ((f) << 1) - ((f) > 4 ? 9 : 0);
//              }

//              function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }


//              /* =========================================================================
//               * Flush as much pending output as possible. All deflate() output goes
//               * through this function so some applications may wish to modify it
//               * to avoid allocating a large strm->output buffer and copying into it.
//               * (See also read_buf()).
//               */
//              function flush_pending(strm) {
//                  var s = strm.state;

//                  //_tr_flush_bits(s);
//                  var len = s.pending;
//                  if (len > strm.avail_out) {
//                      len = strm.avail_out;
//                  }
//                  if (len === 0) { return; }

//                  utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
//                  strm.next_out += len;
//                  s.pending_out += len;
//                  strm.total_out += len;
//                  strm.avail_out -= len;
//                  s.pending -= len;
//                  if (s.pending === 0) {
//                      s.pending_out = 0;
//                  }
//              }


//              function flush_block_only(s, last) {
//                  trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
//                  s.block_start = s.strstart;
//                  flush_pending(s.strm);
//              }


//              function put_byte(s, b) {
//                  s.pending_buf[s.pending++] = b;
//              }


//              /* =========================================================================
//               * Put a short in the pending buffer. The 16-bit value is put in MSB order.
//               * IN assertion: the stream state is correct and there is enough room in
//               * pending_buf.
//               */
//              function putShortMSB(s, b) {
//                  //  put_byte(s, (Byte)(b >> 8));
//                  //  put_byte(s, (Byte)(b & 0xff));
//                  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
//                  s.pending_buf[s.pending++] = b & 0xff;
//              }


//              /* ===========================================================================
//               * Read a new buffer from the current input stream, update the adler32
//               * and total number of bytes read.  All deflate() input goes through
//               * this function so some applications may wish to modify it to avoid
//               * allocating a large strm->input buffer and copying from it.
//               * (See also flush_pending()).
//               */
//              function read_buf(strm, buf, start, size) {
//                  var len = strm.avail_in;

//                  if (len > size) { len = size; }
//                  if (len === 0) { return 0; }

//                  strm.avail_in -= len;

//                  utils.arraySet(buf, strm.input, strm.next_in, len, start);
//                  if (strm.state.wrap === 1) {
//                      strm.adler = adler32(strm.adler, buf, len, start);
//                  }

//                  else if (strm.state.wrap === 2) {
//                      strm.adler = crc32(strm.adler, buf, len, start);
//                  }

//                  strm.next_in += len;
//                  strm.total_in += len;

//                  return len;
//              }


//              /* ===========================================================================
//               * Set match_start to the longest match starting at the given string and
//               * return its length. Matches shorter or equal to prev_length are discarded,
//               * in which case the result is equal to prev_length and match_start is
//               * garbage.
//               * IN assertions: cur_match is the head of the hash chain for the current
//               *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
//               * OUT assertion: the match length is not greater than s->lookahead.
//               */
//              function longest_match(s, cur_match) {
//                  var chain_length = s.max_chain_length;      /* max hash chain length */
//                  var scan = s.strstart; /* current string */
//                  var match;                       /* matched string */
//                  var len;                           /* length of current match */
//                  var best_len = s.prev_length;              /* best match length so far */
//                  var nice_match = s.nice_match;             /* stop if match long enough */
//                  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
//                      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

//                  var _win = s.window; // shortcut

//                  var wmask = s.w_mask;
//                  var prev = s.prev;

//                  /* Stop when cur_match becomes <= limit. To simplify the code,
//                   * we prevent matches with the string of window index 0.
//                   */

//                  var strend = s.strstart + MAX_MATCH;
//                  var scan_end1 = _win[scan + best_len - 1];
//                  var scan_end = _win[scan + best_len];

//                  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
//                   * It is easy to get rid of this optimization if necessary.
//                   */
//                  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

//                  /* Do not waste too much time if we already have a good match: */
//                  if (s.prev_length >= s.good_match) {
//                      chain_length >>= 2;
//                  }
//                  /* Do not look for matches beyond the end of the input. This is necessary
//                   * to make deflate deterministic.
//                   */
//                  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

//                  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

//                  do {
//                      // Assert(cur_match < s->strstart, "no future");
//                      match = cur_match;

//                      /* Skip to next match if the match length cannot increase
//                       * or if the match length is less than 2.  Note that the checks below
//                       * for insufficient lookahead only occur occasionally for performance
//                       * reasons.  Therefore uninitialized memory will be accessed, and
//                       * conditional jumps will be made that depend on those values.
//                       * However the length of the match is limited to the lookahead, so
//                       * the output of deflate is not affected by the uninitialized values.
//                       */

//                      if (_win[match + best_len] !== scan_end ||
//                          _win[match + best_len - 1] !== scan_end1 ||
//                          _win[match] !== _win[scan] ||
//                          _win[++match] !== _win[scan + 1]) {
//                          continue;
//                      }

//                      /* The check at best_len-1 can be removed because it will be made
//                       * again later. (This heuristic is not always a win.)
//                       * It is not necessary to compare scan[2] and match[2] since they
//                       * are always equal when the other bytes match, given that
//                       * the hash keys are equal and that HASH_BITS >= 8.
//                       */
//                      scan += 2;
//                      match++;
//                      // Assert(*scan == *match, "match[2]?");

//                      /* We check for insufficient lookahead only every 8th comparison;
//                       * the 256th check will be made at strstart+258.
//                       */
//                      do {
//                          /*jshint noempty:false*/
//                      } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
//                               _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
//                               _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
//                               _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
//                               scan < strend);

//                      // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

//                      len = MAX_MATCH - (strend - scan);
//                      scan = strend - MAX_MATCH;

//                      if (len > best_len) {
//                          s.match_start = cur_match;
//                          best_len = len;
//                          if (len >= nice_match) {
//                              break;
//                          }
//                          scan_end1 = _win[scan + best_len - 1];
//                          scan_end = _win[scan + best_len];
//                      }
//                  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

//                  if (best_len <= s.lookahead) {
//                      return best_len;
//                  }
//                  return s.lookahead;
//              }


//              /* ===========================================================================
//               * Fill the window when the lookahead becomes insufficient.
//               * Updates strstart and lookahead.
//               *
//               * IN assertion: lookahead < MIN_LOOKAHEAD
//               * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
//               *    At least one byte has been read, or avail_in == 0; reads are
//               *    performed for at least two bytes (required for the zip translate_eol
//               *    option -- not supported here).
//               */
//              function fill_window(s) {
//                  var _w_size = s.w_size;
//                  var p, n, m, more, str;

//                  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

//                  do {
//                      more = s.window_size - s.lookahead - s.strstart;

//                      // JS ints have 32 bit, block below not needed
//                      /* Deal with !@#$% 64K limit: */
//                      //if (sizeof(int) <= 2) {
//                      //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
//                      //        more = wsize;
//                      //
//                      //  } else if (more == (unsigned)(-1)) {
//                      //        /* Very unlikely, but possible on 16 bit machine if
//                      //         * strstart == 0 && lookahead == 1 (input done a byte at time)
//                      //         */
//                      //        more--;
//                      //    }
//                      //}


//                      /* If the window is almost full and there is insufficient lookahead,
//                       * move the upper half to the lower one to make room in the upper half.
//                       */
//                      if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

//                          utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
//                          s.match_start -= _w_size;
//                          s.strstart -= _w_size;
//                          /* we now have strstart >= MAX_DIST */
//                          s.block_start -= _w_size;

//                          /* Slide the hash table (could be avoided with 32 bit values
//                           at the expense of memory usage). We slide even when level == 0
//                           to keep the hash table consistent if we switch back to level > 0
//                           later. (Using level 0 permanently is not an optimal usage of
//                           zlib, so we don't care about this pathological case.)
//                           */

//                          n = s.hash_size;
//                          p = n;
//                          do {
//                              m = s.head[--p];
//                              s.head[p] = (m >= _w_size ? m - _w_size : 0);
//                          } while (--n);

//                          n = _w_size;
//                          p = n;
//                          do {
//                              m = s.prev[--p];
//                              s.prev[p] = (m >= _w_size ? m - _w_size : 0);
//                              /* If n is not on any hash chain, prev[n] is garbage but
//                               * its value will never be used.
//                               */
//                          } while (--n);

//                          more += _w_size;
//                      }
//                      if (s.strm.avail_in === 0) {
//                          break;
//                      }

//                      /* If there was no sliding:
//                       *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
//                       *    more == window_size - lookahead - strstart
//                       * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
//                       * => more >= window_size - 2*WSIZE + 2
//                       * In the BIG_MEM or MMAP case (not yet supported),
//                       *   window_size == input_size + MIN_LOOKAHEAD  &&
//                       *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
//                       * Otherwise, window_size == 2*WSIZE so more >= 2.
//                       * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
//                       */
//                      //Assert(more >= 2, "more < 2");
//                      n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
//                      s.lookahead += n;

//                      /* Initialize the hash value now that we have some input: */
//                      if (s.lookahead + s.insert >= MIN_MATCH) {
//                          str = s.strstart - s.insert;
//                          s.ins_h = s.window[str];

//                          /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
//                          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
//                          //#if MIN_MATCH != 3
//                          //        Call update_hash() MIN_MATCH-3 more times
//                          //#endif
//                          while (s.insert) {
//                              /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
//                              s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

//                              s.prev[str & s.w_mask] = s.head[s.ins_h];
//                              s.head[s.ins_h] = str;
//                              str++;
//                              s.insert--;
//                              if (s.lookahead + s.insert < MIN_MATCH) {
//                                  break;
//                              }
//                          }
//                      }
//                      /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
//                       * but this is not important since only literal bytes will be emitted.
//                       */

//                  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

//                  /* If the WIN_INIT bytes after the end of the current data have never been
//                   * written, then zero those bytes in order to avoid memory check reports of
//                   * the use of uninitialized (or uninitialised as Julian writes) bytes by
//                   * the longest match routines.  Update the high water mark for the next
//                   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
//                   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
//                   */
//                  //  if (s.high_water < s.window_size) {
//                  //    var curr = s.strstart + s.lookahead;
//                  //    var init = 0;
//                  //
//                  //    if (s.high_water < curr) {
//                  //      /* Previous high water mark below current data -- zero WIN_INIT
//                  //       * bytes or up to end of window, whichever is less.
//                  //       */
//                  //      init = s.window_size - curr;
//                  //      if (init > WIN_INIT)
//                  //        init = WIN_INIT;
//                  //      zmemzero(s->window + curr, (unsigned)init);
//                  //      s->high_water = curr + init;
//                  //    }
//                  //    else if (s->high_water < (ulg)curr + WIN_INIT) {
//                  //      /* High water mark at or above current data, but below current data
//                  //       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//                  //       * to end of window, whichever is less.
//                  //       */
//                  //      init = (ulg)curr + WIN_INIT - s->high_water;
//                  //      if (init > s->window_size - s->high_water)
//                  //        init = s->window_size - s->high_water;
//                  //      zmemzero(s->window + s->high_water, (unsigned)init);
//                  //      s->high_water += init;
//                  //    }
//                  //  }
//                  //
//                  //  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//                  //    "not enough room for search");
//              }

//              /* ===========================================================================
//               * Copy without compression as much as possible from the input stream, return
//               * the current block state.
//               * This function does not insert new strings in the dictionary since
//               * uncompressible data is probably not useful. This function is used
//               * only for the level=0 compression option.
//               * NOTE: this function should be optimized to avoid extra copying from
//               * window to pending_buf.
//               */
//              function deflate_stored(s, flush) {
//                  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
//                   * to pending_buf_size, and each stored block has a 5 byte header:
//                   */
//                  var max_block_size = 0xffff;

//                  if (max_block_size > s.pending_buf_size - 5) {
//                      max_block_size = s.pending_buf_size - 5;
//                  }

//                  /* Copy as much as possible from input to output: */
//                  for (; ;) {
//                      /* Fill the window as much as possible: */
//                      if (s.lookahead <= 1) {

//                          //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
//                          //  s->block_start >= (long)s->w_size, "slide too late");
//                          //      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//                          //        s.block_start >= s.w_size)) {
//                          //        throw  new Error("slide too late");
//                          //      }

//                          fill_window(s);
//                          if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
//                              return BS_NEED_MORE;
//                          }

//                          if (s.lookahead === 0) {
//                              break;
//                          }
//                          /* flush the current block */
//                      }
//                      //Assert(s->block_start >= 0L, "block gone");
//                      //    if (s.block_start < 0) throw new Error("block gone");

//                      s.strstart += s.lookahead;
//                      s.lookahead = 0;

//                      /* Emit a stored block if pending_buf will be full: */
//                      var max_start = s.block_start + max_block_size;

//                      if (s.strstart === 0 || s.strstart >= max_start) {
//                          /* strstart == 0 is possible when wraparound on 16-bit machine */
//                          s.lookahead = s.strstart - max_start;
//                          s.strstart = max_start;
//                          /*** FLUSH_BLOCK(s, 0); ***/
//                          flush_block_only(s, false);
//                          if (s.strm.avail_out === 0) {
//                              return BS_NEED_MORE;
//                          }
//                          /***/


//                      }
//                      /* Flush if we may have to slide, otherwise block_start may become
//                       * negative and the data will be gone:
//                       */
//                      if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
//                          /*** FLUSH_BLOCK(s, 0); ***/
//                          flush_block_only(s, false);
//                          if (s.strm.avail_out === 0) {
//                              return BS_NEED_MORE;
//                          }
//                          /***/
//                      }
//                  }

//                  s.insert = 0;

//                  if (flush === Z_FINISH) {
//                      /*** FLUSH_BLOCK(s, 1); ***/
//                      flush_block_only(s, true);
//                      if (s.strm.avail_out === 0) {
//                          return BS_FINISH_STARTED;
//                      }
//                      /***/
//                      return BS_FINISH_DONE;
//                  }

//                  if (s.strstart > s.block_start) {
//                      /*** FLUSH_BLOCK(s, 0); ***/
//                      flush_block_only(s, false);
//                      if (s.strm.avail_out === 0) {
//                          return BS_NEED_MORE;
//                      }
//                      /***/
//                  }

//                  return BS_NEED_MORE;
//              }

//              /* ===========================================================================
//               * Compress as much as possible from the input stream, return the current
//               * block state.
//               * This function does not perform lazy evaluation of matches and inserts
//               * new strings in the dictionary only for unmatched strings or for short
//               * matches. It is used only for the fast compression options.
//               */
//              function deflate_fast(s, flush) {
//                  var hash_head;        /* head of the hash chain */
//                  var bflush;           /* set if current block must be flushed */

//                  for (; ;) {
//                      /* Make sure that we always have enough lookahead, except
//                       * at the end of the input file. We need MAX_MATCH bytes
//                       * for the next match, plus MIN_MATCH bytes to insert the
//                       * string following the next match.
//                       */
//                      if (s.lookahead < MIN_LOOKAHEAD) {
//                          fill_window(s);
//                          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
//                              return BS_NEED_MORE;
//                          }
//                          if (s.lookahead === 0) {
//                              break; /* flush the current block */
//                          }
//                      }

//                      /* Insert the string window[strstart .. strstart+2] in the
//                       * dictionary, and set hash_head to the head of the hash chain:
//                       */
//                      hash_head = 0/*NIL*/;
//                      if (s.lookahead >= MIN_MATCH) {
//                          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
//                          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
//                          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
//                          s.head[s.ins_h] = s.strstart;
//                          /***/
//                      }

//                      /* Find the longest match, discarding those <= prev_length.
//                       * At this point we have always match_length < MIN_MATCH
//                       */
//                      if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
//                          /* To simplify the code, we prevent matches with the string
//                           * of window index 0 (in particular we have to avoid a match
//                           * of the string with itself at the start of the input file).
//                           */
//                          s.match_length = longest_match(s, hash_head);
//                          /* longest_match() sets match_start */
//                      }
//                      if (s.match_length >= MIN_MATCH) {
//                          // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

//                          /*** _tr_tally_dist(s, s.strstart - s.match_start,
//                                         s.match_length - MIN_MATCH, bflush); ***/
//                          bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

//                          s.lookahead -= s.match_length;

//                          /* Insert new strings in the hash table only if the match length
//                           * is not too large. This saves time but degrades compression.
//                           */
//                          if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
//                              s.match_length--; /* string at strstart already in table */
//                              do {
//                                  s.strstart++;
//                                  /*** INSERT_STRING(s, s.strstart, hash_head); ***/
//                                  s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
//                                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
//                                  s.head[s.ins_h] = s.strstart;
//                                  /***/
//                                  /* strstart never exceeds WSIZE-MAX_MATCH, so there are
//                                   * always MIN_MATCH bytes ahead.
//                                   */
//                              } while (--s.match_length !== 0);
//                              s.strstart++;
//                          } else {
//                              s.strstart += s.match_length;
//                              s.match_length = 0;
//                              s.ins_h = s.window[s.strstart];
//                              /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
//                              s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

//                              //#if MIN_MATCH != 3
//                              //                Call UPDATE_HASH() MIN_MATCH-3 more times
//                              //#endif
//                              /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
//                               * matter since it will be recomputed at next deflate call.
//                               */
//                          }
//                      } else {
//                          /* No match, output a literal byte */
//                          //Tracevv((stderr,"%c", s.window[s.strstart]));
//                          /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
//                          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

//                          s.lookahead--;
//                          s.strstart++;
//                      }
//                      if (bflush) {
//                          /*** FLUSH_BLOCK(s, 0); ***/
//                          flush_block_only(s, false);
//                          if (s.strm.avail_out === 0) {
//                              return BS_NEED_MORE;
//                          }
//                          /***/
//                      }
//                  }
//                  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
//                  if (flush === Z_FINISH) {
//                      /*** FLUSH_BLOCK(s, 1); ***/
//                      flush_block_only(s, true);
//                      if (s.strm.avail_out === 0) {
//                          return BS_FINISH_STARTED;
//                      }
//                      /***/
//                      return BS_FINISH_DONE;
//                  }
//                  if (s.last_lit) {
//                      /*** FLUSH_BLOCK(s, 0); ***/
//                      flush_block_only(s, false);
//                      if (s.strm.avail_out === 0) {
//                          return BS_NEED_MORE;
//                      }
//                      /***/
//                  }
//                  return BS_BLOCK_DONE;
//              }

//              /* ===========================================================================
//               * Same as above, but achieves better compression. We use a lazy
//               * evaluation for matches: a match is finally adopted only if there is
//               * no better match at the next window position.
//               */
//              function deflate_slow(s, flush) {
//                  var hash_head;          /* head of hash chain */
//                  var bflush;              /* set if current block must be flushed */

//                  var max_insert;

//                  /* Process the input block. */
//                  for (; ;) {
//                      /* Make sure that we always have enough lookahead, except
//                       * at the end of the input file. We need MAX_MATCH bytes
//                       * for the next match, plus MIN_MATCH bytes to insert the
//                       * string following the next match.
//                       */
//                      if (s.lookahead < MIN_LOOKAHEAD) {
//                          fill_window(s);
//                          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
//                              return BS_NEED_MORE;
//                          }
//                          if (s.lookahead === 0) { break; } /* flush the current block */
//                      }

//                      /* Insert the string window[strstart .. strstart+2] in the
//                       * dictionary, and set hash_head to the head of the hash chain:
//                       */
//                      hash_head = 0/*NIL*/;
//                      if (s.lookahead >= MIN_MATCH) {
//                          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
//                          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
//                          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
//                          s.head[s.ins_h] = s.strstart;
//                          /***/
//                      }

//                      /* Find the longest match, discarding those <= prev_length.
//                       */
//                      s.prev_length = s.match_length;
//                      s.prev_match = s.match_start;
//                      s.match_length = MIN_MATCH - 1;

//                      if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
//                          s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
//                          /* To simplify the code, we prevent matches with the string
//                           * of window index 0 (in particular we have to avoid a match
//                           * of the string with itself at the start of the input file).
//                           */
//                          s.match_length = longest_match(s, hash_head);
//                          /* longest_match() sets match_start */

//                          if (s.match_length <= 5 &&
//                             (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

//                              /* If prev_match is also MIN_MATCH, match_start is garbage
//                               * but we will ignore the current match anyway.
//                               */
//                              s.match_length = MIN_MATCH - 1;
//                          }
//                      }
//                      /* If there was a match at the previous step and the current
//                       * match is not better, output the previous match:
//                       */
//                      if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
//                          max_insert = s.strstart + s.lookahead - MIN_MATCH;
//                          /* Do not insert strings in hash table beyond this. */

//                          //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

//                          /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
//                                         s.prev_length - MIN_MATCH, bflush);***/
//                          bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
//                          /* Insert in hash table all strings up to the end of the match.
//                           * strstart-1 and strstart are already inserted. If there is not
//                           * enough lookahead, the last two strings are not inserted in
//                           * the hash table.
//                           */
//                          s.lookahead -= s.prev_length - 1;
//                          s.prev_length -= 2;
//                          do {
//                              if (++s.strstart <= max_insert) {
//                                  /*** INSERT_STRING(s, s.strstart, hash_head); ***/
//                                  s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
//                                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
//                                  s.head[s.ins_h] = s.strstart;
//                                  /***/
//                              }
//                          } while (--s.prev_length !== 0);
//                          s.match_available = 0;
//                          s.match_length = MIN_MATCH - 1;
//                          s.strstart++;

//                          if (bflush) {
//                              /*** FLUSH_BLOCK(s, 0); ***/
//                              flush_block_only(s, false);
//                              if (s.strm.avail_out === 0) {
//                                  return BS_NEED_MORE;
//                              }
//                              /***/
//                          }

//                      } else if (s.match_available) {
//                          /* If there was no match at the previous position, output a
//                           * single literal. If there was a match but the current match
//                           * is longer, truncate the previous match to a single literal.
//                           */
//                          //Tracevv((stderr,"%c", s->window[s->strstart-1]));
//                          /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
//                          bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

//                          if (bflush) {
//                              /*** FLUSH_BLOCK_ONLY(s, 0) ***/
//                              flush_block_only(s, false);
//                              /***/
//                          }
//                          s.strstart++;
//                          s.lookahead--;
//                          if (s.strm.avail_out === 0) {
//                              return BS_NEED_MORE;
//                          }
//                      } else {
//                          /* There is no previous match to compare with, wait for
//                           * the next step to decide.
//                           */
//                          s.match_available = 1;
//                          s.strstart++;
//                          s.lookahead--;
//                      }
//                  }
//                  //Assert (flush != Z_NO_FLUSH, "no flush?");
//                  if (s.match_available) {
//                      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
//                      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
//                      bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

//                      s.match_available = 0;
//                  }
//                  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
//                  if (flush === Z_FINISH) {
//                      /*** FLUSH_BLOCK(s, 1); ***/
//                      flush_block_only(s, true);
//                      if (s.strm.avail_out === 0) {
//                          return BS_FINISH_STARTED;
//                      }
//                      /***/
//                      return BS_FINISH_DONE;
//                  }
//                  if (s.last_lit) {
//                      /*** FLUSH_BLOCK(s, 0); ***/
//                      flush_block_only(s, false);
//                      if (s.strm.avail_out === 0) {
//                          return BS_NEED_MORE;
//                      }
//                      /***/
//                  }

//                  return BS_BLOCK_DONE;
//              }


//              /* ===========================================================================
//               * For Z_RLE, simply look for runs of bytes, generate matches only of distance
//               * one.  Do not maintain a hash table.  (It will be regenerated if this run of
//               * deflate switches away from Z_RLE.)
//               */
//              function deflate_rle(s, flush) {
//                  var bflush;            /* set if current block must be flushed */
//                  var prev;              /* byte at distance one to match */
//                  var scan, strend;      /* scan goes up to strend for length of run */

//                  var _win = s.window;

//                  for (; ;) {
//                      /* Make sure that we always have enough lookahead, except
//                       * at the end of the input file. We need MAX_MATCH bytes
//                       * for the longest run, plus one for the unrolled loop.
//                       */
//                      if (s.lookahead <= MAX_MATCH) {
//                          fill_window(s);
//                          if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
//                              return BS_NEED_MORE;
//                          }
//                          if (s.lookahead === 0) { break; } /* flush the current block */
//                      }

//                      /* See how many times the previous byte repeats */
//                      s.match_length = 0;
//                      if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
//                          scan = s.strstart - 1;
//                          prev = _win[scan];
//                          if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
//                              strend = s.strstart + MAX_MATCH;
//                              do {
//                                  /*jshint noempty:false*/
//                              } while (prev === _win[++scan] && prev === _win[++scan] &&
//                                       prev === _win[++scan] && prev === _win[++scan] &&
//                                       prev === _win[++scan] && prev === _win[++scan] &&
//                                       prev === _win[++scan] && prev === _win[++scan] &&
//                                       scan < strend);
//                              s.match_length = MAX_MATCH - (strend - scan);
//                              if (s.match_length > s.lookahead) {
//                                  s.match_length = s.lookahead;
//                              }
//                          }
//                          //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
//                      }

//                      /* Emit match if have run of MIN_MATCH or longer, else emit literal */
//                      if (s.match_length >= MIN_MATCH) {
//                          //check_match(s, s.strstart, s.strstart - 1, s.match_length);

//                          /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
//                          bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

//                          s.lookahead -= s.match_length;
//                          s.strstart += s.match_length;
//                          s.match_length = 0;
//                      } else {
//                          /* No match, output a literal byte */
//                          //Tracevv((stderr,"%c", s->window[s->strstart]));
//                          /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
//                          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

//                          s.lookahead--;
//                          s.strstart++;
//                      }
//                      if (bflush) {
//                          /*** FLUSH_BLOCK(s, 0); ***/
//                          flush_block_only(s, false);
//                          if (s.strm.avail_out === 0) {
//                              return BS_NEED_MORE;
//                          }
//                          /***/
//                      }
//                  }
//                  s.insert = 0;
//                  if (flush === Z_FINISH) {
//                      /*** FLUSH_BLOCK(s, 1); ***/
//                      flush_block_only(s, true);
//                      if (s.strm.avail_out === 0) {
//                          return BS_FINISH_STARTED;
//                      }
//                      /***/
//                      return BS_FINISH_DONE;
//                  }
//                  if (s.last_lit) {
//                      /*** FLUSH_BLOCK(s, 0); ***/
//                      flush_block_only(s, false);
//                      if (s.strm.avail_out === 0) {
//                          return BS_NEED_MORE;
//                      }
//                      /***/
//                  }
//                  return BS_BLOCK_DONE;
//              }

//              /* ===========================================================================
//               * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
//               * (It will be regenerated if this run of deflate switches away from Huffman.)
//               */
//              function deflate_huff(s, flush) {
//                  var bflush;             /* set if current block must be flushed */

//                  for (; ;) {
//                      /* Make sure that we have a literal to write. */
//                      if (s.lookahead === 0) {
//                          fill_window(s);
//                          if (s.lookahead === 0) {
//                              if (flush === Z_NO_FLUSH) {
//                                  return BS_NEED_MORE;
//                              }
//                              break;      /* flush the current block */
//                          }
//                      }

//                      /* Output a literal byte */
//                      s.match_length = 0;
//                      //Tracevv((stderr,"%c", s->window[s->strstart]));
//                      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
//                      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
//                      s.lookahead--;
//                      s.strstart++;
//                      if (bflush) {
//                          /*** FLUSH_BLOCK(s, 0); ***/
//                          flush_block_only(s, false);
//                          if (s.strm.avail_out === 0) {
//                              return BS_NEED_MORE;
//                          }
//                          /***/
//                      }
//                  }
//                  s.insert = 0;
//                  if (flush === Z_FINISH) {
//                      /*** FLUSH_BLOCK(s, 1); ***/
//                      flush_block_only(s, true);
//                      if (s.strm.avail_out === 0) {
//                          return BS_FINISH_STARTED;
//                      }
//                      /***/
//                      return BS_FINISH_DONE;
//                  }
//                  if (s.last_lit) {
//                      /*** FLUSH_BLOCK(s, 0); ***/
//                      flush_block_only(s, false);
//                      if (s.strm.avail_out === 0) {
//                          return BS_NEED_MORE;
//                      }
//                      /***/
//                  }
//                  return BS_BLOCK_DONE;
//              }

//              /* Values for max_lazy_match, good_match and max_chain_length, depending on
//               * the desired pack level (0..9). The values given below have been tuned to
//               * exclude worst case performance for pathological files. Better values may be
//               * found for specific files.
//               */
//              var Config = function (good_length, max_lazy, nice_length, max_chain, func) {
//                  this.good_length = good_length;
//                  this.max_lazy = max_lazy;
//                  this.nice_length = nice_length;
//                  this.max_chain = max_chain;
//                  this.func = func;
//              };

//              var configuration_table;

//              configuration_table = [
//                /*      good lazy nice chain */
//                new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
//                new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
//                new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
//                new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

//                new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
//                new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
//                new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
//                new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
//                new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
//                new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
//              ];


//              /* ===========================================================================
//               * Initialize the "longest match" routines for a new zlib stream
//               */
//              function lm_init(s) {
//                  s.window_size = 2 * s.w_size;

//                  /*** CLEAR_HASH(s); ***/
//                  zero(s.head); // Fill with NIL (= 0);

//                  /* Set the default configuration parameters:
//                   */
//                  s.max_lazy_match = configuration_table[s.level].max_lazy;
//                  s.good_match = configuration_table[s.level].good_length;
//                  s.nice_match = configuration_table[s.level].nice_length;
//                  s.max_chain_length = configuration_table[s.level].max_chain;

//                  s.strstart = 0;
//                  s.block_start = 0;
//                  s.lookahead = 0;
//                  s.insert = 0;
//                  s.match_length = s.prev_length = MIN_MATCH - 1;
//                  s.match_available = 0;
//                  s.ins_h = 0;
//              }


//              function DeflateState() {
//                  this.strm = null;            /* pointer back to this zlib stream */
//                  this.status = 0;            /* as the name implies */
//                  this.pending_buf = null;      /* output still pending */
//                  this.pending_buf_size = 0;  /* size of pending_buf */
//                  this.pending_out = 0;       /* next pending byte to output to the stream */
//                  this.pending = 0;           /* nb of bytes in the pending buffer */
//                  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
//                  this.gzhead = null;         /* gzip header information to write */
//                  this.gzindex = 0;           /* where in extra, name, or comment */
//                  this.method = Z_DEFLATED; /* can only be DEFLATED */
//                  this.last_flush = -1;   /* value of flush param for previous deflate call */

//                  this.w_size = 0;  /* LZ77 window size (32K by default) */
//                  this.w_bits = 0;  /* log2(w_size)  (8..16) */
//                  this.w_mask = 0;  /* w_size - 1 */

//                  this.window = null;
//                  /* Sliding window. Input bytes are read into the second half of the window,
//                   * and move to the first half later to keep a dictionary of at least wSize
//                   * bytes. With this organization, matches are limited to a distance of
//                   * wSize-MAX_MATCH bytes, but this ensures that IO is always
//                   * performed with a length multiple of the block size.
//                   */

//                  this.window_size = 0;
//                  /* Actual size of window: 2*wSize, except when the user input buffer
//                   * is directly used as sliding window.
//                   */

//                  this.prev = null;
//                  /* Link to older string with same hash index. To limit the size of this
//                   * array to 64K, this link is maintained only for the last 32K strings.
//                   * An index in this array is thus a window index modulo 32K.
//                   */

//                  this.head = null;   /* Heads of the hash chains or NIL. */

//                  this.ins_h = 0;       /* hash index of string to be inserted */
//                  this.hash_size = 0;   /* number of elements in hash table */
//                  this.hash_bits = 0;   /* log2(hash_size) */
//                  this.hash_mask = 0;   /* hash_size-1 */

//                  this.hash_shift = 0;
//                  /* Number of bits by which ins_h must be shifted at each input
//                   * step. It must be such that after MIN_MATCH steps, the oldest
//                   * byte no longer takes part in the hash key, that is:
//                   *   hash_shift * MIN_MATCH >= hash_bits
//                   */

//                  this.block_start = 0;
//                  /* Window position at the beginning of the current output block. Gets
//                   * negative when the window is moved backwards.
//                   */

//                  this.match_length = 0;      /* length of best match */
//                  this.prev_match = 0;        /* previous match */
//                  this.match_available = 0;   /* set if previous match exists */
//                  this.strstart = 0;          /* start of string to insert */
//                  this.match_start = 0;       /* start of matching string */
//                  this.lookahead = 0;         /* number of valid bytes ahead in window */

//                  this.prev_length = 0;
//                  /* Length of the best match at previous step. Matches not greater than this
//                   * are discarded. This is used in the lazy match evaluation.
//                   */

//                  this.max_chain_length = 0;
//                  /* To speed up deflation, hash chains are never searched beyond this
//                   * length.  A higher limit improves compression ratio but degrades the
//                   * speed.
//                   */

//                  this.max_lazy_match = 0;
//                  /* Attempt to find a better match only when the current match is strictly
//                   * smaller than this value. This mechanism is used only for compression
//                   * levels >= 4.
//                   */
//                  // That's alias to max_lazy_match, don't use directly
//                  //this.max_insert_length = 0;
//                  /* Insert new strings in the hash table only if the match length is not
//                   * greater than this length. This saves time but degrades compression.
//                   * max_insert_length is used only for compression levels <= 3.
//                   */

//                  this.level = 0;     /* compression level (1..9) */
//                  this.strategy = 0;  /* favor or force Huffman coding*/

//                  this.good_match = 0;
//                  /* Use a faster search when the previous match is longer than this */

//                  this.nice_match = 0; /* Stop searching when current match exceeds this */

//                  /* used by trees.c: */

//                  /* Didn't use ct_data typedef below to suppress compiler warning */

//                  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
//                  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
//                  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

//                  // Use flat array of DOUBLE size, with interleaved fata,
//                  // because JS does not support effective
//                  this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
//                  this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
//                  this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
//                  zero(this.dyn_ltree);
//                  zero(this.dyn_dtree);
//                  zero(this.bl_tree);

//                  this.l_desc = null;         /* desc. for literal tree */
//                  this.d_desc = null;         /* desc. for distance tree */
//                  this.bl_desc = null;         /* desc. for bit length tree */

//                  //ush bl_count[MAX_BITS+1];
//                  this.bl_count = new utils.Buf16(MAX_BITS + 1);
//                  /* number of codes at each bit length for an optimal tree */

//                  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
//                  this.heap = new utils.Buf16(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
//                  zero(this.heap);

//                  this.heap_len = 0;               /* number of elements in the heap */
//                  this.heap_max = 0;               /* element of largest frequency */
//                  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
//                   * The same heap array is used to build all trees.
//                   */

//                  this.depth = new utils.Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
//                  zero(this.depth);
//                  /* Depth of each subtree used as tie breaker for trees of equal frequency
//                   */

//                  this.l_buf = 0;          /* buffer index for literals or lengths */

//                  this.lit_bufsize = 0;
//                  /* Size of match buffer for literals/lengths.  There are 4 reasons for
//                   * limiting lit_bufsize to 64K:
//                   *   - frequencies can be kept in 16 bit counters
//                   *   - if compression is not successful for the first block, all input
//                   *     data is still in the window so we can still emit a stored block even
//                   *     when input comes from standard input.  (This can also be done for
//                   *     all blocks if lit_bufsize is not greater than 32K.)
//                   *   - if compression is not successful for a file smaller than 64K, we can
//                   *     even emit a stored file instead of a stored block (saving 5 bytes).
//                   *     This is applicable only for zip (not gzip or zlib).
//                   *   - creating new Huffman trees less frequently may not provide fast
//                   *     adaptation to changes in the input data statistics. (Take for
//                   *     example a binary file with poorly compressible code followed by
//                   *     a highly compressible string table.) Smaller buffer sizes give
//                   *     fast adaptation but have of course the overhead of transmitting
//                   *     trees more frequently.
//                   *   - I can't count above 4
//                   */

//                  this.last_lit = 0;      /* running index in l_buf */

//                  this.d_buf = 0;
//                  /* Buffer index for distances. To simplify the code, d_buf and l_buf have
//                   * the same number of elements. To use different lengths, an extra flag
//                   * array would be necessary.
//                   */

//                  this.opt_len = 0;       /* bit length of current block with optimal trees */
//                  this.static_len = 0;    /* bit length of current block with static trees */
//                  this.matches = 0;       /* number of string matches in current block */
//                  this.insert = 0;        /* bytes at end of window left to insert */


//                  this.bi_buf = 0;
//                  /* Output buffer. bits are inserted starting at the bottom (least
//                   * significant bits).
//                   */
//                  this.bi_valid = 0;
//                  /* Number of valid bits in bi_buf.  All bits above the last valid bit
//                   * are always zero.
//                   */

//                  // Used for window memory init. We safely ignore it for JS. That makes
//                  // sense only for pointers and memory check tools.
//                  //this.high_water = 0;
//                  /* High water mark offset in window for initialized bytes -- bytes above
//                   * this are set to zero in order to avoid memory check warnings when
//                   * longest match routines access bytes past the input.  This is then
//                   * updated to the new high water mark.
//                   */
//              }


//              function deflateResetKeep(strm) {
//                  var s;

//                  if (!strm || !strm.state) {
//                      return err(strm, Z_STREAM_ERROR);
//                  }

//                  strm.total_in = strm.total_out = 0;
//                  strm.data_type = Z_UNKNOWN;

//                  s = strm.state;
//                  s.pending = 0;
//                  s.pending_out = 0;

//                  if (s.wrap < 0) {
//                      s.wrap = -s.wrap;
//                      /* was made negative by deflate(..., Z_FINISH); */
//                  }
//                  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
//                  strm.adler = (s.wrap === 2) ?
//                    0  // crc32(0, Z_NULL, 0)
//                  :
//                    1; // adler32(0, Z_NULL, 0)
//                  s.last_flush = Z_NO_FLUSH;
//                  trees._tr_init(s);
//                  return Z_OK;
//              }


//              function deflateReset(strm) {
//                  var ret = deflateResetKeep(strm);
//                  if (ret === Z_OK) {
//                      lm_init(strm.state);
//                  }
//                  return ret;
//              }


//              function deflateSetHeader(strm, head) {
//                  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
//                  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
//                  strm.state.gzhead = head;
//                  return Z_OK;
//              }


//              function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
//                  if (!strm) { // === Z_NULL
//                      return Z_STREAM_ERROR;
//                  }
//                  var wrap = 1;

//                  if (level === Z_DEFAULT_COMPRESSION) {
//                      level = 6;
//                  }

//                  if (windowBits < 0) { /* suppress zlib wrapper */
//                      wrap = 0;
//                      windowBits = -windowBits;
//                  }

//                  else if (windowBits > 15) {
//                      wrap = 2;           /* write gzip wrapper instead */
//                      windowBits -= 16;
//                  }


//                  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
//                    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
//                    strategy < 0 || strategy > Z_FIXED) {
//                      return err(strm, Z_STREAM_ERROR);
//                  }


//                  if (windowBits === 8) {
//                      windowBits = 9;
//                  }
//                  /* until 256-byte window bug fixed */

//                  var s = new DeflateState();

//                  strm.state = s;
//                  s.strm = strm;

//                  s.wrap = wrap;
//                  s.gzhead = null;
//                  s.w_bits = windowBits;
//                  s.w_size = 1 << s.w_bits;
//                  s.w_mask = s.w_size - 1;

//                  s.hash_bits = memLevel + 7;
//                  s.hash_size = 1 << s.hash_bits;
//                  s.hash_mask = s.hash_size - 1;
//                  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

//                  s.window = new utils.Buf8(s.w_size * 2);
//                  s.head = new utils.Buf16(s.hash_size);
//                  s.prev = new utils.Buf16(s.w_size);

//                  // Don't need mem init magic for JS.
//                  //s.high_water = 0;  /* nothing written to s->window yet */

//                  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

//                  s.pending_buf_size = s.lit_bufsize * 4;
//                  s.pending_buf = new utils.Buf8(s.pending_buf_size);

//                  s.d_buf = s.lit_bufsize >> 1;
//                  s.l_buf = (1 + 2) * s.lit_bufsize;

//                  s.level = level;
//                  s.strategy = strategy;
//                  s.method = method;

//                  return deflateReset(strm);
//              }

//              function deflateInit(strm, level) {
//                  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
//              }


//              function deflate(strm, flush) {
//                  var old_flush, s;
//                  var beg, val; // for gzip header write only

//                  if (!strm || !strm.state ||
//                    flush > Z_BLOCK || flush < 0) {
//                      return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
//                  }

//                  s = strm.state;

//                  if (!strm.output ||
//                      (!strm.input && strm.avail_in !== 0) ||
//                      (s.status === FINISH_STATE && flush !== Z_FINISH)) {
//                      return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
//                  }

//                  s.strm = strm; /* just in case */
//                  old_flush = s.last_flush;
//                  s.last_flush = flush;

//                  /* Write the header */
//                  if (s.status === INIT_STATE) {

//                      if (s.wrap === 2) { // GZIP header
//                          strm.adler = 0;  //crc32(0L, Z_NULL, 0);
//                          put_byte(s, 31);
//                          put_byte(s, 139);
//                          put_byte(s, 8);
//                          if (!s.gzhead) { // s->gzhead == Z_NULL
//                              put_byte(s, 0);
//                              put_byte(s, 0);
//                              put_byte(s, 0);
//                              put_byte(s, 0);
//                              put_byte(s, 0);
//                              put_byte(s, s.level === 9 ? 2 :
//                                          (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
//                                           4 : 0));
//                              put_byte(s, OS_CODE);
//                              s.status = BUSY_STATE;
//                          }
//                          else {
//                              put_byte(s, (s.gzhead.text ? 1 : 0) +
//                                          (s.gzhead.hcrc ? 2 : 0) +
//                                          (!s.gzhead.extra ? 0 : 4) +
//                                          (!s.gzhead.name ? 0 : 8) +
//                                          (!s.gzhead.comment ? 0 : 16)
//                                      );
//                              put_byte(s, s.gzhead.time & 0xff);
//                              put_byte(s, (s.gzhead.time >> 8) & 0xff);
//                              put_byte(s, (s.gzhead.time >> 16) & 0xff);
//                              put_byte(s, (s.gzhead.time >> 24) & 0xff);
//                              put_byte(s, s.level === 9 ? 2 :
//                                          (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
//                                           4 : 0));
//                              put_byte(s, s.gzhead.os & 0xff);
//                              if (s.gzhead.extra && s.gzhead.extra.length) {
//                                  put_byte(s, s.gzhead.extra.length & 0xff);
//                                  put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
//                              }
//                              if (s.gzhead.hcrc) {
//                                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
//                              }
//                              s.gzindex = 0;
//                              s.status = EXTRA_STATE;
//                          }
//                      }
//                      else // DEFLATE header
//                      {
//                          var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
//                          var level_flags = -1;

//                          if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
//                              level_flags = 0;
//                          } else if (s.level < 6) {
//                              level_flags = 1;
//                          } else if (s.level === 6) {
//                              level_flags = 2;
//                          } else {
//                              level_flags = 3;
//                          }
//                          header |= (level_flags << 6);
//                          if (s.strstart !== 0) { header |= PRESET_DICT; }
//                          header += 31 - (header % 31);

//                          s.status = BUSY_STATE;
//                          putShortMSB(s, header);

//                          /* Save the adler32 of the preset dictionary: */
//                          if (s.strstart !== 0) {
//                              putShortMSB(s, strm.adler >>> 16);
//                              putShortMSB(s, strm.adler & 0xffff);
//                          }
//                          strm.adler = 1; // adler32(0L, Z_NULL, 0);
//                      }
//                  }

//                  //#ifdef GZIP
//                  if (s.status === EXTRA_STATE) {
//                      if (s.gzhead.extra/* != Z_NULL*/) {
//                          beg = s.pending;  /* start of bytes to update crc */

//                          while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
//                              if (s.pending === s.pending_buf_size) {
//                                  if (s.gzhead.hcrc && s.pending > beg) {
//                                      strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
//                                  }
//                                  flush_pending(strm);
//                                  beg = s.pending;
//                                  if (s.pending === s.pending_buf_size) {
//                                      break;
//                                  }
//                              }
//                              put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
//                              s.gzindex++;
//                          }
//                          if (s.gzhead.hcrc && s.pending > beg) {
//                              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
//                          }
//                          if (s.gzindex === s.gzhead.extra.length) {
//                              s.gzindex = 0;
//                              s.status = NAME_STATE;
//                          }
//                      }
//                      else {
//                          s.status = NAME_STATE;
//                      }
//                  }
//                  if (s.status === NAME_STATE) {
//                      if (s.gzhead.name/* != Z_NULL*/) {
//                          beg = s.pending;  /* start of bytes to update crc */
//                          //int val;

//                          do {
//                              if (s.pending === s.pending_buf_size) {
//                                  if (s.gzhead.hcrc && s.pending > beg) {
//                                      strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
//                                  }
//                                  flush_pending(strm);
//                                  beg = s.pending;
//                                  if (s.pending === s.pending_buf_size) {
//                                      val = 1;
//                                      break;
//                                  }
//                              }
//                              // JS specific: little magic to add zero terminator to end of string
//                              if (s.gzindex < s.gzhead.name.length) {
//                                  val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
//                              } else {
//                                  val = 0;
//                              }
//                              put_byte(s, val);
//                          } while (val !== 0);

//                          if (s.gzhead.hcrc && s.pending > beg) {
//                              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
//                          }
//                          if (val === 0) {
//                              s.gzindex = 0;
//                              s.status = COMMENT_STATE;
//                          }
//                      }
//                      else {
//                          s.status = COMMENT_STATE;
//                      }
//                  }
//                  if (s.status === COMMENT_STATE) {
//                      if (s.gzhead.comment/* != Z_NULL*/) {
//                          beg = s.pending;  /* start of bytes to update crc */
//                          //int val;

//                          do {
//                              if (s.pending === s.pending_buf_size) {
//                                  if (s.gzhead.hcrc && s.pending > beg) {
//                                      strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
//                                  }
//                                  flush_pending(strm);
//                                  beg = s.pending;
//                                  if (s.pending === s.pending_buf_size) {
//                                      val = 1;
//                                      break;
//                                  }
//                              }
//                              // JS specific: little magic to add zero terminator to end of string
//                              if (s.gzindex < s.gzhead.comment.length) {
//                                  val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
//                              } else {
//                                  val = 0;
//                              }
//                              put_byte(s, val);
//                          } while (val !== 0);

//                          if (s.gzhead.hcrc && s.pending > beg) {
//                              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
//                          }
//                          if (val === 0) {
//                              s.status = HCRC_STATE;
//                          }
//                      }
//                      else {
//                          s.status = HCRC_STATE;
//                      }
//                  }
//                  if (s.status === HCRC_STATE) {
//                      if (s.gzhead.hcrc) {
//                          if (s.pending + 2 > s.pending_buf_size) {
//                              flush_pending(strm);
//                          }
//                          if (s.pending + 2 <= s.pending_buf_size) {
//                              put_byte(s, strm.adler & 0xff);
//                              put_byte(s, (strm.adler >> 8) & 0xff);
//                              strm.adler = 0; //crc32(0L, Z_NULL, 0);
//                              s.status = BUSY_STATE;
//                          }
//                      }
//                      else {
//                          s.status = BUSY_STATE;
//                      }
//                  }
//                  //#endif

//                  /* Flush as much pending output as possible */
//                  if (s.pending !== 0) {
//                      flush_pending(strm);
//                      if (strm.avail_out === 0) {
//                          /* Since avail_out is 0, deflate will be called again with
//                           * more output space, but possibly with both pending and
//                           * avail_in equal to zero. There won't be anything to do,
//                           * but this is not an error situation so make sure we
//                           * return OK instead of BUF_ERROR at next call of deflate:
//                           */
//                          s.last_flush = -1;
//                          return Z_OK;
//                      }

//                      /* Make sure there is something to do and avoid duplicate consecutive
//                       * flushes. For repeated and useless calls with Z_FINISH, we keep
//                       * returning Z_STREAM_END instead of Z_BUF_ERROR.
//                       */
//                  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
//                    flush !== Z_FINISH) {
//                      return err(strm, Z_BUF_ERROR);
//                  }

//                  /* User must not provide more input after the first FINISH: */
//                  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
//                      return err(strm, Z_BUF_ERROR);
//                  }

//                  /* Start a new block or continue the current one.
//                   */
//                  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
//                    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
//                      var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
//                        (s.strategy === Z_RLE ? deflate_rle(s, flush) :
//                          configuration_table[s.level].func(s, flush));

//                      if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
//                          s.status = FINISH_STATE;
//                      }
//                      if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
//                          if (strm.avail_out === 0) {
//                              s.last_flush = -1;
//                              /* avoid BUF_ERROR next call, see above */
//                          }
//                          return Z_OK;
//                          /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
//                           * of deflate should use the same flush parameter to make sure
//                           * that the flush is complete. So we don't have to output an
//                           * empty block here, this will be done at next call. This also
//                           * ensures that for a very small output buffer, we emit at most
//                           * one empty block.
//                           */
//                      }
//                      if (bstate === BS_BLOCK_DONE) {
//                          if (flush === Z_PARTIAL_FLUSH) {
//                              trees._tr_align(s);
//                          }
//                          else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

//                              trees._tr_stored_block(s, 0, 0, false);
//                              /* For a full flush, this empty block will be recognized
//                               * as a special marker by inflate_sync().
//                               */
//                              if (flush === Z_FULL_FLUSH) {
//                                  /*** CLEAR_HASH(s); ***/             /* forget history */
//                                  zero(s.head); // Fill with NIL (= 0);

//                                  if (s.lookahead === 0) {
//                                      s.strstart = 0;
//                                      s.block_start = 0;
//                                      s.insert = 0;
//                                  }
//                              }
//                          }
//                          flush_pending(strm);
//                          if (strm.avail_out === 0) {
//                              s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
//                              return Z_OK;
//                          }
//                      }
//                  }
//                  //Assert(strm->avail_out > 0, "bug2");
//                  //if (strm.avail_out <= 0) { throw new Error("bug2");}

//                  if (flush !== Z_FINISH) { return Z_OK; }
//                  if (s.wrap <= 0) { return Z_STREAM_END; }

//                  /* Write the trailer */
//                  if (s.wrap === 2) {
//                      put_byte(s, strm.adler & 0xff);
//                      put_byte(s, (strm.adler >> 8) & 0xff);
//                      put_byte(s, (strm.adler >> 16) & 0xff);
//                      put_byte(s, (strm.adler >> 24) & 0xff);
//                      put_byte(s, strm.total_in & 0xff);
//                      put_byte(s, (strm.total_in >> 8) & 0xff);
//                      put_byte(s, (strm.total_in >> 16) & 0xff);
//                      put_byte(s, (strm.total_in >> 24) & 0xff);
//                  }
//                  else {
//                      putShortMSB(s, strm.adler >>> 16);
//                      putShortMSB(s, strm.adler & 0xffff);
//                  }

//                  flush_pending(strm);
//                  /* If avail_out is zero, the application will call deflate again
//                   * to flush the rest.
//                   */
//                  if (s.wrap > 0) { s.wrap = -s.wrap; }
//                  /* write the trailer only once! */
//                  return s.pending !== 0 ? Z_OK : Z_STREAM_END;
//              }

//              function deflateEnd(strm) {
//                  var status;

//                  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
//                      return Z_STREAM_ERROR;
//                  }

//                  status = strm.state.status;
//                  if (status !== INIT_STATE &&
//                    status !== EXTRA_STATE &&
//                    status !== NAME_STATE &&
//                    status !== COMMENT_STATE &&
//                    status !== HCRC_STATE &&
//                    status !== BUSY_STATE &&
//                    status !== FINISH_STATE
//                  ) {
//                      return err(strm, Z_STREAM_ERROR);
//                  }

//                  strm.state = null;

//                  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
//              }

//              /* =========================================================================
//               * Copy the source state to the destination state
//               */
//              //function deflateCopy(dest, source) {
//              //
//              //}

//              exports.deflateInit = deflateInit;
//              exports.deflateInit2 = deflateInit2;
//              exports.deflateReset = deflateReset;
//              exports.deflateResetKeep = deflateResetKeep;
//              exports.deflateSetHeader = deflateSetHeader;
//              exports.deflate = deflate;
//              exports.deflateEnd = deflateEnd;
//              exports.deflateInfo = 'pako deflate (from Nodeca project)';

//              /* Not implemented
//              exports.deflateBound = deflateBound;
//              exports.deflateCopy = deflateCopy;
//              exports.deflateSetDictionary = deflateSetDictionary;
//              exports.deflateParams = deflateParams;
//              exports.deflatePending = deflatePending;
//              exports.deflatePrime = deflatePrime;
//              exports.deflateTune = deflateTune;
//              */
//          }, { "../utils/common": 2, "./adler32": 4, "./crc32": 5, "./messages": 7, "./trees": 8 }], 7: [function (_dereq_, module, exports) {
//              'use strict';

//              module.exports = {
//                  '2': 'need dictionary',     /* Z_NEED_DICT       2  */
//                  '1': 'stream end',          /* Z_STREAM_END      1  */
//                  '0': '',                    /* Z_OK              0  */
//                  '-1': 'file error',          /* Z_ERRNO         (-1) */
//                  '-2': 'stream error',        /* Z_STREAM_ERROR  (-2) */
//                  '-3': 'data error',          /* Z_DATA_ERROR    (-3) */
//                  '-4': 'insufficient memory', /* Z_MEM_ERROR     (-4) */
//                  '-5': 'buffer error',        /* Z_BUF_ERROR     (-5) */
//                  '-6': 'incompatible version' /* Z_VERSION_ERROR (-6) */
//              };
//          }, {}], 8: [function (_dereq_, module, exports) {
//              'use strict';


//              var utils = _dereq_('../utils/common');

//              /* Public constants ==========================================================*/
//              /* ===========================================================================*/


//              //var Z_FILTERED          = 1;
//              //var Z_HUFFMAN_ONLY      = 2;
//              //var Z_RLE               = 3;
//              var Z_FIXED = 4;
//              //var Z_DEFAULT_STRATEGY  = 0;

//              /* Possible values of the data_type field (though see inflate()) */
//              var Z_BINARY = 0;
//              var Z_TEXT = 1;
//              //var Z_ASCII             = 1; // = Z_TEXT
//              var Z_UNKNOWN = 2;

//              /*============================================================================*/


//              function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }

//              // From zutil.h

//              var STORED_BLOCK = 0;
//              var STATIC_TREES = 1;
//              var DYN_TREES = 2;
//              /* The three kinds of block type */

//              var MIN_MATCH = 3;
//              var MAX_MATCH = 258;
//              /* The minimum and maximum match lengths */

//              // From deflate.h
//              /* ===========================================================================
//               * Internal compression state.
//               */

//              var LENGTH_CODES = 29;
//              /* number of length codes, not counting the special END_BLOCK code */

//              var LITERALS = 256;
//              /* number of literal bytes 0..255 */

//              var L_CODES = LITERALS + 1 + LENGTH_CODES;
//              /* number of Literal or Length codes, including the END_BLOCK code */

//              var D_CODES = 30;
//              /* number of distance codes */

//              var BL_CODES = 19;
//              /* number of codes used to transfer the bit lengths */

//              var HEAP_SIZE = 2 * L_CODES + 1;
//              /* maximum heap size */

//              var MAX_BITS = 15;
//              /* All codes must not exceed MAX_BITS bits */

//              var Buf_size = 16;
//              /* size of bit buffer in bi_buf */


//              /* ===========================================================================
//               * Constants
//               */

//              var MAX_BL_BITS = 7;
//              /* Bit length codes must not exceed MAX_BL_BITS bits */

//              var END_BLOCK = 256;
//              /* end of block literal code */

//              var REP_3_6 = 16;
//              /* repeat previous bit length 3-6 times (2 bits of repeat count) */

//              var REPZ_3_10 = 17;
//              /* repeat a zero length 3-10 times  (3 bits of repeat count) */

//              var REPZ_11_138 = 18;
//              /* repeat a zero length 11-138 times  (7 bits of repeat count) */

//              var extra_lbits =   /* extra bits for each length code */
//                [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];

//              var extra_dbits =   /* extra bits for each distance code */
//                [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

//              var extra_blbits =  /* extra bits for each bit length code */
//                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];

//              var bl_order =
//                [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
//              /* The lengths of the bit length codes are sent in order of decreasing
//               * probability, to avoid transmitting the lengths for unused bit length codes.
//               */

//              /* ===========================================================================
//               * Local data. These are initialized only once.
//               */

//              // We pre-fill arrays with 0 to avoid uninitialized gaps

//              var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

//              // !!!! Use flat array insdead of structure, Freq = i*2, Len = i*2+1
//              var static_ltree = new Array((L_CODES + 2) * 2);
//              zero(static_ltree);
//              /* The static literal tree. Since the bit lengths are imposed, there is no
//               * need for the L_CODES extra codes used during heap construction. However
//               * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
//               * below).
//               */

//              var static_dtree = new Array(D_CODES * 2);
//              zero(static_dtree);
//              /* The static distance tree. (Actually a trivial tree since all codes use
//               * 5 bits.)
//               */

//              var _dist_code = new Array(DIST_CODE_LEN);
//              zero(_dist_code);
//              /* Distance codes. The first 256 values correspond to the distances
//               * 3 .. 258, the last 256 values correspond to the top 8 bits of
//               * the 15 bit distances.
//               */

//              var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
//              zero(_length_code);
//              /* length code for each normalized match length (0 == MIN_MATCH) */

//              var base_length = new Array(LENGTH_CODES);
//              zero(base_length);
//              /* First normalized length for each code (0 = MIN_MATCH) */

//              var base_dist = new Array(D_CODES);
//              zero(base_dist);
//              /* First normalized distance for each code (0 = distance of 1) */


//              var StaticTreeDesc = function (static_tree, extra_bits, extra_base, elems, max_length) {

//                  this.static_tree = static_tree;  /* static tree or NULL */
//                  this.extra_bits = extra_bits;   /* extra bits for each code or NULL */
//                  this.extra_base = extra_base;   /* base index for extra_bits */
//                  this.elems = elems;        /* max number of elements in the tree */
//                  this.max_length = max_length;   /* max bit length for the codes */

//                  // show if `static_tree` has data or dummy - needed for monomorphic objects
//                  this.has_stree = static_tree && static_tree.length;
//              };


//              var static_l_desc;
//              var static_d_desc;
//              var static_bl_desc;


//              var TreeDesc = function (dyn_tree, stat_desc) {
//                  this.dyn_tree = dyn_tree;     /* the dynamic tree */
//                  this.max_code = 0;            /* largest code with non zero frequency */
//                  this.stat_desc = stat_desc;   /* the corresponding static tree */
//              };



//              function d_code(dist) {
//                  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
//              }


//              /* ===========================================================================
//               * Output a short LSB first on the stream.
//               * IN assertion: there is enough room in pendingBuf.
//               */
//              function put_short(s, w) {
//                  //    put_byte(s, (uch)((w) & 0xff));
//                  //    put_byte(s, (uch)((ush)(w) >> 8));
//                  s.pending_buf[s.pending++] = (w) & 0xff;
//                  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
//              }


//              /* ===========================================================================
//               * Send a value on a given number of bits.
//               * IN assertion: length <= 16 and value fits in length bits.
//               */
//              function send_bits(s, value, length) {
//                  if (s.bi_valid > (Buf_size - length)) {
//                      s.bi_buf |= (value << s.bi_valid) & 0xffff;
//                      put_short(s, s.bi_buf);
//                      s.bi_buf = value >> (Buf_size - s.bi_valid);
//                      s.bi_valid += length - Buf_size;
//                  } else {
//                      s.bi_buf |= (value << s.bi_valid) & 0xffff;
//                      s.bi_valid += length;
//                  }
//              }


//              function send_code(s, c, tree) {
//                  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
//              }


//              /* ===========================================================================
//               * Reverse the first len bits of a code, using straightforward code (a faster
//               * method would use a table)
//               * IN assertion: 1 <= len <= 15
//               */
//              function bi_reverse(code, len) {
//                  var res = 0;
//                  do {
//                      res |= code & 1;
//                      code >>>= 1;
//                      res <<= 1;
//                  } while (--len > 0);
//                  return res >>> 1;
//              }


//              /* ===========================================================================
//               * Flush the bit buffer, keeping at most 7 bits in it.
//               */
//              function bi_flush(s) {
//                  if (s.bi_valid === 16) {
//                      put_short(s, s.bi_buf);
//                      s.bi_buf = 0;
//                      s.bi_valid = 0;

//                  } else if (s.bi_valid >= 8) {
//                      s.pending_buf[s.pending++] = s.bi_buf & 0xff;
//                      s.bi_buf >>= 8;
//                      s.bi_valid -= 8;
//                  }
//              }


//              /* ===========================================================================
//               * Compute the optimal bit lengths for a tree and update the total bit length
//               * for the current block.
//               * IN assertion: the fields freq and dad are set, heap[heap_max] and
//               *    above are the tree nodes sorted by increasing frequency.
//               * OUT assertions: the field len is set to the optimal bit length, the
//               *     array bl_count contains the frequencies for each bit length.
//               *     The length opt_len is updated; static_len is also updated if stree is
//               *     not null.
//               */
//              function gen_bitlen(s, desc)
//                  //    deflate_state *s;
//                  //    tree_desc *desc;    /* the tree descriptor */
//              {
//                  var tree = desc.dyn_tree;
//                  var max_code = desc.max_code;
//                  var stree = desc.stat_desc.static_tree;
//                  var has_stree = desc.stat_desc.has_stree;
//                  var extra = desc.stat_desc.extra_bits;
//                  var base = desc.stat_desc.extra_base;
//                  var max_length = desc.stat_desc.max_length;
//                  var h;              /* heap index */
//                  var n, m;           /* iterate over the tree elements */
//                  var bits;           /* bit length */
//                  var xbits;          /* extra bits */
//                  var f;              /* frequency */
//                  var overflow = 0;   /* number of elements with bit length too large */

//                  for (bits = 0; bits <= MAX_BITS; bits++) {
//                      s.bl_count[bits] = 0;
//                  }

//                  /* In a first pass, compute the optimal bit lengths (which may
//                   * overflow in the case of the bit length tree).
//                   */
//                  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

//                  for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
//                      n = s.heap[h];
//                      bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
//                      if (bits > max_length) {
//                          bits = max_length;
//                          overflow++;
//                      }
//                      tree[n * 2 + 1]/*.Len*/ = bits;
//                      /* We overwrite tree[n].Dad which is no longer needed */

//                      if (n > max_code) { continue; } /* not a leaf node */

//                      s.bl_count[bits]++;
//                      xbits = 0;
//                      if (n >= base) {
//                          xbits = extra[n - base];
//                      }
//                      f = tree[n * 2]/*.Freq*/;
//                      s.opt_len += f * (bits + xbits);
//                      if (has_stree) {
//                          s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
//                      }
//                  }
//                  if (overflow === 0) { return; }

//                  // Trace((stderr,"\nbit length overflow\n"));
//                  /* This happens for example on obj2 and pic of the Calgary corpus */

//                  /* Find the first bit length which could increase: */
//                  do {
//                      bits = max_length - 1;
//                      while (s.bl_count[bits] === 0) { bits--; }
//                      s.bl_count[bits]--;      /* move one leaf down the tree */
//                      s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
//                      s.bl_count[max_length]--;
//                      /* The brother of the overflow item also moves one step up,
//                       * but this does not affect bl_count[max_length]
//                       */
//                      overflow -= 2;
//                  } while (overflow > 0);

//                  /* Now recompute all bit lengths, scanning in increasing frequency.
//                   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
//                   * lengths instead of fixing only the wrong ones. This idea is taken
//                   * from 'ar' written by Haruhiko Okumura.)
//                   */
//                  for (bits = max_length; bits !== 0; bits--) {
//                      n = s.bl_count[bits];
//                      while (n !== 0) {
//                          m = s.heap[--h];
//                          if (m > max_code) { continue; }
//                          if (tree[m * 2 + 1]/*.Len*/ !== bits) {
//                              // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
//                              s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
//                              tree[m * 2 + 1]/*.Len*/ = bits;
//                          }
//                          n--;
//                      }
//                  }
//              }


//              /* ===========================================================================
//               * Generate the codes for a given tree and bit counts (which need not be
//               * optimal).
//               * IN assertion: the array bl_count contains the bit length statistics for
//               * the given tree and the field len is set for all tree elements.
//               * OUT assertion: the field code is set for all tree elements of non
//               *     zero code length.
//               */
//              function gen_codes(tree, max_code, bl_count)
//                  //    ct_data *tree;             /* the tree to decorate */
//                  //    int max_code;              /* largest code with non zero frequency */
//                  //    ushf *bl_count;            /* number of codes at each bit length */
//              {
//                  var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */
//                  var code = 0;              /* running code value */
//                  var bits;                  /* bit index */
//                  var n;                     /* code index */

//                  /* The distribution counts are first used to generate the code values
//                   * without bit reversal.
//                   */
//                  for (bits = 1; bits <= MAX_BITS; bits++) {
//                      next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
//                  }
//                  /* Check that the bit counts in bl_count are consistent. The last code
//                   * must be all ones.
//                   */
//                  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
//                  //        "inconsistent bit counts");
//                  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

//                  for (n = 0; n <= max_code; n++) {
//                      var len = tree[n * 2 + 1]/*.Len*/;
//                      if (len === 0) { continue; }
//                      /* Now reverse the bits */
//                      tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

//                      //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
//                      //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
//                  }
//              }


//              /* ===========================================================================
//               * Initialize the various 'constant' tables.
//               */
//              function tr_static_init() {
//                  var n;        /* iterates over tree elements */
//                  var bits;     /* bit counter */
//                  var length;   /* length value */
//                  var code;     /* code value */
//                  var dist;     /* distance index */
//                  var bl_count = new Array(MAX_BITS + 1);
//                  /* number of codes at each bit length for an optimal tree */

//                  // do check in _tr_init()
//                  //if (static_init_done) return;

//                  /* For some embedded targets, global variables are not initialized: */
//                  /*#ifdef NO_INIT_GLOBAL_POINTERS
//                    static_l_desc.static_tree = static_ltree;
//                    static_l_desc.extra_bits = extra_lbits;
//                    static_d_desc.static_tree = static_dtree;
//                    static_d_desc.extra_bits = extra_dbits;
//                    static_bl_desc.extra_bits = extra_blbits;
//                  #endif*/

//                  /* Initialize the mapping length (0..255) -> length code (0..28) */
//                  length = 0;
//                  for (code = 0; code < LENGTH_CODES - 1; code++) {
//                      base_length[code] = length;
//                      for (n = 0; n < (1 << extra_lbits[code]) ; n++) {
//                          _length_code[length++] = code;
//                      }
//                  }
//                  //Assert (length == 256, "tr_static_init: length != 256");
//                  /* Note that the length 255 (match length 258) can be represented
//                   * in two different ways: code 284 + 5 bits or code 285, so we
//                   * overwrite length_code[255] to use the best encoding:
//                   */
//                  _length_code[length - 1] = code;

//                  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
//                  dist = 0;
//                  for (code = 0 ; code < 16; code++) {
//                      base_dist[code] = dist;
//                      for (n = 0; n < (1 << extra_dbits[code]) ; n++) {
//                          _dist_code[dist++] = code;
//                      }
//                  }
//                  //Assert (dist == 256, "tr_static_init: dist != 256");
//                  dist >>= 7; /* from now on, all distances are divided by 128 */
//                  for (; code < D_CODES; code++) {
//                      base_dist[code] = dist << 7;
//                      for (n = 0; n < (1 << (extra_dbits[code] - 7)) ; n++) {
//                          _dist_code[256 + dist++] = code;
//                      }
//                  }
//                  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

//                  /* Construct the codes of the static literal tree */
//                  for (bits = 0; bits <= MAX_BITS; bits++) {
//                      bl_count[bits] = 0;
//                  }

//                  n = 0;
//                  while (n <= 143) {
//                      static_ltree[n * 2 + 1]/*.Len*/ = 8;
//                      n++;
//                      bl_count[8]++;
//                  }
//                  while (n <= 255) {
//                      static_ltree[n * 2 + 1]/*.Len*/ = 9;
//                      n++;
//                      bl_count[9]++;
//                  }
//                  while (n <= 279) {
//                      static_ltree[n * 2 + 1]/*.Len*/ = 7;
//                      n++;
//                      bl_count[7]++;
//                  }
//                  while (n <= 287) {
//                      static_ltree[n * 2 + 1]/*.Len*/ = 8;
//                      n++;
//                      bl_count[8]++;
//                  }
//                  /* Codes 286 and 287 do not exist, but we must include them in the
//                   * tree construction to get a canonical Huffman tree (longest code
//                   * all ones)
//                   */
//                  gen_codes(static_ltree, L_CODES + 1, bl_count);

//                  /* The static distance tree is trivial: */
//                  for (n = 0; n < D_CODES; n++) {
//                      static_dtree[n * 2 + 1]/*.Len*/ = 5;
//                      static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
//                  }

//                  // Now data ready and we can init static trees
//                  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
//                  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
//                  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);

//                  //static_init_done = true;
//              }


//              /* ===========================================================================
//               * Initialize a new block.
//               */
//              function init_block(s) {
//                  var n; /* iterates over tree elements */

//                  /* Initialize the trees. */
//                  for (n = 0; n < L_CODES; n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
//                  for (n = 0; n < D_CODES; n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
//                  for (n = 0; n < BL_CODES; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

//                  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
//                  s.opt_len = s.static_len = 0;
//                  s.last_lit = s.matches = 0;
//              }


//              /* ===========================================================================
//               * Flush the bit buffer and align the output on a byte boundary
//               */
//              function bi_windup(s) {
//                  if (s.bi_valid > 8) {
//                      put_short(s, s.bi_buf);
//                  } else if (s.bi_valid > 0) {
//                      //put_byte(s, (Byte)s->bi_buf);
//                      s.pending_buf[s.pending++] = s.bi_buf;
//                  }
//                  s.bi_buf = 0;
//                  s.bi_valid = 0;
//              }

//              /* ===========================================================================
//               * Copy a stored block, storing first the length and its
//               * one's complement if requested.
//               */
//              function copy_block(s, buf, len, header)
//                  //DeflateState *s;
//                  //charf    *buf;    /* the input data */
//                  //unsigned len;     /* its length */
//                  //int      header;  /* true if block header must be written */
//              {
//                  bi_windup(s);        /* align on byte boundary */

//                  if (header) {
//                      put_short(s, len);
//                      put_short(s, ~len);
//                  }
//                  //  while (len--) {
//                  //    put_byte(s, *buf++);
//                  //  }
//                  utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
//                  s.pending += len;
//              }

//              /* ===========================================================================
//               * Compares to subtrees, using the tree depth as tie breaker when
//               * the subtrees have equal frequency. This minimizes the worst case length.
//               */
//              function smaller(tree, n, m, depth) {
//                  var _n2 = n * 2;
//                  var _m2 = m * 2;
//                  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
//                         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
//              }

//              /* ===========================================================================
//               * Restore the heap property by moving down the tree starting at node k,
//               * exchanging a node with the smallest of its two sons if necessary, stopping
//               * when the heap property is re-established (each father smaller than its
//               * two sons).
//               */
//              function pqdownheap(s, tree, k)
//                  //    deflate_state *s;
//                  //    ct_data *tree;  /* the tree to restore */
//                  //    int k;               /* node to move down */
//              {
//                  var v = s.heap[k];
//                  var j = k << 1;  /* left son of k */
//                  while (j <= s.heap_len) {
//                      /* Set j to the smallest of the two sons: */
//                      if (j < s.heap_len &&
//                        smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
//                          j++;
//                      }
//                      /* Exit if v is smaller than both sons */
//                      if (smaller(tree, v, s.heap[j], s.depth)) { break; }

//                      /* Exchange v with the smallest son */
//                      s.heap[k] = s.heap[j];
//                      k = j;

//                      /* And continue down the tree, setting j to the left son of k */
//                      j <<= 1;
//                  }
//                  s.heap[k] = v;
//              }


//              // inlined manually
//              // var SMALLEST = 1;

//              /* ===========================================================================
//               * Send the block data compressed using the given Huffman trees
//               */
//              function compress_block(s, ltree, dtree)
//                  //    deflate_state *s;
//                  //    const ct_data *ltree; /* literal tree */
//                  //    const ct_data *dtree; /* distance tree */
//              {
//                  var dist;           /* distance of matched string */
//                  var lc;             /* match length or unmatched char (if dist == 0) */
//                  var lx = 0;         /* running index in l_buf */
//                  var code;           /* the code to send */
//                  var extra;          /* number of extra bits to send */

//                  if (s.last_lit !== 0) {
//                      do {
//                          dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
//                          lc = s.pending_buf[s.l_buf + lx];
//                          lx++;

//                          if (dist === 0) {
//                              send_code(s, lc, ltree); /* send a literal byte */
//                              //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
//                          } else {
//                              /* Here, lc is the match length - MIN_MATCH */
//                              code = _length_code[lc];
//                              send_code(s, code + LITERALS + 1, ltree); /* send the length code */
//                              extra = extra_lbits[code];
//                              if (extra !== 0) {
//                                  lc -= base_length[code];
//                                  send_bits(s, lc, extra);       /* send the extra length bits */
//                              }
//                              dist--; /* dist is now the match distance - 1 */
//                              code = d_code(dist);
//                              //Assert (code < D_CODES, "bad d_code");

//                              send_code(s, code, dtree);       /* send the distance code */
//                              extra = extra_dbits[code];
//                              if (extra !== 0) {
//                                  dist -= base_dist[code];
//                                  send_bits(s, dist, extra);   /* send the extra distance bits */
//                              }
//                          } /* literal or match pair ? */

//                          /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
//                          //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
//                          //       "pendingBuf overflow");

//                      } while (lx < s.last_lit);
//                  }

//                  send_code(s, END_BLOCK, ltree);
//              }


//              /* ===========================================================================
//               * Construct one Huffman tree and assigns the code bit strings and lengths.
//               * Update the total bit length for the current block.
//               * IN assertion: the field freq is set for all tree elements.
//               * OUT assertions: the fields len and code are set to the optimal bit length
//               *     and corresponding code. The length opt_len is updated; static_len is
//               *     also updated if stree is not null. The field max_code is set.
//               */
//              function build_tree(s, desc)
//                  //    deflate_state *s;
//                  //    tree_desc *desc; /* the tree descriptor */
//              {
//                  var tree = desc.dyn_tree;
//                  var stree = desc.stat_desc.static_tree;
//                  var has_stree = desc.stat_desc.has_stree;
//                  var elems = desc.stat_desc.elems;
//                  var n, m;          /* iterate over heap elements */
//                  var max_code = -1; /* largest code with non zero frequency */
//                  var node;          /* new node being created */

//                  /* Construct the initial heap, with least frequent element in
//                   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
//                   * heap[0] is not used.
//                   */
//                  s.heap_len = 0;
//                  s.heap_max = HEAP_SIZE;

//                  for (n = 0; n < elems; n++) {
//                      if (tree[n * 2]/*.Freq*/ !== 0) {
//                          s.heap[++s.heap_len] = max_code = n;
//                          s.depth[n] = 0;

//                      } else {
//                          tree[n * 2 + 1]/*.Len*/ = 0;
//                      }
//                  }

//                  /* The pkzip format requires that at least one distance code exists,
//                   * and that at least one bit should be sent even if there is only one
//                   * possible code. So to avoid special checks later on we force at least
//                   * two codes of non zero frequency.
//                   */
//                  while (s.heap_len < 2) {
//                      node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
//                      tree[node * 2]/*.Freq*/ = 1;
//                      s.depth[node] = 0;
//                      s.opt_len--;

//                      if (has_stree) {
//                          s.static_len -= stree[node * 2 + 1]/*.Len*/;
//                      }
//                      /* node is 0 or 1 so it does not have extra bits */
//                  }
//                  desc.max_code = max_code;

//                  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
//                   * establish sub-heaps of increasing lengths:
//                   */
//                  for (n = (s.heap_len >> 1/*int /2*/) ; n >= 1; n--) { pqdownheap(s, tree, n); }

//                  /* Construct the Huffman tree by repeatedly combining the least two
//                   * frequent nodes.
//                   */
//                  node = elems;              /* next internal node of the tree */
//                  do {
//                      //pqremove(s, tree, n);  /* n = node of least frequency */
//                      /*** pqremove ***/
//                      n = s.heap[1/*SMALLEST*/];
//                      s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
//                      pqdownheap(s, tree, 1/*SMALLEST*/);
//                      /***/

//                      m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

//                      s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
//                      s.heap[--s.heap_max] = m;

//                      /* Create a new node father of n and m */
//                      tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
//                      s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
//                      tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

//                      /* and insert the new node in the heap */
//                      s.heap[1/*SMALLEST*/] = node++;
//                      pqdownheap(s, tree, 1/*SMALLEST*/);

//                  } while (s.heap_len >= 2);

//                  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

//                  /* At this point, the fields freq and dad are set. We can now
//                   * generate the bit lengths.
//                   */
//                  gen_bitlen(s, desc);

//                  /* The field len is now set, we can generate the bit codes */
//                  gen_codes(tree, max_code, s.bl_count);
//              }


//              /* ===========================================================================
//               * Scan a literal or distance tree to determine the frequencies of the codes
//               * in the bit length tree.
//               */
//              function scan_tree(s, tree, max_code)
//                  //    deflate_state *s;
//                  //    ct_data *tree;   /* the tree to be scanned */
//                  //    int max_code;    /* and its largest code of non zero frequency */
//              {
//                  var n;                     /* iterates over all tree elements */
//                  var prevlen = -1;          /* last emitted length */
//                  var curlen;                /* length of current code */

//                  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

//                  var count = 0;             /* repeat count of the current code */
//                  var max_count = 7;         /* max repeat count */
//                  var min_count = 4;         /* min repeat count */

//                  if (nextlen === 0) {
//                      max_count = 138;
//                      min_count = 3;
//                  }
//                  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

//                  for (n = 0; n <= max_code; n++) {
//                      curlen = nextlen;
//                      nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

//                      if (++count < max_count && curlen === nextlen) {
//                          continue;

//                      } else if (count < min_count) {
//                          s.bl_tree[curlen * 2]/*.Freq*/ += count;

//                      } else if (curlen !== 0) {

//                          if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
//                          s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

//                      } else if (count <= 10) {
//                          s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

//                      } else {
//                          s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
//                      }

//                      count = 0;
//                      prevlen = curlen;

//                      if (nextlen === 0) {
//                          max_count = 138;
//                          min_count = 3;

//                      } else if (curlen === nextlen) {
//                          max_count = 6;
//                          min_count = 3;

//                      } else {
//                          max_count = 7;
//                          min_count = 4;
//                      }
//                  }
//              }


//              /* ===========================================================================
//               * Send a literal or distance tree in compressed form, using the codes in
//               * bl_tree.
//               */
//              function send_tree(s, tree, max_code)
//                  //    deflate_state *s;
//                  //    ct_data *tree; /* the tree to be scanned */
//                  //    int max_code;       /* and its largest code of non zero frequency */
//              {
//                  var n;                     /* iterates over all tree elements */
//                  var prevlen = -1;          /* last emitted length */
//                  var curlen;                /* length of current code */

//                  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

//                  var count = 0;             /* repeat count of the current code */
//                  var max_count = 7;         /* max repeat count */
//                  var min_count = 4;         /* min repeat count */

//                  /* tree[max_code+1].Len = -1; */  /* guard already set */
//                  if (nextlen === 0) {
//                      max_count = 138;
//                      min_count = 3;
//                  }

//                  for (n = 0; n <= max_code; n++) {
//                      curlen = nextlen;
//                      nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

//                      if (++count < max_count && curlen === nextlen) {
//                          continue;

//                      } else if (count < min_count) {
//                          do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

//                      } else if (curlen !== 0) {
//                          if (curlen !== prevlen) {
//                              send_code(s, curlen, s.bl_tree);
//                              count--;
//                          }
//                          //Assert(count >= 3 && count <= 6, " 3_6?");
//                          send_code(s, REP_3_6, s.bl_tree);
//                          send_bits(s, count - 3, 2);

//                      } else if (count <= 10) {
//                          send_code(s, REPZ_3_10, s.bl_tree);
//                          send_bits(s, count - 3, 3);

//                      } else {
//                          send_code(s, REPZ_11_138, s.bl_tree);
//                          send_bits(s, count - 11, 7);
//                      }

//                      count = 0;
//                      prevlen = curlen;
//                      if (nextlen === 0) {
//                          max_count = 138;
//                          min_count = 3;

//                      } else if (curlen === nextlen) {
//                          max_count = 6;
//                          min_count = 3;

//                      } else {
//                          max_count = 7;
//                          min_count = 4;
//                      }
//                  }
//              }


//              /* ===========================================================================
//               * Construct the Huffman tree for the bit lengths and return the index in
//               * bl_order of the last bit length code to send.
//               */
//              function build_bl_tree(s) {
//                  var max_blindex;  /* index of last bit length code of non zero freq */

//                  /* Determine the bit length frequencies for literal and distance trees */
//                  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
//                  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

//                  /* Build the bit length tree: */
//                  build_tree(s, s.bl_desc);
//                  /* opt_len now includes the length of the tree representations, except
//                   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
//                   */

//                  /* Determine the number of bit length codes to send. The pkzip format
//                   * requires that at least 4 bit length codes be sent. (appnote.txt says
//                   * 3 but the actual value used is 4.)
//                   */
//                  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
//                      if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
//                          break;
//                      }
//                  }
//                  /* Update opt_len to include the bit length tree and counts */
//                  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
//                  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
//                  //        s->opt_len, s->static_len));

//                  return max_blindex;
//              }


//              /* ===========================================================================
//               * Send the header for a block using dynamic Huffman trees: the counts, the
//               * lengths of the bit length codes, the literal tree and the distance tree.
//               * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
//               */
//              function send_all_trees(s, lcodes, dcodes, blcodes)
//                  //    deflate_state *s;
//                  //    int lcodes, dcodes, blcodes; /* number of codes for each tree */
//              {
//                  var rank;                    /* index in bl_order */

//                  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
//                  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
//                  //        "too many codes");
//                  //Tracev((stderr, "\nbl counts: "));
//                  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
//                  send_bits(s, dcodes - 1, 5);
//                  send_bits(s, blcodes - 4, 4); /* not -3 as stated in appnote.txt */
//                  for (rank = 0; rank < blcodes; rank++) {
//                      //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
//                      send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
//                  }
//                  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

//                  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
//                  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

//                  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
//                  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
//              }


//              /* ===========================================================================
//               * Check if the data type is TEXT or BINARY, using the following algorithm:
//               * - TEXT if the two conditions below are satisfied:
//               *    a There are no non-portable control characters belonging to the
//               *       "black list" (0..6, 14..25, 28..31).
//               *    b There is at least one printable character belonging to the
//               *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
//               * - BINARY otherwise.
//               * - The following partially-portable control characters form a
//               *   "gray list" that is ignored in this detection algorithm:
//               *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
//               * IN assertion: the fields Freq of dyn_ltree are set.
//               */
//              function detect_data_type(s) {
//                  /* black_mask is the bit mask of black-listed bytes
//                   * set bits 0..6, 14..25, and 28..31
//                   * 0xf3ffc07f = binary 11110011111111111100000001111111
//                   */
//                  var black_mask = 0xf3ffc07f;
//                  var n;

//                  /* Check for non-textual ("black-listed") bytes. */
//                  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
//                      if ((black_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
//                          return Z_BINARY;
//                      }
//                  }

//                  /* Check for textual ("white-listed") bytes. */
//                  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
//                      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
//                      return Z_TEXT;
//                  }
//                  for (n = 32; n < LITERALS; n++) {
//                      if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
//                          return Z_TEXT;
//                      }
//                  }

//                  /* There are no "black-listed" or "white-listed" bytes:
//                   * this stream either is empty or has tolerated ("gray-listed") bytes only.
//                   */
//                  return Z_BINARY;
//              }


//              var static_init_done = false;

//              /* ===========================================================================
//               * Initialize the tree data structures for a new zlib stream.
//               */
//              function _tr_init(s) {

//                  if (!static_init_done) {
//                      tr_static_init();
//                      static_init_done = true;
//                  }

//                  s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
//                  s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
//                  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

//                  s.bi_buf = 0;
//                  s.bi_valid = 0;

//                  /* Initialize the first block of the first file: */
//                  init_block(s);
//              }


//              /* ===========================================================================
//               * Send a stored block
//               */
//              function _tr_stored_block(s, buf, stored_len, last)
//                  //DeflateState *s;
//                  //charf *buf;       /* input block */
//                  //ulg stored_len;   /* length of input block */
//                  //int last;         /* one if this is the last block for a file */
//              {
//                  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
//                  copy_block(s, buf, stored_len, true); /* with header */
//              }


//              /* ===========================================================================
//               * Send one empty static block to give enough lookahead for inflate.
//               * This takes 10 bits, of which 7 may remain in the bit buffer.
//               */
//              function _tr_align(s) {
//                  send_bits(s, STATIC_TREES << 1, 3);
//                  send_code(s, END_BLOCK, static_ltree);
//                  bi_flush(s);
//              }


//              /* ===========================================================================
//               * Determine the best encoding for the current block: dynamic trees, static
//               * trees or store, and output the encoded block to the zip file.
//               */
//              function _tr_flush_block(s, buf, stored_len, last)
//                  //DeflateState *s;
//                  //charf *buf;       /* input block, or NULL if too old */
//                  //ulg stored_len;   /* length of input block */
//                  //int last;         /* one if this is the last block for a file */
//              {
//                  var opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
//                  var max_blindex = 0;        /* index of last bit length code of non zero freq */

//                  /* Build the Huffman trees unless a stored block is forced */
//                  if (s.level > 0) {

//                      /* Check if the file is binary or text */
//                      if (s.strm.data_type === Z_UNKNOWN) {
//                          s.strm.data_type = detect_data_type(s);
//                      }

//                      /* Construct the literal and distance trees */
//                      build_tree(s, s.l_desc);
//                      // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
//                      //        s->static_len));

//                      build_tree(s, s.d_desc);
//                      // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
//                      //        s->static_len));
//                      /* At this point, opt_len and static_len are the total bit lengths of
//                       * the compressed block data, excluding the tree representations.
//                       */

//                      /* Build the bit length tree for the above two trees, and get the index
//                       * in bl_order of the last bit length code to send.
//                       */
//                      max_blindex = build_bl_tree(s);

//                      /* Determine the best encoding. Compute the block lengths in bytes. */
//                      opt_lenb = (s.opt_len + 3 + 7) >>> 3;
//                      static_lenb = (s.static_len + 3 + 7) >>> 3;

//                      // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
//                      //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
//                      //        s->last_lit));

//                      if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

//                  } else {
//                      // Assert(buf != (char*)0, "lost buf");
//                      opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
//                  }

//                  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
//                      /* 4: two words for the lengths */

//                      /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
//                       * Otherwise we can't have processed more than WSIZE input bytes since
//                       * the last block flush, because compression would have been
//                       * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
//                       * transform a block into a stored block.
//                       */
//                      _tr_stored_block(s, buf, stored_len, last);

//                  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

//                      send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
//                      compress_block(s, static_ltree, static_dtree);

//                  } else {
//                      send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
//                      send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
//                      compress_block(s, s.dyn_ltree, s.dyn_dtree);
//                  }
//                  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
//                  /* The above check is made mod 2^32, for files larger than 512 MB
//                   * and uLong implemented on 32 bits.
//                   */
//                  init_block(s);

//                  if (last) {
//                      bi_windup(s);
//                  }
//                  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
//                  //       s->compressed_len-7*last));
//              }

//              /* ===========================================================================
//               * Save the match info and tally the frequency counts. Return true if
//               * the current block must be flushed.
//               */
//              function _tr_tally(s, dist, lc)
//                  //    deflate_state *s;
//                  //    unsigned dist;  /* distance of matched string */
//                  //    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
//              {
//                  //var out_length, in_length, dcode;

//                  s.pending_buf[s.d_buf + s.last_lit * 2] = (dist >>> 8) & 0xff;
//                  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

//                  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
//                  s.last_lit++;

//                  if (dist === 0) {
//                      /* lc is the unmatched char */
//                      s.dyn_ltree[lc * 2]/*.Freq*/++;
//                  } else {
//                      s.matches++;
//                      /* Here, lc is the match length - MIN_MATCH */
//                      dist--;             /* dist = match distance - 1 */
//                      //Assert((ush)dist < (ush)MAX_DIST(s) &&
//                      //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
//                      //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

//                      s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]/*.Freq*/++;
//                      s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
//                  }

//                  // (!) This block is disabled in zlib defailts,
//                  // don't enable it for binary compatibility

//                  //#ifdef TRUNCATE_BLOCK
//                  //  /* Try to guess if it is profitable to stop the current block here */
//                  //  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//                  //    /* Compute an upper bound for the compressed length */
//                  //    out_length = s.last_lit*8;
//                  //    in_length = s.strstart - s.block_start;
//                  //
//                  //    for (dcode = 0; dcode < D_CODES; dcode++) {
//                  //      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//                  //    }
//                  //    out_length >>>= 3;
//                  //    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//                  //    //       s->last_lit, in_length, out_length,
//                  //    //       100L - out_length*100L/in_length));
//                  //    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//                  //      return true;
//                  //    }
//                  //  }
//                  //#endif

//                  return (s.last_lit === s.lit_bufsize - 1);
//                  /* We avoid equality with lit_bufsize because of wraparound at 64K
//                   * on 16 bit machines and because stored blocks are restricted to
//                   * 64K-1 bytes.
//                   */
//              }

//              exports._tr_init = _tr_init;
//              exports._tr_stored_block = _tr_stored_block;
//              exports._tr_flush_block = _tr_flush_block;
//              exports._tr_tally = _tr_tally;
//              exports._tr_align = _tr_align;
//          }, { "../utils/common": 2 }], 9: [function (_dereq_, module, exports) {
//              'use strict';


//              function ZStream() {
//                  /* next input byte */
//                  this.input = null; // JS specific, because we have no pointers
//                  this.next_in = 0;
//                  /* number of bytes available at input */
//                  this.avail_in = 0;
//                  /* total number of input bytes read so far */
//                  this.total_in = 0;
//                  /* next output byte should be put there */
//                  this.output = null; // JS specific, because we have no pointers
//                  this.next_out = 0;
//                  /* remaining free space at output */
//                  this.avail_out = 0;
//                  /* total number of bytes output so far */
//                  this.total_out = 0;
//                  /* last error message, NULL if no error */
//                  this.msg = ''/*Z_NULL*/;
//                  /* not visible by applications */
//                  this.state = null;
//                  /* best guess about the data type: binary or text */
//                  this.data_type = 2/*Z_UNKNOWN*/;
//                  /* adler32 value of the uncompressed data */
//                  this.adler = 0;
//              }

//              module.exports = ZStream;
//          }, {}]
//      }, {}, [1])
//    (1)
//  });

//====================store.js==============================
/* Copyright (c) 2010-2016 Marcus Westin */
(function (f) { if (typeof exports === "object" && typeof module !== "undefined") { module.exports = f() } else if (typeof define === "function" && define.amd) { define([], f) } else { var g; if (typeof window !== "undefined") { g = window } else if (typeof global !== "undefined") { g = global } else if (typeof self !== "undefined") { g = self } else { g = this } g.store = f() } })(function () {
    var define, module, exports; return (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f } var l = n[o] = { exports: {} }; t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e) }, l, l.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++) s(r[o]); return s })({
        1: [function (require, module, exports) {
            (function (global) {
                "use strict"; module.exports = function () { function e() { try { return o in n && n[o] } catch (e) { return !1 } } var t, r = {}, n = "undefined" != typeof window ? window : global, i = n.document, o = "localStorage", a = "script"; if (r.disabled = !1, r.version = "1.3.20", r.set = function (e, t) { }, r.get = function (e, t) { }, r.has = function (e) { return void 0 !== r.get(e) }, r.remove = function (e) { }, r.clear = function () { }, r.transact = function (e, t, n) { null == n && (n = t, t = null), null == t && (t = {}); var i = r.get(e, t); n(i), r.set(e, i) }, r.getAll = function () { }, r.forEach = function () { }, r.serialize = function (e) { return JSON.stringify(e) }, r.deserialize = function (e) { if ("string" == typeof e) try { return JSON.parse(e) } catch (t) { return e || void 0 } }, e()) t = n[o], r.set = function (e, n) { return void 0 === n ? r.remove(e) : (t.setItem(e, r.serialize(n)), n) }, r.get = function (e, n) { var i = r.deserialize(t.getItem(e)); return void 0 === i ? n : i }, r.remove = function (e) { t.removeItem(e) }, r.clear = function () { t.clear() }, r.getAll = function () { var e = {}; return r.forEach(function (t, r) { e[t] = r }), e }, r.forEach = function (e) { for (var n = 0; n < t.length; n++) { var i = t.key(n); e(i, r.get(i)) } }; else if (i && i.documentElement.addBehavior) { var c, u; try { u = new ActiveXObject("htmlfile"), u.open(), u.write("<" + a + ">document.w=window</" + a + '><iframe src="/favicon.ico"></iframe>'), u.close(), c = u.w.frames[0].document, t = c.createElement("div") } catch (l) { t = i.createElement("div"), c = i.body } var f = function (e) { return function () { var n = Array.prototype.slice.call(arguments, 0); n.unshift(t), c.appendChild(t), t.addBehavior("#default#userData"), t.load(o); var i = e.apply(r, n); return c.removeChild(t), i } }, d = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g"), s = function (e) { return e.replace(/^d/, "___$&").replace(d, "___") }; r.set = f(function (e, t, n) { return t = s(t), void 0 === n ? r.remove(t) : (e.setAttribute(t, r.serialize(n)), e.save(o), n) }), r.get = f(function (e, t, n) { t = s(t); var i = r.deserialize(e.getAttribute(t)); return void 0 === i ? n : i }), r.remove = f(function (e, t) { t = s(t), e.removeAttribute(t), e.save(o) }), r.clear = f(function (e) { var t = e.XMLDocument.documentElement.attributes; e.load(o); for (var r = t.length - 1; r >= 0; r--) e.removeAttribute(t[r].name); e.save(o) }), r.getAll = function (e) { var t = {}; return r.forEach(function (e, r) { t[e] = r }), t }, r.forEach = f(function (e, t) { for (var n, i = e.XMLDocument.documentElement.attributes, o = 0; n = i[o]; ++o) t(n.name, r.deserialize(e.getAttribute(n.name))) }) } try { var v = "__storejs__"; r.set(v, v), r.get(v) != v && (r.disabled = !0), r.remove(v) } catch (l) { r.disabled = !0 } return r.enabled = !r.disabled, r }();
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {}]
    }, {}, [1])(1)
});
