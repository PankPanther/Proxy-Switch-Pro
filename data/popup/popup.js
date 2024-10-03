var background = (function () {
  var tmp = {};
  firefox.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path == "background-to-popup") {
          if (request.method === id) tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data) {firefox.runtime.sendMessage({"path": "popup-to-background", "method": id, "data": data})}
  }
})();

var config = {
  "color": {
    "direct": "rgb(241, 101, 79)",
    "system": "rgb(110, 179, 19)",
    "pac_script": "rgb(30, 157, 206)",
    "auto_detect": "rgb(206, 153, 33)",
    "fixed_servers": "rgb(175, 68, 230)"
  },
  "unique": {
    "array": function (arr) {
      var hash = {}, result = [];
      for (var i = 0, l = arr.length; i < l; ++i) {
        if (!hash.hasOwnProperty(arr[i])) {
          hash[arr[i]] = true;
          result.push(arr[i]);
        }
      }
      /*  */
      return result;
    }
  },
  "load": function () {
    var check = document.getElementById("check");
    var reload = document.getElementById("reload");
    var refresh = document.getElementById("refresh");
    var support = document.getElementById("support");
    var donation = document.getElementById("donation");
    /*  */
    var input = [...document.querySelectorAll("input")];
    var select = [...document.querySelectorAll("select")];
    var summary = [...document.querySelectorAll("summary")];
    var textarea = [...document.querySelectorAll("textarea")];
    /*  */
    check.addEventListener("click", function () {background.send("check")});
    reload.addEventListener("click", function () {background.send("reload")});
    refresh.addEventListener("click", function () {document.location.reload()});
    support.addEventListener("click", function () {background.send("support")});
    donation.addEventListener("click", function () {background.send("donation")});
    /*  */
    for (var i = 0; i < input.length; i++) input[i].addEventListener("change", config.proxy.engine.update);
    for (var i = 0; i < select.length; i++) select[i].addEventListener("change", config.proxy.engine.update);
    for (var i = 0; i < textarea.length; i++) textarea[i].addEventListener("change", config.proxy.engine.update);
    for (var i = 0; i < summary.length; i++) {
      summary[i].addEventListener("click", function (e) {
        var target = e.target.closest("details");
        background.send("section", {
          "open": !target.open,
          "section": target.getAttribute("section")
        });
      });
    }
    /*  */
    config.handle.footer();
    background.send("load");
    window.removeEventListener("load", config.load, false);
  },
  "handle": {
    "footer": function () {
      var footer = document.querySelector(".footer");
      /*  */
      var direct = footer.querySelector(".direct");
      var system = footer.querySelector(".system");
      var pac_script = footer.querySelector(".pac_script");
      var auto_detect = footer.querySelector(".auto_detect");
      var fixed_servers = footer.querySelector(".fixed_servers");
      /*  */
      direct.addEventListener("click", function () {
        document.querySelector("summary[class*='direct']").click();
      });
      auto_detect.addEventListener("click", function () {
        document.querySelector("summary[class*='auto_detect']").click();
      });
      /*  */
      system.addEventListener("click", function () {
        document.querySelector("summary[class*='system']").click();
      });
      /*  */
      pac_script.addEventListener("click", function () {
        document.querySelector("summary[class*='pac_script']").click();
      });
      /*  */
      fixed_servers.addEventListener("click", function () {
        document.querySelector("summary[class*='fixed_servers']").click();
      });
    }
  },
  "interface": {
    "load": function () {
      var title = [...document.querySelectorAll(".title")];
      var summary = [...document.querySelectorAll("summary")];
      var details = [...document.querySelectorAll("details")];
      /*  */
      document.getElementById("single").checked = config.proxy.object.single;
      document.getElementById("pac-url").value = config.proxy.object.settings.pac.url;
      document.getElementById("auth").checked = config.proxy.object.authentication.active;
      document.getElementById("username").value = config.proxy.object.authentication.username;
      document.getElementById("password").value = config.proxy.object.authentication.password;
      document.getElementById("bypass-active").checked = config.proxy.object.settings.bypass.active;
      document.querySelector("input[name=mode][value=" + config.proxy.object.mode + "]").checked = true;
      document.querySelector("input[name=scheme][value=" + config.proxy.object.scheme + "]").checked = true;
      document.getElementById("ftp-port").value = config.proxy.object.rules["proxyForFtp"] ? config.proxy.object.rules["proxyForFtp"].port : '';
      document.getElementById("ftp-host").value = config.proxy.object.rules["proxyForFtp"] ? config.proxy.object.rules["proxyForFtp"].host : '';
      document.getElementById("https-port").value = config.proxy.object.rules["proxyForHttps"] ? config.proxy.object.rules["proxyForHttps"].port : '';
      document.getElementById("https-host").value = config.proxy.object.rules["proxyForHttps"] ? config.proxy.object.rules["proxyForHttps"].host : '';
      document.getElementById("bypass-list").value = config.proxy.object.settings.bypass.list ? config.proxy.object.settings.bypass.list.join(',') : '';
      document.getElementById("fallback-host").value = config.proxy.object.rules["fallbackProxy"] ? config.proxy.object.rules["fallbackProxy"].host : '';
      document.getElementById("fallback-port").value = config.proxy.object.rules["fallbackProxy"] ? config.proxy.object.rules["fallbackProxy"].port : '';
      /*  */
      var a = config.proxy.object.rules["proxyForHttp"] ? config.proxy.object.rules["proxyForHttp"].port : (config.proxy.object.rules["singleProxy"] ? config.proxy.object.rules["singleProxy"].port : '');
      var b = config.proxy.object.rules["proxyForHttp"] ? config.proxy.object.rules["proxyForHttp"].host : (config.proxy.object.rules["singleProxy"] ? config.proxy.object.rules["singleProxy"].host : '');
      document.getElementById("http-port").value = a;
      document.getElementById("http-host").value = b;
      /*  */ 
      for (var name in config.proxy.object.section) {
        var target = document.querySelector("details[section='" + name + "']");
        if (target) {
          target.open = config.proxy.object.section[name];
        }
      }
      /*  */
      for (var i = 0; i < title.length; i++) {
        var flag = title[i].querySelector("input").checked;
        /*  */
        summary[i].style.color = flag ? "#ecc6c6" : "#555";
        summary[i].style.backgroundColor = flag ? config.proxy.object.color : "transparent";
        flag ? title[i].setAttribute("selected", '') : title[i].removeAttribute("selected");
        flag ? details[i].setAttribute("selected", '') : details[i].removeAttribute("selected");
      }
      /*  */
      config.proxy.engine.start();
    }
  },
  "proxy": {
    "object": {},
    "engine": {
      "start": function () {
        var tmp = {
          "scope": "regular", 
          "value": {
            "mode": config.proxy.object.mode
          }
        };
        /*  */
        if (config.proxy.object.mode === "direct") background.send("proxy.set", tmp);
        if (config.proxy.object.mode === "system") background.send("proxy.set", tmp);
        if (config.proxy.object.mode === "auto_detect") background.send("proxy.set", tmp);
        if (config.proxy.object.mode === "pac_script") {
          if (config.proxy.object.settings.pac.url) {
            tmp.value["pacScript"] = {
              "mandatory": false, 
              "url": config.proxy.object.settings.pac.url
            };
            /*  */
            background.send("proxy.set", tmp);
          } else {
            background.send("error");
          }
        }
        /*  */
        if (config.proxy.object.mode === "fixed_servers") {
          var a = "singleProxy" in config.proxy.object.rules;
          var b = "proxyForFtp" in config.proxy.object.rules;
          var c = "proxyForHttp" in config.proxy.object.rules;
          var d = "proxyForHttps" in config.proxy.object.rules;
          var e = "fallbackProxy" in config.proxy.object.rules;
          if (a || b || c || d || e) {
            tmp.value["rules"] = config.proxy.object.rules;
            background.send("proxy.set", tmp);
          } else {
            background.send("error");
          }
        }
      },
      "update": function (e) {
        var title = [...document.querySelectorAll(".title")];
        var details = [...document.querySelectorAll("details")];
        var summary = [...document.querySelectorAll("summary")];
        /*  */
        var auth = document.getElementById("auth").checked;
        var pacurl = document.getElementById("pac-url").value;
        var single = document.getElementById("single").checked;
        var ftpport = document.getElementById("ftp-port").value;
        var ftphost = document.getElementById("ftp-host").value;
        var password = document.getElementById("password").value;
        var username = document.getElementById("username").value;
        var httpport = document.getElementById("http-port").value;
        var httphost = document.getElementById("http-host").value;
        var httpsport = document.getElementById("https-port").value;
        var httpshost = document.getElementById("https-host").value;
        var bypasslist = document.getElementById("bypass-list").value;
        var fallbackport = document.getElementById("fallback-port").value;
        var fallbackhost = document.getElementById("fallback-host").value;
        var bypassactive = document.getElementById("bypass-active").checked;
        var mode = document.querySelector("input[name=mode]:checked").value;
        var scheme = document.querySelector("input[name=scheme]:checked").value;
        /*  */
        var proxy_for_ftp = (ftpport && ftphost) ? {"proxyForFtp": {"port": parseInt(ftpport), "host": ftphost, "scheme": scheme}} : null;
        var proxy_for_http = (httpport && httphost) ? {"proxyForHttp": {"port": parseInt(httpport), "host": httphost, "scheme": scheme}} : null;
        var proxy_for_https = (httpsport && httpshost) ? {"proxyForHttps": {"port": parseInt(httpsport), "host": httpshost, "scheme": scheme}} : null;
        var single_proxy = (single && httpport && httphost) ? {"singleProxy": {"port": parseInt(httpport), "host": httphost, "scheme": scheme}} : null;
        var fallback_proxy = (fallbackport && fallbackhost) ? {"fallbackProxy": {"port": parseInt(fallbackport), "host": fallbackhost, "scheme": scheme}} : null;
        /*  */
        config.proxy.object.settings.bypass.active = bypassactive;
        config.proxy.object.settings.bypass.list = config.unique.array(bypasslist ? bypasslist.split(',') : []);
        /*  */
        config.proxy.object.mode = mode;
        config.proxy.object.single = single;
        config.proxy.object.scheme = scheme;
        config.proxy.object.settings.pac.url = pacurl;
        config.proxy.object.authentication.active = auth;
        config.proxy.object.authentication.username = username;
        config.proxy.object.authentication.password = password;
        config.proxy.object.color = config.color[config.proxy.object.mode];
        /*  */
        var c = (config.proxy.object.settings.bypass.active && config.proxy.object.settings.bypass.list.length) ? {"bypassList": config.proxy.object.settings.bypass.list} : null;
        var a = Object.assign({}, single_proxy, c);
        var b = Object.assign({}, proxy_for_http, proxy_for_https, proxy_for_ftp, fallback_proxy, c);
        config.proxy.object.rules = single_proxy ? a : b;
        /*  */
        for (var i = 0; i < title.length; i++) {
          var flag = title[i].querySelector("input").checked;
          /*  */
          summary[i].style.color = flag ? "##ecc6c6" : "#555";
          summary[i].style.backgroundColor = flag ? config.proxy.object.color : "transparent";
          flag ? title[i].setAttribute("selected", '') : title[i].removeAttribute("selected");
          flag ? details[i].setAttribute("selected", '') : details[i].removeAttribute("selected");
        }
        /*  */
        if (e.target.id === "auth") {
          firefox.permissions.request({
            "origins": ["*://*/*"],
            "permissions": ["webRequest", "webRequestBlocking"]
          }, function (granted) {
            var flag = granted && e.target.checked;
            background.send("webrequest", flag ? "add" : "remove");
          });
        }
        /*  */
        background.send("proxy.save", config.proxy.object);
        config.proxy.engine.start();
      }
    }
  }
};

background.receive("storage", function (e) {
  config.proxy.object = e;
  config.interface.load();
});

background.receive("fallback", function (e) {
  window.setTimeout(function () {
    document.getElementById("system").click();
  }, 1000);
});

window.addEventListener("load", config.load, false);
