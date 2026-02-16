// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";
import path from 'path';
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerSiteDocument = YAML.load(path.join(__dirname, "docs", "swagger.yaml"));

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api", routes);

// healthcheck

app.use(
  "/api/docs",
  swaggerUi.serveFiles(swaggerSiteDocument),
  swaggerUi.setup(swaggerSiteDocument, { explorer: true })
);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5001;

// ✅ лучше хранить в .env (MONGO_URI)
// но оставляю fallback как ты попросил
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err?.message || err);
    process.exit(1);
  }
}

start();
