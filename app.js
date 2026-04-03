const msalInstance = new msal.PublicClientApplication({
  auth: {
    clientId: "e990a8c9-3d3f-4929-be3f-ed71e3a05435",
    authority: "https://login.microsoftonline.com/3f490075-5020-4610-8ad9-2dd8534f2e41",
    redirectUri: window.location.origin
  }
});

async function login() {
  const res = await msalInstance.loginPopup({
    scopes: ["https://analysis.windows.net/powerbi/api/.default"]
  });
  localStorage.setItem("account", JSON.stringify(res.account));
  window.location.href = "dashboard.html";
}

async function getToken() {
  const account = JSON.parse(localStorage.getItem("account"));
  const res = await msalInstance.acquireTokenSilent({
    scopes: ["https://analysis.windows.net/powerbi/api/.default"],
    account: account
  });
  return res.accessToken;
}

async function loadReport() {
  const token = await getToken();
  const config = {
    type: "report",
    tokenType: 0,
    accessToken: token,
    embedUrl: "https://app.powerbi.com/reportEmbed?reportId=a3f39ad9-1253-4a88-9492-58274cc36a96&autoAuth=true&ctid=3f490075-5020-4610-8ad9-2dd8534f2e41",
    id: "a3f39ad9-1253-4a88-9492-58274cc36a96"
  };
  powerbi.embed(document.getElementById("reportContainer"), config);
}

async function loadChart() {
  const token = await getToken();
  const config = {
    type: "visual",
    tokenType: 0,
    accessToken: token,
    embedUrl: "https://app.powerbi.com/reportEmbed?reportId=a3f39ad9-1253-4a88-9492-58274cc36a96&autoAuth=true&ctid=3f490075-5020-4610-8ad9-2dd8534f2e41",
    id: "a3f39ad9-1253-4a88-9492-58274cc36a96",
    pageName: "Sales Overview",
    visualName: "Sales By Territory"
  };
  powerbi.embed(document.getElementById("chartContainer"), config);
}

if (location.pathname.includes("dashboard")) loadReport();
if (location.pathname.includes("chart")) loadChart();
