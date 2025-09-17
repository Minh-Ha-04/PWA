const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Tạo VAPID keys (chạy 1 lần để lấy key thật)
const vapidKeys = webpush.generateVAPIDKeys();
console.log("Public Key:", vapidKeys.publicKey);
console.log("Private Key:", vapidKeys.privateKey);

webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let subscriptions = [];

app.post("/subscribe", (req, res) => {
  subscriptions.push(req.body);
  res.status(201).json({});
});

app.get("/send", (req, res) => {
  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, "Bạn có công việc chưa hoàn thành!")
      .catch(err => console.error(err));
  });
  res.send("✅ Push sent");
});

app.listen(4000, () => console.log("Server chạy tại http://localhost:4000"));
