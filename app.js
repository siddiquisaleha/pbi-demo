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

    const config = {
      type: "report",
      tokenType: models.TokenType.Aad,
      accessToken: token,
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=986b8ac8-b62f-4af0-b5c5-701386a09c4d",
      id: "986b8ac8-b62f-4af0-b5c5-701386a09c4d",
      settings: {
        background: models.BackgroundType.Transparent,
        panes: {
          filters: { visible: false },
          pageNavigation: { visible: false }
        }
      }
    };

    const container = document.getElementById("chartContainer");
    const report = powerbi.embed(container, config);

    report.on("loaded", async () => {
      const pages = await report.getPages();

      // 👉 Select correct page
      const page = pages.find(p => p.displayName === "Executive Summary") || pages[0];
      await page.setActive();

      const visuals = await page.getVisuals();

      // 🔍 Check once in console
      console.log("ALL VISUALS:", visuals);

      // 🔴 IMPORTANT: replace with your actual visual name after checking console
      const targetVisual =
        visuals.find(v => v.name === "sample") || visuals[0];

      // 🔥 Hide all other visuals
      for (const v of visuals) {
        if (v.name !== targetVisual.name) {
          await v.setVisualDisplayState(models.VisualContainerDisplayMode.Hidden);
        }
      }

      // ✅ Ensure target visual is visible
      await targetVisual.setVisualDisplayState(models.VisualContainerDisplayMode.Visible);

    });

  } catch (err) {
    console.error("Chart load error:", err);
  }
}
// 🚀 ROUTING
if (location.pathname.includes("dashboard")) {
  loadReport();
}

if (location.pathname.includes("chart")) {
  loadChart();
}
