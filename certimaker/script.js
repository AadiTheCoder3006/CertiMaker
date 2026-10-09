// ===== 1. Get the page elements =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const templateInput = document.getElementById("templateInput");
const namesInput = document.getElementById("namesInput");
const nameCount = document.getElementById("nameCount");
const previewSelect = document.getElementById("previewSelect");
const fontSize = document.getElementById("fontSize");
const fontFamily = document.getElementById("fontFamily");
const textColor = document.getElementById("textColor");
const posX = document.getElementById("posX");
const posY = document.getElementById("posY");
const statusText = document.getElementById("status");

// date controls
const dateOn = document.getElementById("dateOn");
const dateValue = document.getElementById("dateValue");
const dateFormat = document.getElementById("dateFormat");
const dateSize = document.getElementById("dateSize");
const dateColor = document.getElementById("dateColor");

// signature controls
const signOn = document.getElementById("signOn");
const signText = document.getElementById("signText");
const signInput = document.getElementById("signInput");
const signSize = document.getElementById("signSize");
const signColor = document.getElementById("signColor");

// ===== 2. Data the app remembers =====
let templateImage = null;   // the uploaded background
let signImage = null;       // the uploaded signature image (optional)
let names = [];             // the list of participant names
let textX = canvas.width / 2;
let textY = canvas.height / 2;
let dateX = canvas.width * 0.25;
let dateY = canvas.height * 0.85;
let signX = canvas.width * 0.75;
let signY = canvas.height * 0.82;
let isDragging = false;

// today's date as the default (yyyy-mm-dd, using local time)
(function setToday() {
  const t = new Date();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  dateValue.value = t.getFullYear() + "-" + mm + "-" + dd;
})();

// ===== 3. Draw one certificate on the canvas =====

// turn the chosen date into text, based on the chosen format
function formattedDate() {
  if (!dateValue.value) return "";
  const parts = dateValue.value.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const real = new Date(y, m - 1, d);
  const pad = function (n) { return String(n).padStart(2, "0"); };

  switch (dateFormat.value) {
    case "us":
      return real.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    case "slash":
      return pad(d) + "/" + pad(m) + "/" + y;
    case "iso":
      return y + "-" + pad(m) + "-" + pad(d);
    default:
      return real.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
}

function drawDate() {
  const text = formattedDate();
  if (!dateOn.checked || text === "") return;
  ctx.fillStyle = dateColor.value;
  ctx.font = dateSize.value + "px " + fontFamily.value;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, dateX, dateY);
}

function drawSignature() {
  if (!signOn.checked) return;

  if (signImage) {
    // image: signSize is the width, height follows the image shape
    const w = Number(signSize.value);
    const h = w * (signImage.naturalHeight / signImage.naturalWidth);
    ctx.drawImage(signImage, signX - w / 2, signY - h / 2, w, h);
  } else if (signText.value.trim() !== "") {
    // typed: signSize is the font size, drawn in a handwriting style
    ctx.fillStyle = signColor.value;
    ctx.font = "italic " + signSize.value + "px 'Brush Script MT', 'Segoe Script', cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(signText.value.trim(), signX, signY);
  }
}

function drawCertificate(name) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // no template yet: show a hint
  if (!templateImage) {
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#6b7280";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Upload a template to start", canvas.width / 2, canvas.height / 2);
    return;
  }

  // background, then the name, date and signature on top
  ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = textColor.value;
  ctx.font = fontSize.value + "px " + fontFamily.value;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name, textX, textY);

  drawDate();
  drawSignature();
}

// the name shown in the preview (selected name, or a sample)
function previewName() {
  return names.length > 0 ? previewSelect.value : "Participant Name";
}

// redraw and keep the X/Y boxes up to date
function refresh() {
  posX.value = Math.round(textX);
  posY.value = Math.round(textY);
  drawCertificate(previewName());
}

// put the date and signature back to their starting spots
function resetDatePosition() {
  dateX = canvas.width * 0.25;
  dateY = canvas.height * 0.85;
}
function resetSignPosition() {
  signX = canvas.width * 0.75;
  signY = canvas.height * 0.82;
}

// ===== 4. Upload the template =====
templateInput.addEventListener("change", function () {
  const file = templateInput.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = function () {
    templateImage = img;
    canvas.width = img.naturalWidth;      // keep the real image size
    canvas.height = img.naturalHeight;
    textX = canvas.width / 2;
    textY = canvas.height / 2;
    resetDatePosition();
    resetSignPosition();
    fontSize.value = Math.round(canvas.width / 14);
    dateSize.value = Math.round(canvas.width / 28);
    if (!signImage) signSize.value = Math.round(canvas.width / 14);
    refresh();
  };
  img.src = URL.createObjectURL(file);
});

// ===== 5. Import names (.csv or .xlsx) =====
namesInput.addEventListener("change", function () {
  const file = namesInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  if (file.name.toLowerCase().endsWith(".xlsx")) {
    // Excel file: SheetJS turns it into rows
    reader.onload = function (e) {
      const workbook = XLSX.read(e.target.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setNames(rows.map(function (row) { return String(row[0] || ""); }));
    };
    reader.readAsArrayBuffer(file);
  } else {
    // CSV file: one name per line, we take the first column
    reader.onload = function (e) {
      const lines = e.target.result.split(/\r?\n/);
      setNames(lines.map(function (line) { return line.split(",")[0]; }));
    };
    reader.readAsText(file);
  }
});

function setNames(list) {
  // clean up: trim spaces, remove empty rows
  names = list.map(function (n) { return n.replace(/"/g, "").trim(); })
              .filter(function (n) { return n !== ""; });

  // drop the header row if it says "name"
  if (names.length > 0 && names[0].toLowerCase() === "name") names.shift();

  // fill the preview dropdown
  previewSelect.innerHTML = "";
  names.forEach(function (n) {
    const option = document.createElement("option");
    option.value = n;
    option.textContent = n;
    previewSelect.appendChild(option);
  });

  nameCount.textContent = names.length + " names loaded.";
  refresh();
}

// ===== 6. Upload the signature image =====
signInput.addEventListener("change", function () {
  const file = signInput.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = function () {
    signImage = img;
    signSize.value = Math.round(canvas.width / 6);   // image width in pixels
    refresh();
  };
  img.src = URL.createObjectURL(file);
});

document.getElementById("signClearBtn").addEventListener("click", function () {
  signImage = null;
  signInput.value = "";
  signSize.value = Math.round(canvas.width / 14);    // back to a font size
  refresh();
});

document.getElementById("signResetBtn").addEventListener("click", function () {
  resetSignPosition();
  refresh();
});

document.getElementById("dateResetBtn").addEventListener("click", function () {
  resetDatePosition();
  refresh();
});

// ===== 7. Controls update the preview =====
previewSelect.addEventListener("change", refresh);
fontSize.addEventListener("input", refresh);
fontFamily.addEventListener("change", refresh);
textColor.addEventListener("input", refresh);

[dateOn, dateValue, dateFormat, dateSize, dateColor,
 signOn, signText, signSize, signColor].forEach(function (el) {
  el.addEventListener("input", refresh);
  el.addEventListener("change", refresh);
});

posX.addEventListener("input", function () {
  textX = Number(posX.value);
  drawCertificate(previewName());
});
posY.addEventListener("input", function () {
  textY = Number(posY.value);
  drawCertificate(previewName());
});

document.getElementById("centerBtn").addEventListener("click", function () {
  textX = canvas.width / 2;
  textY = canvas.height / 2;
  refresh();
});

// ===== 8. Drag the name, date or signature =====
// The canvas may look smaller on screen than its real size,
// so we scale the mouse position to canvas pixels.
function moveTarget() {
  return document.querySelector('input[name="moveTarget"]:checked').value;
}

function moveTo(event) {
  const box = canvas.getBoundingClientRect();
  const x = (event.clientX - box.left) * (canvas.width / box.width);
  const y = (event.clientY - box.top) * (canvas.height / box.height);

  const target = moveTarget();
  if (target === "date") {
    dateX = x; dateY = y;
  } else if (target === "sign") {
    signX = x; signY = y;
  } else {
    textX = x; textY = y;
  }
  refresh();
}

canvas.addEventListener("pointerdown", function (event) {
  isDragging = true;
  canvas.setPointerCapture(event.pointerId);
  moveTo(event);
});
canvas.addEventListener("pointermove", function (event) {
  if (isDragging) moveTo(event);
});
canvas.addEventListener("pointerup", function () {
  isDragging = false;
});
canvas.addEventListener("pointercancel", function () {
  isDragging = false;   // e.g. the phone interrupts the touch
});

// ===== 9. Download =====
function pause(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function isReady() {
  if (!templateImage || names.length === 0) {
    statusText.textContent = "Please upload a template and import names first.";
    return false;
  }
  return true;
}

// 9a. every certificate as its own PNG image
document.getElementById("imagesBtn").addEventListener("click", async function () {
  if (!isReady()) return;

  for (let i = 0; i < names.length; i++) {
    statusText.textContent = "Creating " + (i + 1) + " of " + names.length + "...";
    drawCertificate(names[i]);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "certificate_" + names[i].replace(/[^a-z0-9]/gi, "_") + ".png";
    link.click();

    await pause(300);   // small gap so the browser allows many downloads
  }

  statusText.textContent = "Done! Allow multiple downloads if the browser asks.";
  refresh();
});

// 9b. all certificates in one PDF (one page each)
document.getElementById("pdfBtn").addEventListener("click", function () {
  if (!isReady()) return;

  const { jsPDF } = window.jspdf;
  const w = canvas.width;
  const h = canvas.height;
  const pdf = new jsPDF({
    orientation: w >= h ? "landscape" : "portrait",
    unit: "px",
    format: [w, h]
  });

  for (let i = 0; i < names.length; i++) {
    drawCertificate(names[i]);
    if (i > 0) pdf.addPage([w, h]);
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, w, h);
  }

  pdf.save("certificates.pdf");
  statusText.textContent = "PDF ready!";
  refresh();
});

// first draw
refresh();
