var config = {};

config.log = false;

config.welcome = {
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.section = {
  set direct (val) {app.storage.write("direct", val)},
  set system (val) {app.storage.write("system", val)},
  set pac_script (val) {app.storage.write("pac_script", val)},
  set auto_detect (val) {app.storage.write("auto_detect", val)},
  set fixed_servers (val) {app.storage.write("fixed_servers", val)},
  get system () {return app.storage.read("system") !== undefined ? app.storage.read("system") : true},
  get direct () {return app.storage.read("direct") !== undefined ? app.storage.read("direct") : false},
  get pac_script () {return app.storage.read("pac_script") !== undefined ? app.storage.read("pac_script") : false},
  get auto_detect () {return app.storage.read("auto_detect") !== undefined ? app.storage.read("auto_detect") : false},
  get fixed_servers () {return app.storage.read("fixed_servers") !== undefined ? app.storage.read("fixed_servers") : false}
};

config.proxy = {
  "check": "https://webbrowsertools.com/ip-address/",
  set mode (val) {app.storage.write("mode", val)},
  set color (val) {app.storage.write("color", val)},
  set rules (val) {app.storage.write("rules", val)},
  set single (val) {app.storage.write("single", val)},
  set scheme (val) {app.storage.write("scheme", val)},
  get rules () {return app.storage.read("rules") || {}},
  get mode () {return app.storage.read("mode") || "system"},
  get scheme () {return app.storage.read("scheme") || "http"},
  get color () {return app.storage.read("color") || "rgb(110, 179, 19)"},
  get single () {return app.storage.read("single") !== undefined ? app.storage.read("single") : false},
  "object": {
    set new (val) {app.storage.write("proxy-object-new", val)},
    set old (val) {app.storage.write("proxy-object-old", val)},
    get new () {return app.storage.read("proxy-object-new") || {}},
    get old () {return app.storage.read("proxy-object-old") || {}}
  },
  "authentication": {
    set active (val) {app.storage.write("auth-active", val)},
    set username (val) {app.storage.write("auth-username", val)},
    set password (val) {app.storage.write("auth-password", val)},
    get username () {return app.storage.read("auth-username") || ''},
    get password () {return app.storage.read("auth-password") || ''},
    get active () {return app.storage.read("auth-active") !== undefined ? app.storage.read("auth-active") : false}
  },
  "settings": {
    "bypass": {
      set list (val) {app.storage.write("bypass-list", val)},
      set active (val) {app.storage.write("bypass-active", val)},
      get list () {return app.storage.read("bypass-list") || null},
      get active () {return app.storage.read("bypass-active") !== undefined ? app.storage.read("bypass-active") : false}
    },
    "pac": {
      set url (val) {app.storage.write("pac-url", val)},
      set type (val) {app.storage.write("pac-type", val)},
      get url () {return app.storage.read("pac-url") || ''},
      get type () {return app.storage.read("pac-type") || "file://"}
    }
  }
};
