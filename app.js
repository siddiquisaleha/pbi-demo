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
let visuals = [];
let currentIndex = 0;
let slideshowInterval;
let isPlaying = true;
let report, models;

async function loadChart() {
  try {
    const token = await getToken();
    models = window['powerbi-client'].models;

    const config = {
      type: "report",
      tokenType: models.TokenType.Aad,
      accessToken: token,
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=986b8ac8-b62f-4af0-b5c5-701386a09c4d",
      id: "986b8ac8-b62f-4af0-b5c5-701386a09c4d",
      settings: {
        panes: {
          filters: { visible: false },
          pageNavigation: { visible: false }
        }
      }
    };

    report = powerbi.embed(document.getElementById("chartContainer"), config);

    report.on("loaded", async () => {
      const pages = await report.getPages();
      const page = pages.find(p => p.displayName === "Executive Summary") || pages[0];
      await page.setActive();

      visuals = await page.getVisuals();

      // Remove unwanted visuals
      visuals = visuals.filter(v => v.type !== "slicer");

      console.log("SLIDESHOW VISUALS:", visuals);

      createDots();
      showSlide(0);
      startSlideshow();
    });

  } catch (err) {
    console.error(err);
  }
}

// 🎯 Show specific visual
async function showSlide(index) {
  currentIndex = index;

  for (const v of visuals) {
    await v.setVisualDisplayState(models.VisualContainerDisplayMode.Hidden);
  }

  const visual = visuals[index];
  await visual.setVisualDisplayState(models.VisualContainerDisplayMode.Visible);

  // Update title
  document.getElementById("visualTitle").innerText =
    visual.title || `Visual ${index + 1}`;

  updateDots();
}

// ▶️ Slideshow
function startSlideshow() {
  slideshowInterval = setInterval(() => {
    nextSlide();
  }, 4000);
}

function stopSlideshow() {
  clearInterval(slideshowInterval);
}

// ⏯ Toggle
function togglePlay() {
  if (isPlaying) {
    stopSlideshow();
    document.getElementById("playBtn").innerText = "▶ Play";
  } else {
    startSlideshow();
    document.getElementById("playBtn").innerText = "⏸ Pause";
  }
  isPlaying = !isPlaying;
}

// ⏭ Next
function nextSlide() {
  currentIndex = (currentIndex + 1) % visuals.length;
  showSlide(currentIndex);
}

// ⏮ Prev
function prevSlide() {
  currentIndex = (currentIndex - 1 + visuals.length) % visuals.length;
  showSlide(currentIndex);
}

// 🔵 Dots
function createDots() {
  const dotsContainer = document.getElementById("dots");
  dotsContainer.innerHTML = "";

  visuals.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    dot.onclick = () => showSlide(i);
    dotsContainer.appendChild(dot);
  });
}

function updateDots() {
  const dots = document.querySelectorAll(".dot");
  dots.forEach(d => d.classList.remove("active-dot"));
  if (dots[currentIndex]) {
    dots[currentIndex].classList.add("active-dot");
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
