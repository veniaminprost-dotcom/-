const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const entries = [
  "index.html",
  "houses.html",
  "gallery.html",
  "services.html",
  "story.html",
  "booking.html",
  "contacts.html",
  "robots.txt",
  "sitemap.xml",
  "850FD850-E66A-4135-B4F5-2A432975B7C6.txt",
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
