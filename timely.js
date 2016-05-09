window.onload = function () {
    var objs = {};
    objs = yzkgetElementsByClass("youziku");
    var accessKey = "";
    var fontid = 0;
    for (var i in objs) {
        var obj = objs[i];
        accessKey = obj.className.trim().split(" ")[0].split("-")[1];
        FontProcessModule.getInitFontInfo(accessKey);

        obj.oninput = function () {
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
//function buffer2url(buffer, typename) {
//    return URL.createObjectURL(new Blob([buffer.buffer], { type: 'application/vnd.ms-fontobject' }));
//}

function yzkgetElementsByClass(classN) {
    var elements = [];
    var listElm = document.getElementsByTagName('input');
    var listElmt = document.getElementsByTagName('textarea');

    for (var i = 0; i < listElm.length; i++) {

        if (listElm[i].className === 'undefined') {
            continue;
        }
        if (hasClass(listElm[i].className, classN))
            elements.push(listElm[i]);
    }
    for (var i = 0; i < listElmt.length; i++) {

        if (listElmt[i].className === 'undefined') {
            continue;
        }
        if (hasClass(listElmt[i].className, classN))
            elements.push(listElmt[i]);
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

    //function tripletToBase64(num) {
    //    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    //}

    //function encodeChunk(uint8, start, end) {
    //    var tmp
    //    var output = []
    //    for (var i = start; i < end; i += 3) {
    //        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    //        output.push(tripletToBase64(tmp))
    //    }
    //    return output.join('')
    //}
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

//function readUrlBinary(filepath, obj) {
//    var oReq = new XMLHttpRequest();
//    oReq.open("GET", "/" + filepath, true);
//    oReq.responseType = "arraybuffer";

//    oReq.onload = function (oEvent) {
//        var arrayBuffer = oReq.response; // Note: not oReq.responseText
//        if (arrayBuffer) {
//            var byteArray = new Uint8Array(arrayBuffer);
//            lastname = getFileName(filepath);
//            obj.SetValueByFilename(lastname, byteArray);
//            //Log("load filepath : " + filepath + " len=" + byteArray.length);
//        }
//    };

//    oReq.send(null);
//}

//function readUrlText(filepath, obj) {
//    var oReq = new XMLHttpRequest();
//    oReq.open("GET", "/" + filepath, true);
//    oReq.responseType = "text";

//    oReq.onload = function (oEvent) {
//        var content = oReq.responseText; // Note: not oReq.responseText
//        if (content) {
//            lastname = getFileName(filepath);
//            obj.SetValueByFilename(lastname, content);
//            //Log("load filepath : " + filepath + " = " + content + " len=" + content.length);
//        }
//    };

//    oReq.send(null);
//}

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

function deepWriteUint8Array(srcArray, subArray, offset) {
    if (subArray === null || typeof subArray === 'undefined' || subArray === 'undefined') {
        return
    }
    var isTyped = Array.isArray(srcArray);
    if (isTyped) {
        srcArray.set(subArray, offset);
    } else {
        for (var i = 0; i < subArray.length; i++) {
            srcArray[i + offset] = subArray[i];
        }
    }
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
        var maxExponent = Math.floor(getBaseLog(2, segCount));
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
            var item = glyfsList[n];
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
            var item = glyfsList[n];
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
            var item = glyfsList[i];
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

    function toHex(d) {
        return ("0" + (Number(d).toString(16))).slice(-2).toUpperCase()
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
            var str;
            str = u.toString(16);
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
            var item = glyfsList[n];
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
            var item = glyfsList[n];
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
    //hhea鐨勬暟鎹緷璧栦簬head鍜宱s/2
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

    //9-24鏃ユ坊鍔�-淇濆瓨鐏板害鑹�
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
        if (TableTTFs.GaspTable == null || TableTTFs.GaspTable.length == 0)   //濡傛灉Gasp涓虹┖锛屽垯娣诲姞涓€涓粯璁ょ殑
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
            var item = ttfTableEntryList[t];
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
        var item = ttfTableEntryList[t];
        if (item.m_Tag == TAG.HEAD) {
            headOffset = offset;
        }
        if (item.m_DataBytes === 'undefined' || typeof item.m_DataBytes === 'undefined') {
            continue;
        }
        ttfArray.set(item.m_DataBytes, offset);
        // deepWriteUint8Array(ttfArray, item.m_DataBytes, offset);
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
    //var container = document.getElementById('fonts');
    //var link = container.insertBefore(document.createElement('a'), container.firstElementChild);
    //link.textContent = link.download = "test" + count_file + ".ttf";
    //link.href = buffer2url_woff(ttfArray);
    //count_file++;

    var br = navigator.sayswho;
    if (br.indexOf("IE") >= 0 ) {
        console.log("this is ie br");
        var eotArray = Ttf2EotModule.ttf2eot(ttfArray);
        //var container = document.getElementById('fonts');
        //var link = container.insertBefore(document.createElement('a'), container.firstElementChild);
        //link.textContent = link.download = "test" + count_file + ".eot";
        //link.href = buffer2url(eotArray, "vnd.ms-fontobject");
        //count_file++;
        return eotArray;
    }
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



function createfontface(accesskey, woffArray,fontid) {
    var br = navigator.sayswho;
    var font_type = "font-ttf";
    var format_type = "truetype";
    var blob;
    if (br.indexOf("IE") >= 0) {
        format_type = "embedded-opentype";
        blob = new Blob([woffArray.buffer], { type: 'application/vnd.ms-fontobject' });
    } else {
        blob = new Blob([woffArray], { type: 'application/font-ttf' });
    }
    // var blob = new Blob([woffArray.buffer], { type: 'application/font-eot'});
    // var blob = new Blob([woffArray.buffer], { type: 'font/eot'});
    // var blob = new Blob([woffArray.buffer], { type: 'font/ttf'});
    readBlobAsDataURL(blob, function (basewoff) {
        if (format_type == "embedded-opentype")
            basewoff = basewoff + "?#iefix";
        // var fontface = ".youziku-" + accesskey + "{ font-family:'yzk-" + accesskey + "' } @font-face { font-family:'yzk-" + accesskey + "'; src:url('" + basewoff + "') format('" + format_type +"'); }  ";
        var fontface = ".youziku-" + accesskey + "{ font-family:'yzk-" + fontid + "' } @font-face { font-family:'yzk-" + fontid + "'; src:url('" + basewoff + "') format('" + format_type + "'); }  ";
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
    });


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
function changefont(TagName, newaccessKey) {
    
    var listElm = document.getElementsByName(TagName);
    
    for (var i = 0; i < listElm.length; i++) {
        
        if (listElm[i].className === 'undefined') continue;
        if (hasClass(listElm[i].className, "youziku"))
        {
            var oldclass = listElm[i].className.trim().split(" ")[0];
            listElm[i].className = listElm[i].className.replace(oldclass, "youziku-" + newaccessKey);
            FontProcessModule.getInitFontInfo(newaccessKey);
        }
    }


    //var objinput = document.getElementById(inputid);
    //if (objinput) {
    //    if (hasClass(objinput.className, "youziku")) {
    //        var oldclass = objinput.className.trim().split(" ")[0];
    //        objinput.className = objinput.className.replace(oldclass, "youziku-" + newaccessKey);
    //        FontProcessModule.getInitFontInfo(newaccessKey);
    //    }
    //}
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

    function submitData(URL, json, callback, key, accesskey) {
        var xhr = new createXHR();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status != 200 && xhr.status != 304) {
                    //Println('HTTP error ' + xhr.status);
                    return;
                }
                // if (navigator.sayswho.indexOf("Firefox") >= 0) {
                //   var x2js = new X2JS();
                //   xhr.responseText = x2js.xml_str2json(xhr.responseText);
                // }
                callback(xhr.responseText, true, key, accesskey);
            }
        }
        xhr.open('POST', URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.setRequestHeader("Accept", 'application/json, text/javascript');
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
            var cacheJson = store.get("cachefont_" + fontId);
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
        ////鍒濆鍖栧畬鎴愪互鍚庡啀妫€娴嬩竴涓嬶紝鏈夋棤鏂板瓧
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
        generateOneFont(fontid, accessKey);
    }


    function generateOneFont(fontid, accessKey) {
        if (fontid == 0) {
            return null;
        }
        var ttfInfo = ttfInfoMap.get(fontid);
        var glyfsList = glyfInfoMap.getOneFontGlyfs(fontid);

        var woffArray = generateTTFFile(ttfInfo, glyfsList, Err);
        createfontface(accessKey, woffArray, fontid);
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
//===================microbuffer====================
// Light implementation of binary buffer with helpers for easy access.
//
'use strict';


var TYPED_OK = (typeof Uint8Array !== 'undefined');

function createArray(size) {
    return TYPED_OK ? new Uint8Array(size) : Array(size);
}


function MicroBuffer(buffer, start, length) {

    var isInherited = buffer instanceof MicroBuffer;

    this.buffer = isInherited ?
      buffer.buffer
    :
      (typeof buffer === 'number' ? createArray(buffer) : buffer);

    this.start = (start || 0) + (isInherited ? buffer.start : 0);
    this.length = length || (this.buffer.length - this.start);
    this.offset = 0;

    this.isTyped = !Array.isArray(this.buffer);
}


MicroBuffer.prototype.getUint8 = function (pos) {
    return this.buffer[pos + this.start];
};


MicroBuffer.prototype.getUint16 = function (pos, littleEndian) {
    var val;
    if (littleEndian) {
        throw new Error('not implemented');
    } else {
        val = this.buffer[pos + 1 + this.start];
        val += this.buffer[pos + this.start] << 8 >>> 0;
    }
    return val;
};


MicroBuffer.prototype.getUint32 = function (pos, littleEndian) {
    var val;
    if (littleEndian) {
        throw new Error('not implemented');
    } else {
        val = this.buffer[pos + 1 + this.start] << 16;
        val |= this.buffer[pos + 2 + this.start] << 8;
        val |= this.buffer[pos + 3 + this.start];
        val += this.buffer[pos + this.start] << 24 >>> 0;
    }
    return val;
};


MicroBuffer.prototype.setUint8 = function (pos, value) {
    this.buffer[pos + this.start] = value & 0xFF;
};


MicroBuffer.prototype.setUint16 = function (pos, value, littleEndian) {
    var offset = pos + this.start;
    var buf = this.buffer;
    if (littleEndian) {
        buf[offset] = value & 0xFF;
        buf[offset + 1] = (value >>> 8) & 0xFF;
    } else {
        buf[offset] = (value >>> 8) & 0xFF;
        buf[offset + 1] = value & 0xFF;
    }
};


MicroBuffer.prototype.setUint32 = function (pos, value, littleEndian) {
    var offset = pos + this.start;
    var buf = this.buffer;
    if (littleEndian) {
        buf[offset] = value & 0xFF;
        buf[offset + 1] = (value >>> 8) & 0xFF;
        buf[offset + 2] = (value >>> 16) & 0xFF;
        buf[offset + 3] = (value >>> 24) & 0xFF;
    } else {
        buf[offset] = (value >>> 24) & 0xFF;
        buf[offset + 1] = (value >>> 16) & 0xFF;
        buf[offset + 2] = (value >>> 8) & 0xFF;
        buf[offset + 3] = value & 0xFF;
    }
};


MicroBuffer.prototype.writeUint8 = function (value) {
    this.buffer[this.offset + this.start] = value & 0xFF;
    this.offset++;
};


MicroBuffer.prototype.writeInt8 = function (value) {
    this.setUint8(this.offset, (value < 0) ? 0xFF + value + 1 : value);
    this.offset++;
};


MicroBuffer.prototype.writeUint16 = function (value, littleEndian) {
    this.setUint16(this.offset, value, littleEndian);
    this.offset += 2;
};


MicroBuffer.prototype.writeInt16 = function (value, littleEndian) {
    this.setUint16(this.offset, (value < 0) ? 0xFFFF + value + 1 : value, littleEndian);
    this.offset += 2;
};


MicroBuffer.prototype.writeUint32 = function (value, littleEndian) {
    this.setUint32(this.offset, value, littleEndian);
    this.offset += 4;
};


MicroBuffer.prototype.writeInt32 = function (value, littleEndian) {
    this.setUint32(this.offset, (value < 0) ? 0xFFFFFFFF + value + 1 : value, littleEndian);
    this.offset += 4;
};


// get current position
//
MicroBuffer.prototype.tell = function () {
    return this.offset;
};


// set current position
//
MicroBuffer.prototype.seek = function (pos) {
    this.offset = pos;
};


MicroBuffer.prototype.fill = function (value) {
    var index = this.length - 1;
    while (index >= 0) {
        this.buffer[index + this.start] = value;
        index--;
    }
};


MicroBuffer.prototype.writeUint64 = function (value) {
    // we canot use bitwise operations for 64bit values because of JavaScript limitations,
    // instead we should divide it to 2 Int32 numbers
    // 2^32 = 4294967296
    var hi = Math.floor(value / 4294967296);
    var lo = value - hi * 4294967296;
    this.writeUint32(hi);
    this.writeUint32(lo);
};


MicroBuffer.prototype.writeBytes = function (data) {
    var buffer = this.buffer;
    var offset = this.offset + this.start;
    if (this.isTyped) {
        buffer.set(data, offset);
    } else {
        for (var i = 0; i < data.length; i++) {
            buffer[i + offset] = data[i];
        }
    }
    this.offset += data.length;
};


MicroBuffer.prototype.toString = function (offset, length) {
    // default values if not set
    offset = (offset || 0);
    length = length || (this.length - offset);

    // add buffer shift
    var start = offset + this.start;
    var end = start + length;

    var string = '';
    for (var i = start; i < end; i++) {
        string += String.fromCharCode(this.buffer[i]);
    }
    return string;
};


MicroBuffer.prototype.toArray = function () {
    if (this.isTyped) {
        return this.buffer.subarray(this.start, this.start + this.length);
    }

    return this.buffer.slice(this.start, this.start + this.length);
};

var ByteBuffer = MicroBuffer;

//=====================ttf2eot========================
//

var Ttf2EotModule = (function () {
    function Module() {
    }
    /**
     * Offsets in EOT file structure. Refer to EOTPrefix in OpenTypeUtilities.cpp
     */
    var EOT_OFFSET = {
        LENGTH: 0,
        FONT_LENGTH: 4,
        VERSION: 8,
        CHARSET: 26,
        MAGIC: 34,
        FONT_PANOSE: 16,
        ITALIC: 27,
        WEIGHT: 28,
        UNICODE_RANGE: 36,
        CODEPAGE_RANGE: 52,
        CHECKSUM_ADJUSTMENT: 60
    };

    /**
     * Offsets in different SFNT (TTF) structures. See OpenTypeUtilities.cpp
     */
    var SFNT_OFFSET = {
        // sfntHeader:
        NUMTABLES: 4,

        // TableDirectoryEntry
        TABLE_TAG: 0,
        TABLE_OFFSET: 8,
        TABLE_LENGTH: 12,

        // OS2Table
        OS2_WEIGHT: 4,
        OS2_FONT_PANOSE: 32,
        OS2_UNICODE_RANGE: 42,
        OS2_FS_SELECTION: 62,
        OS2_CODEPAGE_RANGE: 78,

        // headTable
        HEAD_CHECKSUM_ADJUSTMENT: 8,

        // nameTable
        NAMETABLE_FORMAT: 0,
        NAMETABLE_COUNT: 2,
        NAMETABLE_STRING_OFFSET: 4,

        // nameRecord
        NAME_PLATFORM_ID: 0,
        NAME_ENCODING_ID: 2,
        NAME_LANGUAGE_ID: 4,
        NAME_NAME_ID: 6,
        NAME_LENGTH: 8,
        NAME_OFFSET: 10
    };

    /**
     * Sizes of structures
     */
    var SIZEOF = {
        SFNT_TABLE_ENTRY: 16,
        SFNT_HEADER: 12,
        SFNT_NAMETABLE: 6,
        SFNT_NAMETABLE_ENTRY: 12,
        EOT_PREFIX: 82
    };

    /**
     * Magic numbers
     */
    var MAGIC = {
        EOT_VERSION: 0x00020001,
        EOT_MAGIC: 0x504c,
        EOT_CHARSET: 1,
        LANGUAGE_ENGLISH: 0x0409
    };

    /**
     * Utility function to convert buffer of utf16be chars to buffer of utf16le
     * chars prefixed with length and suffixed with zero
     */
    function strbuf(str) {
        var b = new ByteBuffer(str.length + 4);

        b.setUint16(0, str.length, true);

        for (var i = 0; i < str.length; i += 2) {
            b.setUint16(i + 2, str.getUint16(i), true);
        }

        b.setUint16(b.length - 2, 0, true);

        return b;
    }

    // Takes TTF font on input and returns ByteBuffer with EOT font
    //
    // Params:
    //
    // - arr(Array|Uint8Array)
    //
    Module.ttf2eot = function (arr) {
        var buf = new ByteBuffer(arr);
        var out = new ByteBuffer(SIZEOF.EOT_PREFIX),
        i, j;

        out.fill(0);
        out.setUint32(EOT_OFFSET.FONT_LENGTH, buf.length, true);
        out.setUint32(EOT_OFFSET.VERSION, MAGIC.EOT_VERSION, true);
        out.setUint8(EOT_OFFSET.CHARSET, MAGIC.EOT_CHARSET);
        out.setUint16(EOT_OFFSET.MAGIC, MAGIC.EOT_MAGIC, true);

        var familyName = [],
        subfamilyName = [],
        fullName = [],
        versionString = [];

        var haveOS2 = false,
        haveName = false,
        haveHead = false;

        var numTables = buf.getUint16(SFNT_OFFSET.NUMTABLES);

        for (i = 0; i < numTables; ++i) {
            var data = new ByteBuffer(buf, SIZEOF.SFNT_HEADER + i * SIZEOF.SFNT_TABLE_ENTRY);
            var tableEntry = {
                tag: data.toString(SFNT_OFFSET.TABLE_TAG, 4),
                offset: data.getUint32(SFNT_OFFSET.TABLE_OFFSET),
                length: data.getUint32(SFNT_OFFSET.TABLE_LENGTH)
            };

            var table = new ByteBuffer(buf, tableEntry.offset, tableEntry.length);

            if (tableEntry.tag === 'OS/2') {
                haveOS2 = true;

                for (j = 0; j < 10; ++j) {
                    out.setUint8(EOT_OFFSET.FONT_PANOSE + j, table.getUint8(SFNT_OFFSET.OS2_FONT_PANOSE + j));
                }

                /*jshint bitwise:false */
                out.setUint8(EOT_OFFSET.ITALIC, table.getUint16(SFNT_OFFSET.OS2_FS_SELECTION) & 0x01);
                out.setUint32(EOT_OFFSET.WEIGHT, table.getUint16(SFNT_OFFSET.OS2_WEIGHT), true);

                for (j = 0; j < 4; ++j) {
                    out.setUint32(EOT_OFFSET.UNICODE_RANGE + j * 4, table.getUint32(SFNT_OFFSET.OS2_UNICODE_RANGE + j * 4), true);
                }

                for (j = 0; j < 2; ++j) {
                    out.setUint32(EOT_OFFSET.CODEPAGE_RANGE + j * 4, table.getUint32(SFNT_OFFSET.OS2_CODEPAGE_RANGE + j * 4), true);
                }

            } else if (tableEntry.tag === 'head') {

                haveHead = true;
                out.setUint32(EOT_OFFSET.CHECKSUM_ADJUSTMENT, table.getUint32(SFNT_OFFSET.HEAD_CHECKSUM_ADJUSTMENT), true);

            } else if (tableEntry.tag === 'name') {

                haveName = true;

                var nameTable = {
                    format: table.getUint16(SFNT_OFFSET.NAMETABLE_FORMAT),
                    count: table.getUint16(SFNT_OFFSET.NAMETABLE_COUNT),
                    stringOffset: table.getUint16(SFNT_OFFSET.NAMETABLE_STRING_OFFSET)
                };

                for (j = 0; j < nameTable.count; ++j) {
                    var nameRecord = new ByteBuffer(table, SIZEOF.SFNT_NAMETABLE + j * SIZEOF.SFNT_NAMETABLE_ENTRY);
                    var name = {
                        platformID: nameRecord.getUint16(SFNT_OFFSET.NAME_PLATFORM_ID),
                        encodingID: nameRecord.getUint16(SFNT_OFFSET.NAME_ENCODING_ID),
                        languageID: nameRecord.getUint16(SFNT_OFFSET.NAME_LANGUAGE_ID),
                        nameID: nameRecord.getUint16(SFNT_OFFSET.NAME_NAME_ID),
                        length: nameRecord.getUint16(SFNT_OFFSET.NAME_LENGTH),
                        offset: nameRecord.getUint16(SFNT_OFFSET.NAME_OFFSET)
                    };

                    if (name.platformID === 3 && name.encodingID === 1 && name.languageID === MAGIC.LANGUAGE_ENGLISH) {
                        var s = strbuf(new ByteBuffer(table, nameTable.stringOffset + name.offset, name.length));

                        switch (name.nameID) {
                            case 1:
                                familyName = s;
                                break;
                            case 2:
                                subfamilyName = s;
                                break;
                            case 4:
                                fullName = s;
                                break;
                            case 5:
                                versionString = s;
                                break;
                        }
                    }
                }
            }
            if (haveOS2 && haveName && haveHead) { break; }
        }

        if (!(haveOS2 && haveName && haveHead)) {
            throw new Error('Required section not found');
        }

        // Calculate final length
        var len =
          out.length +
          familyName.length +
          subfamilyName.length +
          versionString.length +
          fullName.length +
          2 +
          buf.length;

        // Create final buffer with the the same array type as input one.
        var eot = new ByteBuffer(len);

        eot.writeBytes(out.buffer);
        eot.writeBytes(familyName.buffer);
        eot.writeBytes(subfamilyName.buffer);
        eot.writeBytes(versionString.buffer);
        eot.writeBytes(fullName.buffer);
        eot.writeBytes([0, 0]);
        eot.writeBytes(buf.buffer);

        eot.setUint32(EOT_OFFSET.LENGTH, len, true); // Calculate overall length

        return eot;
    }

    return Module;
}());

navigator.sayswho = (function () {
    var ua = navigator.userAgent, tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();
// navigator.sayswho = "Chrome";
// navigator.sayswho = "IE";
