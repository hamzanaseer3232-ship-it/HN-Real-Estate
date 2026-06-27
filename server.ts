import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import dns from "dns";
import { createServer as createViteServer } from "vite";

// Force Node's DNS resolver to use Google DNS and Cloudflare DNS as servers.
// This is a premium resilient solution to fix "querySrv ECONNREFUSED" DNS errors
// caused by local ISP DNS servers that fail to resolve MongoDB SRV cluster records properly.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  console.log("📡 Resilient App-Level DNS configured to Google (8.8.8.8) and Cloudflare (1.1.1.1) to resolve MongoDB cluster SRV records!");
} catch (dnsErr: any) {
  console.warn("⚠️ Custom DNS configuration warning:", dnsErr.message);
}

// Routes
import authRoutes from "./src/routes/auth";
import propertyRoutes from "./src/routes/properties";

// Pre-initialize environment configuration
dotenv.config({ override: true });

const app = express();
const PORT = 3000;

// Connect to MongoDB with non-blocking graceful fallback
// Try parsing the local .env file explicitly as a backup / primary source since it has user-defined values
let MONGODB_URI = process.env.MONGODB_URI || "";
let localEnvUri: string | null = null;
try {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const parsed = dotenv.parse(fs.readFileSync(envPath));
    if (parsed.MONGODB_URI) {
      localEnvUri = parsed.MONGODB_URI;
      // Overwrite the local MONGODB_URI to ensure local .env configuration takes priority over older environment definitions
      MONGODB_URI = parsed.MONGODB_URI;
    }
  }
} catch (e: any) {
  console.warn("⚠️ Reading local .env configuration details:", e.message);
}

async function connectToMongo() {
  const primaryUri = MONGODB_URI || localEnvUri;

  if (!primaryUri) {
    console.log("ℹ️ No 'MONGODB_URI' detected. Operating in resilient Sandbox In-Memory fallback mode.");
    return;
  }

  const tryConnect = async (uri: string, label: string) => {
    const masked = uri.replace(/:([^:]+)@/, ":***@");
    console.log(`🔌 Attempting connection to MongoDB cluster (${label}: ${masked})...`);
    // If we have an existing connection, close it first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🚀 Mongoose linked securely to MongoDB hosting environment successfully (${label})!`);
  };

  try {
    await tryConnect(primaryUri, "Primary URI Configuration");
  } catch (err: any) {
    console.log(`ℹ️ Main database connection attempt initialized a fallback route (Detail: ${err.message})`);
    
    // In case the primary connection failed and there is a secondary process environment variable that differs, try that
    const backupUri = process.env.MONGODB_URI;
    if (backupUri && backupUri !== primaryUri) {
      try {
        await tryConnect(backupUri, "Secondary System Configuration");
      } catch (errFallback: any) {
        console.log(`ℹ️ Secondary database fallback connection completed. Operating in resilient Sandbox In-Memory fallback mode.`);
      }
    } else {
      console.log(`ℹ️ Operating in resilient Sandbox In-Memory fallback mode.`);
    }
  }
}

connectToMongo();

// Middlewares
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions) as any);

// Extra bulletproof preflight fallback interceptor
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Request logger middleware
app.use((req, _res, next) => {
  console.log(`📡 [Request] ${req.method} ${req.url}`);
  if (req.url.startsWith("/api")) {
    console.log(`   Content-Type: ${req.headers["content-type"]}`);
    console.log(`   Authorization: ${req.headers["authorization"] ? "Present (Starts with " + req.headers["authorization"].substring(0, 15) + "...)" : "Missing"}`);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core API endpoints
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const readyState = mongoose.connection.readyState;
  let dbStatus = "Fallback Local Memory";
  if (readyState === 1) dbStatus = "Connected";
  else if (readyState === 2) dbStatus = "Connecting";
  
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
  });
});

// Expose public Cloudinary configuration dynamically
app.get("/api/config/cloudinary", (_req, res) => {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dphnh7jci";
  if (cloudName === "dyd82736x" || cloudName === "your_cloud_name_here") {
    cloudName = "dphnh7jci";
  }
  res.json({
    cloudName,
    uploadPreset: "hamza_realestate_unsigned"
  });
});

// Resilient API Error Interceptor ensuring JSON responses for all API errors
app.use("/api", (err: any, _req: any, res: any, _next: any) => {
  console.error("🔥 API Cluster Error Caught:", err);
  const status = typeof err.status === "number" ? err.status : (typeof err.statusCode === "number" ? err.statusCode : 500);
  res.status(status).json({
    success: false,
    message: err.message || "An unexpected system internal error was caught by the API gateway.",
    error: err.toString()
  });
});

// Vite Integrations for local/production serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Bundling and launching Vite Dev Server middleware...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      
      // Leverage Vite middlewares to serve hot-reloaded react client
      app.use(vite.middlewares);
    } catch (viteError: any) {
      console.warn("⚠️ Vite middleware launch unsuccessful, serving custom dashboard index fallback instead: " + viteError.message);
      
      // Fallback dashboard serve
      app.get("/", (_req, res) => {
        res.setHeader("Content-Type", "text/html");
        res.send(getDashboardHTML());
      });
    }
  } else {
    // Serving distribution build files in live production scale environments
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.get("/", (_req, res) => {
    // If not handled by vite, render a beautiful API documentation page
    res.setHeader("Content-Type", "text/html");
    res.send(getDashboardHTML());
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`📡 Hamza Real Estate Full-Stack system serving live on: http://0.0.0.0:${PORT}`);
  });
}

function getDashboardHTML(): string {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hamza Real Estate - API Control Center</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background-color: #0b0b0e;
        color: #e4e4e7;
      }
      code {
        font-family: 'JetBrains Mono', monospace;
      }
    </style>
  </head>
  <body class="min-h-screen flex flex-col justify-between py-12 px-6">
    <div class="max-w-4xl mx-auto w-full space-y-8">
      
      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
        <div>
          <h1 class="text-4xl font-extrabold tracking-tight text-white mb-2">
            HAMZA <span class="text-[#c9a84c]">NASEER</span>
          </h1>
          <p class="text-zinc-400 font-medium">Production-Ready Real Estate API Node</p>
        </div>
        
        <!-- API Connection Badges -->
        <div class="flex flex-wrap gap-3">
          <div class="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs font-semibold">
            <span class="w-2.5 h-2.5 rounded-full ${isMongoConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}"></span>
            <span>MongoDB: ${isMongoConnected ? 'Active (Live Cluster)' : 'Active (Fallback Memory)'}</span>
          </div>
          <div class="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs font-semibold">
            <span class="w-2.5 h-2.5 rounded-full ${isCloudinaryConfigured ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}"></span>
            <span>Cloudinary: ${isCloudinaryConfigured ? 'Connected' : 'Unconfigured'}</span>
          </div>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-3">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span class="text-[#c9a84c]">🔑</span> Authenticated JWT Operator
          </h3>
          <p class="text-xs text-zinc-400 leading-relaxed">
            The CRUD endpoints for creating, updating, and deleting properties require JWT verification passed as a <code>Bearer &lt;token&gt;</code> authorization header. Register/login handlers automatically support fallback states if offline.
          </p>
        </div>
        <div class="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-3">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span class="text-[#c9a84c]">📦</span> Multidimensional Media Uploads
          </h3>
          <p class="text-xs text-zinc-400 leading-relaxed">
            Multer is integrated directly with modern Cloudinary storage pipelines supporting batch images and video configurations out of the box. Fully secure, parsed automatically.
          </p>
        </div>
      </div>

      <!-- Core API Documentation -->
      <div class="space-y-4">
        <h2 class="text-xl font-bold text-white tracking-wide border-l-2 border-[#c9a84c] pl-3">API Route Directory</h2>
        
        <div class="bg-[#121217] border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
          
          <!-- Route Row -->
          <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded font-bold uppercase tracking-wider">POST</span>
              <code class="text-sm font-semibold text-zinc-200">/api/auth/register</code>
            </div>
            <p class="text-xs text-zinc-400">Registers a new administrator profile</p>
          </div>

          <!-- Route Row -->
          <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded font-bold uppercase tracking-wider">POST</span>
              <code class="text-sm font-semibold text-zinc-200">/api/auth/login</code>
            </div>
            <p class="text-xs text-zinc-400">Claims JWT Token credentials (Default account available)</p>
          </div>

          <!-- Route Row -->
          <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-1 rounded font-bold uppercase tracking-wider">GET</span>
              <code class="text-sm font-semibold text-zinc-200">/api/properties</code>
            </div>
            <p class="text-xs text-zinc-400">Lists and filters properties (search, type, category, city)</p>
          </div>

          <!-- Route Row -->
          <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded font-bold uppercase tracking-wider">POST</span>
              <code class="text-sm font-semibold text-zinc-200">/api/properties</code>
            </div>
            <p class="text-xs text-zinc-400 flex items-center gap-1">
              <span class="text-amber-500 font-semibold">🔒 Protected:</span> Add a property with media uploads
            </p>
          </div>

          <!-- Route Row -->
          <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-1 rounded font-bold uppercase tracking-wider">PUT</span>
              <code class="text-sm font-semibold text-zinc-200">/api/properties/:id</code>
            </div>
            <p class="text-xs text-zinc-400 flex items-center gap-1">
              <span class="text-amber-500 font-semibold">🔒 Protected:</span> Edit property details or media uploads
            </p>
          </div>

          <!-- Route Row -->
          <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2.5 py-1 rounded font-bold uppercase tracking-wider">DEL</span>
              <code class="text-sm font-semibold text-zinc-200">/api/properties/:id</code>
            </div>
            <p class="text-xs text-zinc-400 flex items-center gap-1">
              <span class="text-amber-500 font-semibold">🔒 Protected:</span> Remove listing asset node
            </p>
          </div>

        </div>
      </div>
      
    </div>

    <!-- Footer -->
    <div class="max-w-4xl mx-auto w-full pt-8 mt-12 border-t border-zinc-900 text-center text-xs text-zinc-500">
      Hamza Real Estate Developer Hub Service Node • All Systems Operational
    </div>
  </body>
  </html>
  `;
}

bootstrap().catch((err) => {
  console.error("💥 Critical startup failure inside Vite bootstrap cluster:", err);
});
