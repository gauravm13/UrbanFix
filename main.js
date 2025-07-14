const coordsSpan = document.getElementById('coords');
const getLocationBtn = document.getElementById('get-location');
const canvas = document.getElementById('issue-canvas');
const drawPencilBtn = document.getElementById('draw-pencil');
const drawRectBtn = document.getElementById('draw-rect');
const drawUndoBtn = document.getElementById('draw-undo');
const tagBtns = document.querySelectorAll('.tag-btn');
const issueDesc = document.getElementById('issue-desc');
const submitReportBtn = document.getElementById('submit-report');
const saveStatusDiv = document.getElementById('save-status');
const reportsListDiv = document.getElementById('reports-list');
const loadMoreTrigger = document.getElementById('load-more-trigger');


let currentCoords = null;
let currentTag = null;
let drawingMode = 'pencil';
let drawing = false;
let startX = 0, startY = 0;
let canvasHistory = [];
let reportsQueue = [];
let isOnline = navigator.onLine;


function updateCoordsDisplay(coords) {
  if (!coords) {
    coordsSpan.textContent = '--';
    return;
  }
  const lat = coords.latitude.toFixed(4);
  const lng = coords.longitude.toFixed(4);
  coordsSpan.textContent = `${lat}° N, ${lng}° E`;
}

function getLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }
  getLocationBtn.textContent = 'Locating...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      currentCoords = pos.coords;
      updateCoordsDisplay(currentCoords);
      getLocationBtn.textContent = 'Get My Location';
    },
    (err) => {
      alert('Unable to retrieve your location.');
      updateCoordsDisplay(null);
      getLocationBtn.textContent = 'Get My Location';
    }
  );
}
getLocationBtn.addEventListener('click', getLocation);


const ctx = canvas.getContext('2d');
canvas.width = 320;
canvas.height = 200;

function saveCanvasState() {
  canvasHistory.push(canvas.toDataURL());
  if (canvasHistory.length > 20) canvasHistory.shift();
}
function restoreCanvasState() {
  if (canvasHistory.length === 0) return;
  const img = new window.Image();
  img.onload = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = canvasHistory.pop();
}
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

drawPencilBtn.addEventListener('click', () => {
  drawingMode = 'pencil';
  drawPencilBtn.style.background = '#1d4ed8';
  drawRectBtn.style.background = '#2563eb';
});
drawRectBtn.addEventListener('click', () => {
  drawingMode = 'rect';
  drawRectBtn.style.background = '#1d4ed8';
  drawPencilBtn.style.background = '#2563eb';
});
drawUndoBtn.addEventListener('click', restoreCanvasState);

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
  if (drawingMode === 'pencil') {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    saveCanvasState();
  }
});
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (drawingMode === 'pencil') {
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (drawingMode === 'rect') {
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (canvasHistory.length > 0) {
      const img = new window.Image();
      img.onload = function() { ctx.drawImage(img, 0, 0); };
      img.src = canvasHistory[canvasHistory.length - 1];
    }
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  }
});
canvas.addEventListener('mouseup', (e) => {
  if (!drawing) return;
  drawing = false;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (drawingMode === 'rect') {
    saveCanvasState();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  }
  ctx.closePath();
});

canvas.addEventListener('touchstart', (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  startX = touch.clientX - rect.left;
  startY = touch.clientY - rect.top;
  if (drawingMode === 'pencil') {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    saveCanvasState();
  }
});
canvas.addEventListener('touchmove', (e) => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  if (drawingMode === 'pencil') {
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (drawingMode === 'rect') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (canvasHistory.length > 0) {
      const img = new window.Image();
      img.onload = function() { ctx.drawImage(img, 0, 0); };
      img.src = canvasHistory[canvasHistory.length - 1];
    }
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  }
});
canvas.addEventListener('touchend', (e) => {
  if (!drawing) return;
  drawing = false;
  const rect = canvas.getBoundingClientRect();
  const touch = e.changedTouches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  if (drawingMode === 'rect') {
    saveCanvasState();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  }
  ctx.closePath();
});


tagBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tagBtns.forEach(b => b.style.background = '#2563eb');
    btn.style.background = '#1d4ed8';
    currentTag = btn.dataset.tag;
  });
});

function getCanvasImage() {
  return canvas.toDataURL('image/png');
}
function clearReportForm() {
  clearCanvas();
  issueDesc.value = '';
  tagBtns.forEach(b => b.style.background = '#2563eb');
  currentTag = null;
  saveStatusDiv.textContent = '';
}
function saveReportLocally(report) {
  let queue = JSON.parse(localStorage.getItem('urbanfix-queue') || '[]');
  queue.push(report);
  localStorage.setItem('urbanfix-queue', JSON.stringify(queue));
}
function trySyncReports() {
  if (!navigator.onLine) return;
  let queue = JSON.parse(localStorage.getItem('urbanfix-queue') || '[]');
  if (queue.length > 0) {

    queue.forEach(r => addReportToCommunity(r));
    localStorage.setItem('urbanfix-queue', '[]');
    saveStatusDiv.textContent = '✅ Reports synced!';
    setTimeout(() => saveStatusDiv.textContent = '', 1500);
  }
}
function autoSaveDraft() {
  const draft = {
    coords: currentCoords,
    tag: currentTag,
    desc: issueDesc.value,
    image: getCanvasImage(),
    ts: Date.now()
  };
  localStorage.setItem('urbanfix-draft', JSON.stringify(draft));
  saveStatusDiv.textContent = '💾 Draft auto-saved';
  setTimeout(() => saveStatusDiv.textContent = '', 1000);
}
setInterval(autoSaveDraft, 10000);

submitReportBtn.addEventListener('click', () => {
  if (!currentCoords) {
    alert('Please get your location first!');
    return;
  }
  if (!currentTag) {
    alert('Please tag the issue!');
    return;
  }
  if (!issueDesc.value.trim()) {
    alert('Please describe the issue!');
    return;
  }
  const report = {
    coords: currentCoords,
    tag: currentTag,
    desc: issueDesc.value,
    image: getCanvasImage(),
    ts: Date.now()
  };
  if (navigator.onLine) {
    addReportToCommunity(report);
    saveStatusDiv.textContent = '✅ Report submitted!';
    setTimeout(() => saveStatusDiv.textContent = '', 1500);
  } else {
    saveReportLocally(report);
    saveStatusDiv.textContent = '📶 Offline: Report queued!';
    setTimeout(() => saveStatusDiv.textContent = '', 1500);
  }
  clearReportForm();
});

window.addEventListener('online', trySyncReports);


let allReports = [];
function addReportToCommunity(report) {
  allReports.unshift(report);
  renderReports();
}
function renderReports() {
  reportsListDiv.innerHTML = '';
  let toShow = allReports.slice(0, reportsLoadedCount);
  toShow.forEach(report => {
    const card = document.createElement('div');
    card.className = 'report-card';
    card.innerHTML = `
      <div><b>Tag:</b> ${getTagEmoji(report.tag)} ${report.tag}</div>
      <div><b>Location:</b> ${report.coords ? report.coords.latitude.toFixed(4) + ', ' + report.coords.longitude.toFixed(4) : '--'}</div>
      <div><b>Description:</b> ${report.desc}</div>
      <img src="${report.image}" alt="Issue sketch" style="width:100%;max-width:280px;margin:0.5rem 0;border-radius:4px;"/>
      <div style="font-size:0.9em;color:#888;">${new Date(report.ts).toLocaleString()}</div>
    `;
    reportsListDiv.appendChild(card);
  });
}
function getTagEmoji(tag) {
  switch(tag) {
    case 'pothole': return '🕳️';
    case 'light': return '💡';
    case 'garbage': return '🗑️';
    default: return '❓';
  }
}

let reportsLoadedCount = 3;
function loadMoreReports() {
  reportsLoadedCount += 3;
  renderReports();
}
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMoreReports();
    }
  });
}, { threshold: 0.2 });
observer.observe(loadMoreTrigger);


document.addEventListener('DOMContentLoaded', () => {

  const draft = JSON.parse(localStorage.getItem('urbanfix-draft') || 'null');
  if (draft) {
    if (draft.coords) {
      currentCoords = draft.coords;
      updateCoordsDisplay(currentCoords);
    }
    if (draft.tag) {
      currentTag = draft.tag;
      tagBtns.forEach(b => b.style.background = b.dataset.tag === currentTag ? '#1d4ed8' : '#2563eb');
    }
    if (draft.desc) issueDesc.value = draft.desc;
    if (draft.image) {
      const img = new window.Image();
      img.onload = function() { ctx.drawImage(img, 0, 0); };
      img.src = draft.image;
    }
  }

  let queue = JSON.parse(localStorage.getItem('urbanfix-queue') || '[]');
  queue.forEach(r => addReportToCommunity(r));

  for (let i = 0; i < 5; i++) {
    allReports.push({
      coords: { latitude: 28.6 + Math.random() * 0.1, longitude: 77.2 + Math.random() * 0.1 },
      tag: ['pothole','light','garbage','other'][i%4],
      desc: 'Sample community report #' + (i+1),
      image: '',
      ts: Date.now() - (i+1)*3600000
    });
  }
  renderReports();
}); 
