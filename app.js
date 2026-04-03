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
      type: "visual", // 🎯 Change from "report" to "visual"
      tokenType: models.TokenType.Aad,
      accessToken: token,
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=986b8ac8-b62f-4af0-b5c5-701386a09c4d",
      id: "986b8ac8-b62f-4af0-b5c5-701386a09c4d",
      
      // 🎯 You MUST specify the page and visual name here
      pageName: "Executive Summary", // This is the internal ID (e.g., ReportSection123), not the Display Name
      visualName: "sample", 
      
      settings: {
        panes: {
          filters: { visible: false },
          pageNavigation: { visible: false }
        }
      }
    };

    const container = document.getElementById("chartContainer");
    
    // This will now render ONLY the chart "visualContainer3"
    const visual = powerbi.embed(container, config);

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
