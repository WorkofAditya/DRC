// ================= DATABASE SETUP =================
const DB_NAME = "TransportDB";
const STORE_NAME = "bookings";
let db;

const request = indexedDB.open(DB_NAME, 2);

request.onupgradeneeded = e => {
  db = e.target.result;
  if (!db.objectStoreNames.contains(STORE_NAME)) {
    db.createObjectStore(STORE_NAME, { keyPath: "branch" });
  }
};

request.onsuccess = e => {
  db = e.target.result;

  // Homepage
  if (document.getElementById("branchSelect")) {
    initHomePage();
  }

  // Booking page
  if (document.getElementById("branchFrom")) {
    initBookingPage();
  }
};

request.onerror = e => console.error("IndexedDB error:", e);

// ================= HOMEPAGE =================
function initHomePage() {
  const selectBtn = document.querySelector(".select-btn");
  const branchSelect = document.getElementById("branchSelect");

  selectBtn.addEventListener("click", () => {
    if (!branchSelect.value) {
      alert("Please select a branch");
      return;
    }
    sessionStorage.setItem("selectedBranch", branchSelect.value);
    window.location.href = "booking.html";
  });
}

// ================= BOOKING =================
function initBookingPage() {
  const branch = sessionStorage.getItem("selectedBranch");
  const branchInput = document.getElementById("branchFrom");

  if (!branch) return alert("No branch selected");

  branchInput.value = branch;
  branchInput.readOnly = true;

  // Auto-generate IDs for inputs
  assignInputIDs();

  // Lock all other inputs by default
  lockForm();

  // Load saved data for this branch
  loadData(branch);

  // Setup buttons
  setupButtons(branch);

  // Enter navigation
  setupEnterNavigation();
}

// ================= AUTO-GENERATE IDS =================
function assignInputIDs() {
  const inputs = document.querySelectorAll(".booking-body input");
  inputs.forEach((input, index) => {
    if (!input.id) {
      if (input.id !== "branchFrom") input.id = "input_" + index;
    }
  });
}

// ================= LOCK / UNLOCK =================
function lockForm() {
  document.querySelectorAll(".booking-body input").forEach(input => {
    if (input.id !== "branchFrom") input.readOnly = true;
  });
}

function unlockForm() {
  document.querySelectorAll(".booking-body input").forEach(input => {
    if (input.id !== "branchFrom") input.readOnly = false;
  });
}

// ================= SAVE DATA =================
function saveData(branch) {
  const booking = {};

  document.querySelectorAll(".booking-body input").forEach(input => {
    if (input.id && input.id !== "branchFrom") {
      booking[input.id] = input.value;
    }
  });

  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  const getReq = store.get(branch);
  getReq.onsuccess = () => {
    let data = getReq.result || { branch, booking: {} };
    data.booking = booking;
    store.put(data);
  };

  tx.oncomplete = () => {
    lockForm();
    alert("Booking saved for " + branch);
  };
}

// ================= LOAD DATA =================
function loadData(branch) {
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const req = store.get(branch);

  req.onsuccess = () => {
    if (!req.result) return;
    const data = req.result.booking;
    Object.keys(data).forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = data[id];
    });
  };
}

// ================= RESET =================
function resetForm() {
  document.querySelectorAll(".booking-body input").forEach(input => {
    if (input.id !== "branchFrom" && !input.readOnly) input.value = "";
  });
}

// ================= BUTTONS =================
function setupButtons(branch) {
  document.getElementById("btnEdit").onclick = unlockForm;
  document.getElementById("btnSave").onclick = () => saveData(branch);
  document.getElementById("btnAdd").onclick = () => saveData(branch);
  document.getElementById("btnReset").onclick = resetForm;
  document.getElementById("btnPrint").onclick = () => window.print();
  document.getElementById("btnDelete").onclick = () => alert("Delete logic can be added");
  document.getElementById("btnPdf").onclick = () => alert("PDF logic can be added");
}

// ================= ENTER KEY NAVIGATION =================
function setupEnterNavigation() {
  const inputs = [...document.querySelectorAll(".booking-body input")];
  inputs.forEach((input, i) => {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        const next = inputs[i + 1];
        if (next) next.focus();
      }
    });
  });
}

// ================= DROPDOWNS =================
document.querySelectorAll(".drop-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    const menu = btn.nextElementSibling;
    document.querySelectorAll(".drop-menu").forEach(m => {
      if (m !== menu) m.style.display = "none";
    });
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".drop-menu").forEach(m => (m.style.display = "none"));
});
