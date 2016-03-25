/*-----------------------------------
 vdtDict ~ JavaScript implementation
 of a map/dictionary
------------------------------------*/

/**
  vdtDict.js
  JavaScript Dictionary
  --------------------------------------
  directly modifying the 'keys' and 'values' attributes will most likely
  break the functionality of the dictionary. derp.
  @version 1.0.20131025
  @author Wade Harkins (vdtdev@gmail.com)
*/
function Dictionary(){
return {
    "DictId": "vdtDict",
		"mkeys":new Array(),
		"mvalues":new Array(),
    "getCount":function(){
      return (this.mkeys.length);
    },
    "values":function(){
      return (this.mvalues);
    },
    "keys":function(){
      return (this.mkeys);
    },
		/**
		Determine if dictionary contains a key
		@param key Key to check for
		@return True if key is found, otherwise false
		*/
		"hasKey":function(key){
			return (this.mkeys.indexOf(key)>=0);
		},
    "has":function(key){
      return (this.mkeys.indexOf(key)>=0);
    },
		/**
		Add a key-value pair to the dictionary
		@param key Key to add
		@param value Value to add
		@return True if successful, false otherwise
		*/
		"add":function(key,value){
			if(!this.hasKey(key)){
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
		"get":function(key){
			if(this.hasKey(key)){
				return this.mvalues[this.mkeys.indexOf(key)];
			}
			else{
				return null;
			}
		},
    "set":function(key, value){
      if(this.hasKey(key)){
        this.mvalues[this.mkeys.indexOf(key)] = value;
      }
      else{
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
		"remove":function(key){
			if(this.hasKey(key)){
				var t = this.mkeys.indexOf(key);
				var u = this.mvalues[t];
				this.mkeys.splice(t,1);
				this.mvalues.splice(t,1);
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
		"countKeys":function(value){
			if(this.mvalues.indexOf(value)>=0){
				kc=0;
				for(i=0;i<this.mvalues.length;i++){
					kc+=(this.mvalues[i]==value)?1:0;
				}
				return kc;
			}
		return -1;
		}
	}
}
