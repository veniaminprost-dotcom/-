const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const entries = [
  "index.html",
  "404.html",
  "houses.html",
  "zhilye-u-morya-yeisk.html",
  "arenda-doma-yeisk.html",
  "banya-basseyn-yeisk.html",
  "gallery.html",
  "services.html",
  "story.html",
  "booking.html",
  "contacts.html",
  "robots.txt",
  "sitemap.xml",
  "850FD850-E66A-4135-B4F5-2A432975B7C6.txt",
  "yandex_b60eebb59cfc654a.html",
  "yandex_a1ac8ec7381b7128.html",
  "assets"
];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) {
    continue;
  }

  fs.cpSync(source, path.join(dist, entry), { recursive: true });
}

console.log("Static site built to dist");
