const msalInstance = new msal.PublicClientApplication({
  auth: {
    clientId: "e990a8c9-3d3f-4929-be3f-ed71e3a05435",
    authority: "https://login.microsoftonline.com/3f490075-5020-4610-8ad9-2dd8534f2e41",
    redirectUri: "https://siddiquisaleha.github.io/pbi-demo/"
  }
});

// 🔐 LOGIN
async function login() {
  try {
    const res = await msalInstance.loginPopup({
      scopes: ["https://analysis.windows.net/powerbi/api/.default"]
    });

    localStorage.setItem("account", JSON.stringify(res.account));
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error("Login error:", err);
  }
}

// 🎟️ GET TOKEN
async function getToken() {
  try {
    const account = JSON.parse(localStorage.getItem("account"));

    const res = await msalInstance.acquireTokenSilent({
      scopes: ["https://analysis.windows.net/powerbi/api/.default"],
      account: account
    });

    return res.accessToken;
  } catch (err) {
    console.error("Token error:", err);
  }
}

// 📊 LOAD FULL REPORT
async function loadReport() {
  try {
    const token = await getToken();
    const models = window['powerbi-client'].models;

    const config = {
      type: "report",
      tokenType: models.TokenType.Aad,
      accessToken: token,
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=986b8ac8-b62f-4af0-b5c5-701386a09c4d",
      id: "986b8ac8-b62f-4af0-b5c5-701386a09c4d",
      settings: {
        panes: {
          filters: { visible: false },
          pageNavigation: { visible: true }
        }
      }
    };

    powerbi.embed(document.getElementById("reportContainer"), config);

  } catch (err) {
    console.error("Report load error:", err);
  }
}

// 📈 LOAD SPECIFIC VISUAL
async function loadChart() {
  try {
    const token = await getToken();
    const models = window['powerbi-client'].models;

    const container = document.getElementById("chartContainer");

    const config = {
      type: "report",
      tokenType: models.TokenType.Aad,
      accessToken: token,
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=986b8ac8-b62f-4af0-b5c5-701386a09c4d",
      id: "986b8ac8-b62f-4af0-b5c5-701386a09c4d",
      settings: {
        layoutType: models.LayoutType.Custom,
        background: models.BackgroundType.Transparent,
        panes: {
          filters: { visible: false },
          pageNavigation: { visible: false }
        }
      }
    };

    const report = powerbi.embed(container, config);

    report.on("loaded", async () => {
      const pages = await report.getPages();
      const page = pages.find(p => p.displayName === "Executive Summary") || pages[0];
      await page.setActive();

      const visuals = await page.getVisuals();
      console.log("VISUALS:", visuals);

      // 👉 Replace with your actual visual name after checking console
      const target = visuals.find(v => v.name === "visualContainer3") || visuals[0];

      const layout = await page.getVisualLayout(target.name);

      // 🎯 Pixel perfect layout
      await page.updateSettings({
        layoutType: models.LayoutType.Custom,
        customLayout: {
          displayOption: models.DisplayOption.FitToPage,
          pagesLayout: {
            [page.name]: {
              visualsLayout: {
                [target.name]: {
                  x: 50,
                  y: 50,
                  z: 10,
                  width: layout.width,
                  height: layout.height,
                  displayState: {
                    mode: models.VisualContainerDisplayMode.Visible
                  }
                }
              }
            }
          }
        }
      });
    });

  } catch (err) {
    console.error("Chart load error:", err);
  }
}
// 🚀 Init
if (location.pathname.includes("chart")) {
  loadChart();
}
// 🚀 ROUTING
if (location.pathname.includes("dashboard")) {
  loadReport();
}

if (location.pathname.includes("chart")) {
  loadChart();
}
