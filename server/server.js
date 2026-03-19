// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerSiteDocument = YAML.load(
  path.join(__dirname, "docs", "swagger.yaml")
);

const app = express();

// ==============================
// MIDDLEWARE
// ==============================

// CORS
app.use(cors());

// JSON (для обычных API)
app.use(express.json({ limit: "2mb" }));

// 🔥 ВАЖНО для Comgate callback
// Comgate шлёт application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// ==============================
// ROUTES
// ==============================

app.use("/api", routes);

// ==============================
// SWAGGER
// ==============================

app.use(
  "/api/docs",
  swaggerUi.serveFiles(swaggerSiteDocument),
  swaggerUi.setup(swaggerSiteDocument, { explorer: true })
);

// ==============================
// HEALTHCHECK
// ==============================

app.get("/health", (req, res) => res.json({ ok: true }));

// ==============================
// CONFIG
// ==============================

const PORT = process.env.PORT || 5001;

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://powerprodistributor_db_user:h1PbSaQwsLYwFFsZ@cluster0.31z2fg2.mongodb.net/?appName=Cluster0";

// ==============================
// START SERVER
// ==============================

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
      console.log(`❤️ Healthcheck: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err?.message || err);
    process.exit(1);
  }
}

start();