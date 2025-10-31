sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
  ],
  function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("rfmenu.controller.Menu", {
      onInit: function () {
        // Verifica ambiente di esecuzione
        this._checkEnvironment();
      },

      _checkEnvironment: function () {
        var bInLaunchpad = false;
        var bCrossNavAvailable = false;

        // Verifica se siamo nel Fiori Launchpad
        if (sap.ushell && sap.ushell.Container) {
          bInLaunchpad = true;
          console.log("Ambiente: Fiori Launchpad");

          // Verifica disponibilità CrossApp Navigation
          try {
            sap.ushell.Container.getServiceAsync("CrossApplicationNavigation")
              .then(function () {
                bCrossNavAvailable = true;
                console.log("CrossApp Navigation: Disponibile");
              })
              .catch(function () {
                console.log("CrossApp Navigation: Non disponibile");
              });
          } catch (e) {
            console.log("CrossApp Navigation: Errore nel caricamento");
          }
        } else {
          console.log("Ambiente: Standalone (fuori dal Launchpad)");
        }

        this._bInLaunchpad = bInLaunchpad;
        this._bCrossNavAvailable = bCrossNavAvailable;
      },

      onNavRF1: function () {
        this._navigateToApp("zrf_app1", {
          semanticObject: "RFInterface",
          action: "display",
        });
      },

      onNavRF2: function () {
        this._navigateToApp("zrf_app2", {
          semanticObject: "RFInterfaceStorageLoc",
          action: "display",
        });
      },

      onNavRF3: function () {
        this._navigateToApp("zrf_app3", {
          semanticObject: "RFInterfaceReceptionV2",
          action: "display",
        });
      },

      onNavStandard: function () {
        var sOrigin = window.location.origin;
        var sUrl =
          sOrigin + "/sap/bc/gui/sap/its/ewm_mobgui?~transaction=/scwm/rfui";

        this._navigateByUrl(sUrl);
      },

      //onNavStandard: function () {
      //var sUrl =
      //"https://my421627.s4hana.cloud.sap/ui#EWMSystem-testRFEnvironment?sap-ui-tech-hint=GUI";

      // Navigazione diretta
      //this._navigateByUrl(sUrl);
      //},

      _navigateToApp: function (sAppName, oCrossNavConfig) {
        var sOrigin = window.location.origin; // prende automaticamente CUST o DEV
        var sUrl =
          sOrigin +
          "/ui?sap-ushell-config=headerless&sap-ui-tech-hint=GUI#" +
          oCrossNavConfig.semanticObject +
          "-" +
          oCrossNavConfig.action;

        this._navigateByUrl(sUrl);
        // Se abbiamo configurazione CrossNav e siamo nel Launchpad, prova prima quella
        //if (oCrossNavConfig && this._bInLaunchpad) {
        //  this._attemptCrossNavigation(oCrossNavConfig, sUrl);
        //} else {
        //           // Navigazione diretta
        //this._navigateByUrl(sUrl);
        //}
      },

      _attemptCrossNavigation: function (oConfig, sFallbackUrl) {
        var that = this;

        if (!sap.ushell || !sap.ushell.Container) {
          this._navigateByUrl(sFallbackUrl);
          return;
        }

        that._navigateByUrl(sFallbackUrl);
        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation")
          .then(function (oCrossAppNav) {
            // Verifica supporto
            return oCrossAppNav.isNavigationSupported([
              {
                //params: {
                //  "sap-ushell-config": "headerless",
                //},
                target: {
                  semanticObject: oConfig.semanticObject,
                  action: oConfig.action,
                },
              },
            ]);
          })
          .then(function (aSupported) {
            if (aSupported && aSupported[0] && aSupported[0].supported) {
              // CrossNav supportata
              return sap.ushell.Container.getServiceAsync(
                "CrossApplicationNavigation"
              ).then(function (oCrossAppNav) {
                return oCrossAppNav.toExternal({
                  //params: {
                  //  "sap-ushell-config": "headerless",
                  //},
                  target: {
                    semanticObject: oConfig.semanticObject,
                    action: oConfig.action,
                  },
                });
              });
            } else {
              // CrossNav non supportata, usa URL
              that._navigateByUrl(sFallbackUrl);
            }
          })
          .catch(function (err) {
            console.error("Errore CrossApp Navigation:", err);
            that._navigateByUrl(sFallbackUrl);
          });
      },

      _navigateByUrl: function (sUrl) {
        if (!sUrl) {
          MessageToast.show("URL dell'applicazione non definito");
          return;
        }

        try {
          console.log("Navigazione a:", sUrl);

          // Verifica se l'URL è assoluto o relativo
          if (sUrl.startsWith("http") || sUrl.startsWith("/")) {
            window.location.href = sUrl;
          } else {
            // URL relativo, aggiungi base path se necessario
            var sBasePath = this._getBasePath();
            window.location.href = sBasePath + sUrl;
          }
        } catch (err) {
          console.error("Errore navigazione URL:", err);
          MessageToast.show("Impossibile aprire l'applicazione: " + sUrl);
        }
      },

      _getBasePath: function () {
        // Cerca di determinare il base path del sistema
        var sOrigin = window.location.origin;
        return sOrigin + "/sap/bc/ui5_ui5/sap/";
      },

      // Metodo per debug - da rimuovere in produzione
      onDebugInfo: function () {
        var sInfo = "Ambiente Debug:\n";
        sInfo += "- In Launchpad: " + this._bInLaunchpad + "\n";
        sInfo += "- CrossNav Available: " + this._bCrossNavAvailable + "\n";
        sInfo += "- Current URL: " + window.location.href + "\n";
        sInfo += "- Origin: " + window.location.origin;

        alert(sInfo);
      },

      onLogoff: function () {
        window.location.href = "/sap/public/bc/icf/logoff";
      },
    });
  }
);
