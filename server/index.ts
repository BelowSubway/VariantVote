import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scanImageFolder, type ImageRegistry } from "./imageScanner";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const registry: ImageRegistry = new Map();

app.use(cors({ origin: "http://127.0.0.1:5173" }));
app.use(express.json({ limit: "1mb" }));

app.post("/api/scan", async (request, response) => {
  const folderPath = typeof request.body?.folderPath === "string" ? request.body.folderPath.trim() : "";
  if (!folderPath) {
    response.status(400).json({ error: "Bitte gib einen Ordnerpfad an." });
    return;
  }

  try {
    const result = await scanImageFolder(folderPath, registry);
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Der Ordner konnte nicht gelesen werden.";
    response.status(400).json({ error: message });
  }
});

app.get("/api/images/:imageId", (request, response) => {
  const imageId = request.params.imageId;
  const imagePath = registry.get(imageId);
  if (!imagePath) {
    response.status(404).send("Bild nicht gefunden.");
    return;
  }

  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");
  response.sendFile(imagePath);
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.resolve(__dirname, "../dist");

app.use(express.static(staticDir));
app.get("*", (_request, response) => {
  response.sendFile(path.join(staticDir, "index.html"));
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Backend laeuft auf http://127.0.0.1:${port}`);
});
