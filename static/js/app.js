document.addEventListener("DOMContentLoaded", init);

let labelsMap = null;

async function init() {
  const fileInput = document.getElementById("fileInput");
  const btnPredict = document.getElementById("btnPredict");
  const imgPreview = document.getElementById("imgPreview");
  const resultDiv = document.getElementById("result");
  const dropZone = document.getElementById("dropZone");
  const cameraBtn = document.getElementById("cameraBtn");
  const video = document.getElementById("videoPreview");
  const captureBtn = document.getElementById("captureBtn");

  await loadLabels(); // optional: load labels mapping from /static/labels.json

  // File select -> preview
  fileInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) previewFile(f, imgPreview, resultDiv);
  });

  // Predict button
  btnPredict.addEventListener("click", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      alert("Please choose or capture an image first");
      return;
    }
    await predictFile(file, resultDiv);
  });

  // Drag & drop
  ["dragenter", "dragover"].forEach((ev) => {
    dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((ev) => {
    dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
    });
  });

  dropZone.addEventListener("drop", (e) => {
    const f = e.dataTransfer.files[0];
    if (f) {
      fileInput.files = createFileList(f);
      previewFile(f, imgPreview, resultDiv);
    }
  });

  // Camera toggle & capture
  let cameraStream = null;
  cameraBtn &&
    cameraBtn.addEventListener("click", async () => {
      if (!cameraStream) {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
          video.srcObject = cameraStream;
          video.style.display = "block";
          captureBtn.style.display = "inline-block";
          cameraBtn.textContent = "Stop Camera";
        } catch (err) {
          alert("Camera error: " + err.message);
        }
      } else {
        stopCamera(cameraStream);
        cameraStream = null;
        video.style.display = "none";
        captureBtn.style.display = "none";
        cameraBtn.textContent = "Camera";
      }
    });

  captureBtn &&
    captureBtn.addEventListener("click", () => {
      if (!video || video.style.display === "none") return;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          const f = new File([blob], "capture.jpg", { type: "image/jpeg" });
          fileInput.files = createFileList(f);
          previewFile(f, imgPreview, resultDiv);
        },
        "image/jpeg",
        0.9
      );
    });
}

// Helper: create FileList from a File
function createFileList(file) {
  const dt = new DataTransfer();
  dt.items.add(file);
  return dt.files;
}

function previewFile(file, imgEl, resultDiv) {
  resultDiv.innerHTML = "";
  imgEl.src = URL.createObjectURL(file);
  imgEl.onload = () => {
    try {
      URL.revokeObjectURL(imgEl.src);
    } catch (e) {}
  };
}

// Load labels mapping (optional)
async function loadLabels() {
  try {
    const r = await fetch("/static/labels.json");
    if (!r.ok) return;
    labelsMap = await r.json();
  } catch (e) {
    console.warn("labels.json not loaded", e);
  }
}

// Show spinner
function setLoading(resultDiv, on = true) {
  if (on) {
    resultDiv.innerHTML = `<div class="loading">Predicting... <span class="dot">.</span></div>`;
  }
}

// Display an error
function showError(resultDiv, msg) {
  resultDiv.innerHTML = `<div class="error">Error: ${escapeHtml(msg)}</div>`;
}

// ✅ Updated showResult: renders a table
function showResult(resultDiv, { predictions }) {
  if (!Array.isArray(predictions) || predictions.length === 0) {
    showError(resultDiv, "No predictions available");
    return;
  }

  // Take top 3
  const top = predictions.slice(0, 3);

  let html = `
    <table class="result-table">
      <thead>
        <tr>
          <th>Disease</th>
          <th>Solution</th>
          <th>Rank</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody>
  `;

  top.forEach((p, idx) => {
    const disease =
      labelsMap && labelsMap[String(p.index)]
        ? labelsMap[String(p.index)]
        : p.label ?? `Class ${p.index}`;
    const solution = p.solution ?? "No guidance available";
    const pct = Math.round((p.probability ?? 0) * 100);

    html += `
      <tr>
        <td>${escapeHtml(disease)}</td>
        <td>${escapeHtml(solution)}</td>
        <td>${idx + 1}</td>
        <td>${pct}%</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  resultDiv.innerHTML = html;
}

// Predict function
async function predictFile(file, resultDiv) {
  setLoading(resultDiv, true);
  try {
    const fd = new FormData();
    fd.append("image", file);

    const resp = await fetch("/predict", { method: "POST", body: fd });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      if (resp.status === 500 || resp.status === 0) {
        const mock = mockResponse();
        showResult(resultDiv, mock);
        return;
      }
      showError(resultDiv, `Server returned ${resp.status} ${text}`);
      return;
    }

    const data = await resp.json();

    if (Array.isArray(data.predictions) && data.predictions.length > 0) {
      showResult(resultDiv, { predictions: data.predictions });
    } else {
      showError(resultDiv, "No predictions received from server");
    }
  } catch (err) {
    console.error(err);
    const m = mockResponse();
    showResult(resultDiv, m);
  }
}

// Mock response
function mockResponse() {
  return {
    predictions: [
      {
        index: 0,
        label: "Tomato - Early Blight (mock)",
        solution:
          "Remove affected leaves, apply copper fungicide, rotate crops. (mock)",
        probability: 0.82,
      },
      {
        index: 1,
        label: "Tomato - Leaf Mold (mock)",
        solution: "Increase air circulation, avoid overhead watering. (mock)",
        probability: 0.12,
      },
      {
        index: 2,
        label: "Tomato - Septoria Leaf Spot (mock)",
        solution: "Prune lower leaves, apply fungicide. (mock)",
        probability: 0.06,
      },
    ],
  };
}

// Escape HTML
function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c])
  );
}

// Stop camera helper
function stopCamera(stream) {
  try {
    stream.getTracks().forEach((t) => t.stop());
  } catch (e) {}
}
