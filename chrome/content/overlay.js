var ffbb_loadTimer = {
	QueryInterface: function (ID) {
		if (ID.equals(Components.interfaces.nsIWebProgressListener) ||
        aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
        aIID.equals(Components.interfaces.nsISupports)) {
			return this;
		} else {
			throw Components.results.NS_NOINTERFACE;
		}
	},
	
	onStateChange: function (webProgress, request, flag, status) {
		var pattern = undefined;
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getBranch("firefoxblackbox.");
		
		if (this.prefs.prefHasUserValue('urlPattern')) {
			pattern = this.prefs.getCharPref('urlPattern');
		} else {
			pattern = '.*ycombinator\.com.*';
		}
		
  		if (request.name.search('/' + pattern + '/') > -1) {
			if (flag == 983041) {
			    if (firefoxblackbox.times == undefined) {
			    	firefoxblackbox.times = {url: request.name, start: new Date().getTime()};
			    }
			} else if (flag == 786448) {
			    if (firefoxblackbox.times != undefined) {
			    	firefoxblackbox.times['finish'] = new Date().getTime();
			    	firefoxblackbox.pushLoadTime();
			    	firefoxblackbox.times = undefined;
			    } else {
			    	firefoxblackbox.log('error, no matching start request');
			    }
			}
		}
	},
	
	// stubs
	onLocationChange:function(a,b,c){},
  	onProgressChange:function(a,b,c,d,e,f){},
  	onStatusChange:function(a,b,c,d){},
  	onSecurityChange:function(a,b,c){}
}

var firefoxblackbox = {
  times: undefined,

  onLoad: function() {
    // initialization code
    this.diskCache = "browser.cache.disk.enable";
    this.memCache = "browser.cache.memory.enable";
    this.initialized = true;
    this.strings = document.getElementById("firefoxblackbox-strings");
    this.diskCacheSet = firefoxblackbox.getPref(this.diskCache);
    this.memCacheSet = firefoxblackbox.getPref(this.memCache);
    firefoxblackbox.setPref(this.diskCache, false); // disable the browser cache
    firefoxblackbox.setPref(this.memCache, false);
    gBrowser.addProgressListener(ffbb_loadTimer, Components.interfaces.nsIWebProgress.NOTIFY_STATE_ALL);
  },
  
  unLoad: function() {
  	firefoxblackbox.setPref("browser.cache.disk.enable", this.diskCacheSet); // set cache options back
    firefoxblackbox.setPref("browser.cache.memory.enable", this.memCacheSet);
  	gBrowser.removeProgressListener(ffbb_loadTimer);
  },

  getPref: function(key) {
  	pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
  	return pref.getBoolPref(key);
  },
  
  pushLoadTime: function() {
  	var xhr = new XMLHttpRequest();
  	xhr.open('GET', 'http://localhost:81/api.php?data=' + JSON.stringify({url: firefoxblackbox.times.url, load: firefoxblackbox.times.finish - firefoxblackbox.times.start}), true);
  	
  	xhr.onreadystatechange = function (event) {
  		if (xhr.readyState == 4) {
  			if (xhr.status == 200) {
  				firefoxblackbox.log('load time pushed');
  			}
  		}
  	};
  	xhr.send(null);
  },

  setPref: function(key, value) {
  	pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
  	pref.setBoolPref(key, value);
  },
  
  log: function(msg) {
  	var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  	consoleService.logStringMessage("firefoxblackbox: " + msg);
  }
};

window.addEventListener("load", firefoxblackbox.onLoad, false);
window.addEventListener("unload", firefoxblackbox.unLoad, false)