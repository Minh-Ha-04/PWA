let swReg;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Đăng ký Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then((reg) => {
    swReg = reg;
    console.log("Service Worker registered");
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data.type === "SYNC_DONE") {
      syncPendingTasks(); // đồng bộ các task pending thôi
      alert(event.data.msg);
    }
  });
}

// DOM
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");

// Render tasks
function renderTasks() {
  list.innerHTML = "";
  tasks.forEach((task, idx) => {
    const li = document.createElement("li");
    li.textContent = task.text;

    const status = document.createElement("span");
    status.classList.add("status", task.synced ? "synced" : "pending");
    status.textContent = task.synced ? "✓ synced" : "pending";

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.style.marginLeft = "10px";
    delBtn.onclick = () => {
      tasks.splice(idx, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    };

    li.appendChild(status);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}
renderTasks();

// Hàm đồng bộ chỉ những task pending
function syncPendingTasks() {
  if (tasks.some(t => !t.synced)) {
    tasks = tasks.map(t => t.synced ? t : { ...t, synced: true });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    console.log("🔄 Các task pending đã được đồng bộ.");
  }
}

// Khi load lại trang, nếu online thì auto đồng bộ
window.addEventListener("load", () => {
  if (navigator.onLine) {
    syncPendingTasks();
  }
});

// Thêm công việc
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let newTask = { text: input.value.trim(), synced: false };

  if (navigator.onLine) {
    newTask.synced = true;
    alert("✅ Task đã được đồng bộ trực tiếp!");
  } else {
    if (swReg && "SyncManager" in window) {
      await swReg.sync.register("sync-tasks");
      alert("📌 Task đang chờ đồng bộ khi có mạng!");
    }
  }

  tasks.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  input.value = "";

  if (navigator.onLine) {
    syncPendingTasks(); // chỉ đồng bộ task mới pending thôi
  }
});
