if (/Firefox/.test(navigator.userAgent)) {
  firefox.proxy = {"callbacks": [], "errors": [], "settings": {}};
  firefox.proxy.onProxyError = {"addListener": e => firefox.proxy.errors.push(e)};
  firefox.proxy.settings.onChange = {"addListener": e => firefox.proxy.callbacks.push(e)};
  /*  */
  firefox.proxy.convert = {
    "to": ({value}) => {
      const mode = value.mode;
      const scheme = value.rules ? (value.rules.proxyForHttp || value.rules.proxyForHttps || value.rules.proxyForFtp || value.rules.singleProxy)["scheme"] : null;
      const settings = {
        "proxyType": {
          "direct": "none",
          "system": "system",
          "fixed_servers": "manual",
          "pac_script": "autoConfig",
          "auto_detect": "autoDetect"
        }[mode],
        "autoLogin": value.noPrompt,
        "proxyDNS": value.remoteDNS,
        "autoConfigUrl": mode === "pac_script" ? value.pacScript.url : '',
        "socksVersion": mode === "fixed_servers" && scheme === "socks5" ? 5 : 4,
        "passthrough": mode === "fixed_servers" && value.rules.bypassList && value.rules.bypassList.length ? value.rules.bypassList.join(", ") : ''
      };
      /*  */
      if (mode === "fixed_servers") {
        const rules = value.rules;
        const url = ({"host": h, "port": p, "scheme": s}) => {
          return h && p ? (s === "https" ? "https://" : '') + (h.trim().replace(/.*:\/\//, '') + ':' + p) : '';
        };
        /*  */
        if (scheme.startsWith("socks")) {
          settings.http = settings.ssl = settings.ftp = '';
          settings.socks = url(rules.proxyForHttp || rules.singleProxy);
        } else {
          var dummy = {"host": '', "port": '', "scheme": ''};
          settings.ftp = url(rules.proxyForFtp || rules.singleProxy || dummy);
          settings.http = url(rules.proxyForHttp || rules.singleProxy || dummy);
          settings.ssl = url(rules.proxyForHttps || rules.singleProxy || dummy);
        }
      }
      /*  */
      return {"value": settings};
    },
    "from": ({value}) => {
      const config = {"value": {"remoteDNS": value.proxyDNS, "noPrompt": value.autoLogin}};
      config.value.mode = {
        "none": "direct",
        "system": "system",
        "manual": "fixed_servers",
        "autoConfig": "pac_script",
        "autoDetect": "auto_detect"
      }[value.proxyType];
      /*  */
      if (value.proxyType === "autoConfig" || value.proxyType === "manual") config.value.rules = {};
      /*  */
      if (value.proxyType === "autoConfig") config.value.pacScript = {"url": value.autoConfigUrl};
      else if (value.proxyType === "manual") {
        config.value.rules.bypassList = value.passthrough ? value.passthrough.split(", ") : [];
        const type = url => {
          if (value.socks) return "socks" + value.socksVersion;
          else return url.startsWith("https://") ? "https" : "http";
        };
        /*  */
        const parse = url => {
          const scheme = type(url);
          const [host, port] = url.split("://")[0].split(':');
          return {scheme, host, "port": Number(port)};
        };
        /*  */
        config.value.rules.proxyForFtp = parse(value.ftp || value.socks);
        config.value.rules.proxyForHttp = parse(value.http || value.socks);
        config.value.rules.proxyForHttps = parse(value.ssl || value.socks);
      }
      /*  */
      return config;
    }
  };
  /*  */
  firefox.proxy.settings.get = (prop, callback) => browser.proxy.settings.get({}).then(e => callback(firefox.proxy.convert.from(e)));
  /*  */
  firefox.proxy.settings.set = async(config, callback = function () {}) => {
    const settings = firefox.proxy.convert.to(config);
    await browser.proxy.settings.clear({});
    browser.proxy.settings.set(settings, () => {
      const lastError = firefox.runtime.lastError;
      if (firefox.runtime.lastError) firefox.proxy.errors.forEach(c => c(lastError));
    });
    /*  */
    callback();
  };
}
