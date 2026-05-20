const http = require("http");
const fs = require("fs");
const path = require("path");

const distRoot = path.join(__dirname, "dist");
const root = fs.existsSync(distRoot) ? distRoot : __dirname;
const port = process.env.PORT || 3000;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return path.join(root, normalized === "/" ? "index.html" : normalized);
}

const server = http.createServer((req, res) => {
  let filePath = safePath(req.url || "/");

  fs.stat(filePath, (statError, stats) => {
    if (!statError && stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (readError, content) => {
      if (readError) {
        fs.readFile(path.join(root, "index.html"), (fallbackError, fallback) => {
          if (fallbackError) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Not found");
            return;
          }

          res.writeHead(200, { "Content-Type": types[".html"] });
          res.end(fallback);
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": types[ext] || "application/octet-stream",
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable"
      });
      res.end(content);
    });
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Fazanovaya Laguna site is running on port ${port}`);
});
