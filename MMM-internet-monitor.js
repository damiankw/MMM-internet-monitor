/* global JustGage Module Log $ */
/**
 * Created by debayan on 7/24/16.
 */

Module.register("MMM-internet-monitor", {

  defaults: {
    serverId: "",
    type: "",
    updateInterval: 60 * 1000 * 30,
    verbose: false,
    displayStrength: true,
    displaySpeed: true,
    strengthIconSize: 80,
    maxUploadGaugeScale: 100,
    maxDownloadGaugeScale: 100
  },
  payload: [],

  downloadBarState: "not_started",
  updating: false,

  start () {
    Log.log("MMM-Internet-monitor module started!");
    this.sendSocketNotification("Start", this.config);
  },

  getScripts () {
    return [
      this.file("node_modules/justgage/raphael.min.js"),
      this.file("node_modules/justgage/dist/justgage.min.js"),
      this.file("node_modules/jquery/dist/jquery.min.js")
    ];
  },

  getStyles () {
    return ["MMM-internet-monitor.css"];
  },

  notificationReceived (notification, payload, sender) {
    // Module is ready. Start the initial check
    if (notification === "MODULE_DOM_CREATED") {
      this.sendSocketNotification("Check", this.config);
    }
    Log.debug(`notificationReceived - payload: ${payload}`);
    Log.debug(`notificationReceived - sender: ${sender}`);
  },

  socketNotificationReceived (notification, payload) {
    if (notification === "downloadSpeedProgress") {
      if (this.config.displaySpeed) {
        if (this.downloadBarState === "not_started") {
          this.downloadBarState = "started";
        }
        Log.log("updating DOWNLOAD");
        this.download.refresh(payload, this.config.maxDownloadGaugeScale);
      }
    }
    if (notification === "uploadSpeedProgress") {
      if (this.config.displaySpeed) {
        Log.log("updating UPLOAD");
        this.upload.refresh(payload, this.config.maxUploadGaugeScale);
      }
    }
    let container;
    if (notification === "data") {
      if (!this.updating) {
        container = document.createElement("div");
        container.style = "text-align: left; display: inline-block; font-size: 8pt; width: 100%;";
        container.id = "internetVerbose";
        $(container).appendTo("#internetData");
      }

      if (this.config.verbose) {
        $("#internetVerbose").html(`
          <table width="100%" cellpadding="3">
            <tr>
              <td>Jitter:</td>
              <td>${payload.ping.jitter}ms</td>
              <td>Latency:</td>
              <td>${payload.ping.latency}ms</td>
            </tr>
            <tr>
              <td>Internal IP:</td>
              <td>${payload.interface.internalIp}</td>
              <td>External IP:</td>
              <td>${payload.interface.externalIp}</td>
            </tr>
            <tr>
              <td>Adapter:</td>
              <td>${payload.interface.name}</td>
              <td>ISP:</td>
              <td>${payload.isp}</td>
            </tr>
            <tr>
              <td>Server:</td>
              <td>${payload.server.name}</td>
              <td>Location:</td>
              <td>${payload.server.location} (${payload.server.country})</td>
            </tr>
          </table>
        `);
      }

    }

    if (notification === "ping") {
      // Log.log("ping [" + payload + "]");
      // if (this.downloadBarState == "not_started") {
      // 	this.updateDom();
      // }

      if (this.config.displayStrength) {
        if (Object.hasOwn(this.config, "wifiSymbol")) {
          if (payload < 70) {
            $(container).append("<div class=\"wifi-symbol-4\" > <div class=\"wifi-circle first\"></div> <div class=\"wifi-circle second\"></div> <div class=\"wifi-circle third\"></div> <div class=\"wifi-circle fourth\"></div> </div>");
          } else if (payload >= 70 && payload < 100) {
            $(container).append("<div class=\"wifi-symbol-2\" > <div class=\"wifi-circle first\"></div> <div class=\"wifi-circle second\"></div> <div class=\"wifi-circle third\"></div> <div class=\"wifi-circle fourth\"></div> </div>");
          } else if (payload >= 100 && payload < 150) {
            $(container).append("<div class=\"wifi-symbol-3\" > <div class=\"wifi-circle first\"></div> <div class=\"wifi-circle second\"></div> <div class=\"wifi-circle third\"></div> <div class=\"wifi-circle fourth\"></div> </div>");
          } else if (payload >= 150) {
            $(container).append("<div class=\"wifi-symbol-1\" > <div class=\"wifi-circle first\"></div> <div class=\"wifi-circle second\"></div> <div class=\"wifi-circle third\"></div> <div class=\"wifi-circle fourth\"></div> </div>");
          }

          $(".wifi-symbol-1 .wifi-circle").css({
            "border-color": this.config.wifiSymbol.fullColor,
            "font-size": this.config.wifiSymbol.size / 7,
            "margin-top": 0 - this.config.wifiSymbol.size - this.config.wifiSymbol.size * 0.25,
            "margin-left": 0.5 * (150 - this.config.wifiSymbol.size)
          });
          $(".wifi-symbol-1 [foo], .wifi-symbol-1").css({
            width: this.config.wifiSymbol.size,
            height: this.config.wifiSymbol.size
          });

          $(".wifi-symbol-2 .wifi-circle").css({
            "border-color": this.config.wifiSymbol.almostColor,
            "font-size": this.config.wifiSymbol.size / 7,
            "margin-top": 0 - this.config.wifiSymbol.size - this.config.wifiSymbol.size * 0.25,
            "margin-left": 0.5 * (150 - this.config.wifiSymbol.size)
          });
          $(".wifi-symbol-2 [foo], .wifi-symbol-2").css({
            width: this.config.wifiSymbol.size,
            height: this.config.wifiSymbol.size
          });

          $(".wifi-symbol-3 .wifi-circle").css({
            "border-color": this.config.wifiSymbol.halfColor,
            "font-size": this.config.wifiSymbol.size / 7,
            "margin-top": 0 - this.config.wifiSymbol.size - this.config.wifiSymbol.size * 0.25,
            "margin-left": 0.5 * (150 - this.config.wifiSymbol.size)
          });
          $(".wifi-symbol-3 [foo], .wifi-symbol-3").css({
            width: this.config.wifiSymbol.size,
            height: this.config.wifiSymbol.size
          });

          $(".wifi-symbol-4 .wifi-circle").css({
            "border-color": this.config.wifiSymbol.noneColor,
            "font-size": this.config.wifiSymbol.size / 7,
            "margin-top": 0 - this.config.wifiSymbol.size - this.config.wifiSymbol.size * 0.25,
            "margin-left": 0.5 * (150 - this.config.wifiSymbol.size)
          });
          $(".wifi-symbol-4 [foo], .wifi-symbol-4").css({
            width: this.config.wifiSymbol.size,
            height: this.config.wifiSymbol.size
          });
        } else if (payload < 70) {
          $("#pingStrength").attr("src", this.file("images/strength_full.png"));
        } else if (payload >= 70 && payload < 100) {
          $("#pingStrength").attr("src", this.file("images/strength_almost.png"));
        } else if (payload >= 100 && payload < 150) {
          $("#pingStrength").attr("src", this.file("images/strength_half.png"));
        } else if (payload >= 150) {
          $("#pingStrength").attr("src", this.file("images/strength_none.png"));
        }
      }
    }
  },

  getDom () {
    const wrapper = document.createElement("div");
    wrapper.className = "small";
    // Log.log(this.config);

    if (this.config.displayStrength) {
      Log.log("creating pingDiv");
      const pingDiv = document.createElement("div");
      pingDiv.id = "pingDiv";
      pingDiv.className = "strength";

      const img = document.createElement("img");
      img.src = this.file("images/strength_none.png");
      img.height = this.config.strengthIconSize;
      img.id = "pingStrength";
      img.className = "pingStrength";
      pingDiv.appendChild(img);

      wrapper.appendChild(pingDiv);
    }

    if (this.config.displaySpeed) {
      Log.log("creating speed");
      const minimal = this.config.type === "minimal";

      const downloadSpeedGauge = document.createElement("div");
      downloadSpeedGauge.id = "downloadSpeedGauge";
      downloadSpeedGauge.className = "speedGauge";

      const uploadSpeedGauge = document.createElement("div");
      uploadSpeedGauge.id = "uploadSpeedGauge";
      uploadSpeedGauge.className = "speedGauge";

      this.download = new JustGage({
        // id: "downloadSpeedGauge",
        parentNode: downloadSpeedGauge,
        value: 0,
        min: 0,
        max: this.config.maxDownloadGaugeScale,
        label: "Download",
        refreshAnimationType: "linear",
        gaugeWidthScale: 0.8,
        valueFontColor: "#FFFFFF",
        valueFontFamily: "Roboto Condensed",
        labelFontColor: "#AAAAAA",
        hideMinMax: false,
        gaugeColor: "#000000",
        levelColors: ["#FF0000", "#FFFF00", "#00FF00"],
        showInnerShadow: false,
        symbol: "Mbps"
      });

      this.upload = new JustGage({
        // id: "uploadSpeedGauge",
        parentNode: uploadSpeedGauge,
        value: 0,
        min: 0,
        max: this.config.maxUploadGaugeScale,
        label: "Upload",
        refreshAnimationType: "linear",
        gaugeWidthScale: 0.8,
        valueFontColor: "#FFFFFF",
        valueFontFamily: "Roboto Condensed",
        labelFontColor: "#AAAAAA",
        hideMinMax: false,
        gaugeColor: "#000000",
        levelColors: ["#FF0000", "#FFFF00", "#00FF00"],
        showInnerShadow: false,
        symbol: "Mbps"
      });

      if (minimal) {
        const downOpt = {
          gaugeColor: "#000",
          levelColors: "#fff",
          hideInnerShadow: true
        };
        const upOpt = {
          gaugeColor: "#000",
          levelColors: "#fff",
          hideInnerShadow: true
        };
        this.download.update(downOpt);
        this.upload.update(upOpt);
      }
      wrapper.appendChild(downloadSpeedGauge);
      wrapper.appendChild(uploadSpeedGauge);
    }

    if (this.config.verbose) {
      const data = document.createElement("div");
      data.id = "internetData";
      wrapper.appendChild(data);
    }

    return wrapper;
  }

});
