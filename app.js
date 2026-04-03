const msalInstance = new msal.PublicClientApplication({
  auth: {
    clientId: "e990a8c9-3d3f-4929-be3f-ed71e3a05435",
    authority: "https://login.microsoftonline.com/3f490075-5020-4610-8ad9-2dd8534f2e41",
    redirectUri: "https://siddiquisaleha.github.io/pbi-demo/"
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
    embedUrl: "https://app.powerbi.com/reportEmbed?reportId=986b8ac8-b62f-4af0-b5c5-701386a09c4d&autoAuth=true&ctid=3f490075-5020-4610-8ad9-2dd8534f2e41",
    id: "986b8ac8-b62f-4af0-b5c5-701386a09c4d"
  };
  powerbi.embed(document.getElementById("reportContainer"), config);
}

async function loadChart() {
  const token = await getToken();
  const config = {
    type: "visual",
    tokenType: 0,
    accessToken: token,
    embedUrl: "https://app.powerbi.com/reportEmbed?reportId=986b8ac8-b62f-4af0-b5c5-701386a09c4d&autoAuth=true&ctid=3f490075-5020-4610-8ad9-2dd8534f2e41",
    id: "986b8ac8-b62f-4af0-b5c5-701386a09c4d",
    pageName: "Executive Summary",
    visualName: "CY Persistency % and PY Persistency %  by Branch "
  };
  powerbi.embed(document.getElementById("chartContainer"), config);
}

if (location.pathname.includes("dashboard")) loadReport();
if (location.pathname.includes("chart")) loadChart();
