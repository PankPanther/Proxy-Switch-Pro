var core = {
  "state": function () {
    core.load();
  },
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    app.proxy.query.all(function (e) {
      var scope = "regular";
      var value = e.value || {};
      /*  */
      app.permissions.check({
        "origins": ["*://*/*"],
        "permissions": ["webRequest", "webRequestBlocking"]
      }, function (e) {
        app.webrequest.on.auth.required[e ? "add" : "remove"]();
      });
      /*  */
      config.proxy.object.new = {"scope": scope, "value": value};
      var a = JSON.stringify(config.proxy.object.new);
      var b = JSON.stringify(config.proxy.object.old);
      if (a === b) {
        app.proxy.apply(config.proxy.object.new, core.desktop.notifications);
      }
    });
  },
  "desktop": {
    "notifications": function () {
      var a = config.proxy.object.new;
      if (a) {
        if (a.value) {
          if (a.value.mode) {
            var message = "Proxy Mode :: " + a.value.mode.replace('_', ' ').toUpperCase();
            if (a.value.mode) {
              app.notifications.create({
                "message": message,
                "title": "Proxy Switcher",
                "iconUrl": "/data/icons/" + a.value.mode + "/64.png"
              });
            } else {
              app.notifications.create({
                "message": message,
                "title": "Proxy Switcher"
              });
            }
            /*  */
            app.button.icon(a.value.mode);
          }
        }
      }
    }
  }
};

app.popup.receive("webrequest", function (e) {
  app.webrequest.on.auth.required[e]();
  app.permissions[e]({
    "origins": ["*://*/*"],
    "permissions": ["webRequest", "webRequestBlocking"]
  });
});

app.popup.receive("error", function (e) {
  app.popup.send("fallback");
  app.notifications.create({
    "title": "Proxy Switcher",
    "message": "Error! Cannot set proxy. \nPlease fill all the required fields and try again."
  });
});

app.popup.receive("proxy.set", function (e) {
  config.proxy.object.new = e;
  var a = JSON.stringify(config.proxy.object.new);
  var b = JSON.stringify(config.proxy.object.old);
  if (a !== b) {
    if (config.log) console.error(config.proxy.object.new);
    app.proxy.apply(config.proxy.object.new, core.desktop.notifications);
    config.proxy.object.old = config.proxy.object.new;
  }
});

app.popup.receive("proxy.save", function (e) {
  config.proxy.mode = e.mode;
  config.proxy.color = e.color;
  config.proxy.rules = e.rules;
  config.proxy.single = e.single;
  config.proxy.scheme = e.scheme;
  config.proxy.settings.pac.url = e.settings.pac.url;
  config.proxy.settings.pac.type = e.settings.pac.type;
  config.proxy.settings.bypass.list = e.settings.bypass.list;
  config.proxy.authentication.active = e.authentication.active;
  config.proxy.settings.bypass.active = e.settings.bypass.active;
  config.proxy.authentication.username = e.authentication.username;
  config.proxy.authentication.password = e.authentication.password;
});

app.webrequest.on.auth.required.callback(function (info) {
  if (config.proxy.authentication.active) {
    if (info.isProxy) {
      var username = config.proxy.authentication.username;
      var password = config.proxy.authentication.password;
      /*  */
      if (username && password) {
        app.notifications.create({
          "title": "Proxy Switcher",
          "message": "Set Proxy Authentication :: \n" + info.url
        });
        /*  */
        return {
          "authCredentials": {
            "username": username,
            "password": password
          }
        };
      }
    }
  }
});

app.popup.receive("load", function () {
  app.popup.send("storage", {
    "mode": config.proxy.mode,
    "rules": config.proxy.rules,
    "color": config.proxy.color,
    "single": config.proxy.single,
    "scheme": config.proxy.scheme,
    "authentication": {
      "active": config.proxy.authentication.active,
      "username": config.proxy.authentication.username,
      "password": config.proxy.authentication.password
    },
    "section": {
      "direct": config.section.direct,
      "system": config.section.system,
      "pac_script": config.section.pac_script,
      "auto_detect": config.section.auto_detect,
      "fixed_servers": config.section.fixed_servers
    },
    "settings": {
      "bypass": {
        "list": config.proxy.settings.bypass.list,
        "active": config.proxy.settings.bypass.active
      },
      "pac": {
        "url": config.proxy.settings.pac.url,
        "type": config.proxy.settings.pac.type
      }
    }
  });
});

app.popup.receive("reload", app.tab.reload);
app.popup.receive("support", function () {app.tab.open(app.homepage())});
app.popup.receive("check", function () {app.tab.open(config.proxy.check)});
app.popup.receive("section", function (e) {config.section[e.section] = e.open});
app.popup.receive("donation", function () {app.tab.open(app.homepage() + "?reason=support")});

app.on.state(core.state);
app.on.startup(core.start);
app.on.installed(core.install);