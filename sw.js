const CACHE_NAME = "todo-cache-v1";
const STATIC_ASSETS = ["./", "./index.html", "./app.js"];

// Cài đặt SW và cache các file tĩnh
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Fetch: ưu tiên online, fallback cache nếu offline
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Background Sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    event.waitUntil(
      (async () => {
        console.log("📡 Đồng bộ tasks với server...");

        // Giả lập delay 1s (ở thực tế bạn sẽ gọi API server tại đây)
        await new Promise((res) => setTimeout(res, 1000));

        // Gửi thông báo về client để cập nhật localStorage
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "SYNC_DONE",
              msg: "✅ Nhiệm vụ đã được đồng bộ thành công!"
            });
          });
        });
      })()
    );
  }
});

// Push Notification
self.addEventListener("push", event => {
  const data = event.data ? event.data.text() : "🔔 Bạn có công việc mới!";
  event.waitUntil(
    self.registration.showNotification("To-Do Reminder", {
      body: data,
      icon: "https://cdn-icons-png.flaticon.com/512/992/992651.png"
    })
  );
});
