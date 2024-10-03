app.webrequest = {
  "on": {
    "auth": {
      "required": {
        "listener": null,
        "callback": function (callback) {
          app.webrequest.on.auth.required.listener = callback;
        },
        "remove": function () {
          if (firefox.webRequest) {
            firefox.webRequest.onAuthRequired.removeListener(app.webrequest.on.auth.required.listener);
          }
        },
        "add": function () {
          var options = ["asyncBlocking"];
          var filter = {"urls": ["*://*/*"]};
          /*  */
          if (firefox.webRequest) {
            firefox.webRequest.onAuthRequired.removeListener(app.webrequest.on.auth.required.listener);
            firefox.webRequest.onAuthRequired.addListener(app.webrequest.on.auth.required.listener, filter, options);
          }
        }
      }
    }
  }
};
