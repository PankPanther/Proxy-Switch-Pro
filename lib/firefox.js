var app = {};

app.shortname = function () {
  return firefox.runtime.getManifest().short_name;
};

app.popup = {
  "message": {},
  "receive": function (id, callback) {
    app.popup.message[id] = callback;
  },
  "send": function (id, data) {
    firefox.runtime.sendMessage({
      "data": data,
      "method": id,
      "path": "background-to-popup"
    });
  }
};

app.button = {
  "icon": function (path, callback) {
    if (path && typeof path === "object") {
      firefox.browserAction.setIcon({"path": path}, function (e) {
        if (callback) callback(e);
      });
    } else {
      firefox.browserAction.setIcon({
        "path": {
          "16": "../data/icons/" + (path ? path + '/' : '') + "16.png",
          "32": "../data/icons/" + (path ? path + '/' : '') + "32.png",
          "48": "../data/icons/" + (path ? path + '/' : '') + "48.png",
          "64": "../data/icons/" + (path ? path + '/' : '') + "64.png"
        }
      }, function (e) {
        if (callback) callback(e);
      }); 
    }
  }
};

app.proxy = {
  "query": {
    "all": function (callback) {
      if (firefox.proxy) {
        firefox.proxy.settings.get({}, function (e) {
          if (callback) callback(e);
        });
      }
    }
  },
  "apply": function (e, callback) {
    if (firefox.proxy) {
      firefox.proxy.settings.set({
        "value": e.value, 
        "scope": e.scope
      }, function (e) {
        if (callback) callback(e);
      });
    }
  }
};

app.permissions = {
  "check": function (options, callback) {
    if (firefox.permissions) {
      firefox.permissions.contains(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
  "remove": function (options, callback) {
    if (firefox.permissions) {
      firefox.permissions.remove(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
  "add": function (options, callback) {
    if (firefox.permissions) {
      firefox.permissions.request(options, function (e) {
        if (callback) callback(e);
      });
    }
  }
};

app.notifications = {
  "id": app.shortname() + "-notifications-id",
  "on": {
    "clicked": function (callback) {
      if (firefox.notifications) {
        firefox.notifications.onClicked.addListener(function (e) {
          app.storage.load(function () {
            callback(e);
          });
        });
      }
    }
  },
  "create": function (e, callback) {
    if (firefox.notifications) {
      firefox.notifications.create(app.notifications.id, {
        "message": e.message,
        "type": e.type ? e.type : "basic",
        "title": e.title ? e.title : "Notifications",
        "iconUrl": e.iconUrl ? firefox.runtime.getURL(e.iconUrl) : firefox.runtime.getURL("/data/icons/64.png")
      }, function (e) {
        if (callback) callback(e);
      });
    }
  }
};

app.on = {
  "management": function (callback) {
    firefox.management.getSelf(callback);
  },
  "uninstalled": function (url) {
    firefox.runtime.setUninstallURL(url, function () {});
  },
  "installed": function (callback) {
    firefox.runtime.onInstalled.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "startup": function (callback) {
    firefox.runtime.onStartup.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "message": function (callback) {
    firefox.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      app.storage.load(function () {
        callback(request, sender, sendResponse);
      });
      /*  */
      return true;
    });
  },
  "state": function (callback) {
    if (firefox.idle) {
      firefox.idle.onStateChanged.addListener(function (e) {
        app.storage.load(function () {
          callback(e);
        });
      });
    }
  }
};

app.storage = (function () {
  firefox.storage.onChanged.addListener(function () {
    firefox.storage.local.get(null, function (e) {
      app.storage.local = e;
      if (app.storage.callback) {
        if (typeof app.storage.callback === "function") {
          app.storage.callback(true);
        }
      }
    });
  });
  /*  */
  return {
    "local": {},
    "callback": null,
    "read": function (id) {
      return app.storage.local[id];
    },
    "on": {
      "changed": function (callback) {
        if (callback) {
          app.storage.callback = callback;
        }
      }
    },
    "write": function (id, data, callback) {
      var tmp = {};
      tmp[id] = data;
      app.storage.local[id] = data;
      firefox.storage.local.set(tmp, function (e) {
        if (callback) callback(e);
      });
    },
    "load": function (callback) {
      var keys = Object.keys(app.storage.local);
      if (keys && keys.length) {
        if (callback) callback("cache");
      } else {
        firefox.storage.local.get(null, function (e) {
          app.storage.local = e;
          if (callback) callback("disk");
        });
      }
    }
  }
})();

app.tab = {
  "options": function () {
    firefox.runtime.openOptionsPage();
  },
  "get": function (tabId, callback) {
    firefox.tabs.get(tabId, function (e) {
      if (callback) callback(e);
    });
  },
  "remove": function (tabId, callback) {
    firefox.tabs.remove(tabId, function (e) {
      if (callback) callback(e);
    });
  },
  "update": function (tabId, options, callback) {
    firefox.tabs.update(tabId, options, function (e) {
      if (callback) callback(e);
    });
  },
  "reload": function (tab, bypassCache) {
    firefox.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
      if (tabs && tabs.length) {
        firefox.tabs.reload(tab ? tab.id : tabs[0].id, {
          "bypassCache": bypassCache !== undefined ? bypassCache : false
        }, function () {});
      }
    });
  },
  "restore": function (id, callback) {
    if (firefox.sessions) {
      firefox.sessions.restore(id, function (session) {
        if (session) {
          if (callback) {
            callback(session);
          }
        }
      });
    }
  },
  "open": function (url, index, active, callback) {
    var properties = {
      "url": url, 
      "active": active !== undefined ? active : true
    };
    /*  */
    if (index !== undefined) {
      if (typeof index === "number") {
        properties.index = index + 1;
      }
    }
    /*  */
    firefox.tabs.create(properties, function (tab) {
      if (callback) callback(tab);
    }); 
  },
  "query": {
    "all": function (callback) {
      firefox.tabs.query({}, function (tabs) {
        if (tabs && tabs.length) {
          callback(tabs);
        }
      });
    },
    "index": function (callback) {
      firefox.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        if (tabs && tabs.length) {
          callback(tabs[0].index);
        } else callback(undefined);
      });
    },
    "active": function (callback) {
      firefox.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        if (tabs && tabs.length) {
          app.tab.check.url(tabs[0], function (tab) {
            callback(tab);
          });
        }
      });
    },
    "closed": function (callback) {
      if (firefox.sessions) {
        firefox.sessions.getRecentlyClosed(function (sessions) {
          if (sessions && sessions.length) {
            callback(sessions);
          }
        });
      }
    }
  },
  "on": {
    "removed": function (callback) {
      firefox.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        app.storage.load(function () {
          callback(tabId);
        }); 
      });
    },
    "activated": function (callback) {
      firefox.tabs.onActivated.addListener(function (activeInfo) {
        app.storage.load(function () {
          firefox.tabs.get(activeInfo.tabId, function (tab) {
            callback(tab);
          });
        });
      });
    },
    "updated": function (callback) {
      firefox.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        app.storage.load(function () {
          if (tab.status === "complete") {
            callback(tab);
          }
        });
      });
    }
  },
  "check": {
    "url": function (tab, callback) {
      if (tab.url) callback(tab);
      else {
        firefox.tabs.executeScript(tab.id, {
          "runAt": "document_start",
          "code": "document.location.href"
        }, function (result) {
          var error = firefox.runtime.lastError;
          if (result && result.length) {
            tab.url = result[0];
          }
          /*  */
          callback(tab);
        });
      }
    }
  }
};