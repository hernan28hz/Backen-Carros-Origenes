const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const prisma = require("./config/prisma");
const errorMiddleware = require("./middlewares/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const vehiclesRoutes = require("./modules/vehicles/vehicles.routes");
const statusRoutes = require("./modules/status/status.routes");
const photosRoutes = require("./modules/photos/photos.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const catalogRoutes = require("./modules/catalog/catalog.routes");
const imagesRoutes = require("./modules/images/images.routes");
const financeRoutes = require("./modules/finance/finance.routes");

const app = express();
const projectRootPath = path.resolve(__dirname, "..");
const publicStaticPath = resolveExistingPath(
  process.env.PUBLIC_STATIC_DIR && path.resolve(projectRootPath, process.env.PUBLIC_STATIC_DIR),
  path.join(projectRootPath, "public"),
  path.join(projectRootPath, "public_html")
);
const publicIndexPath = publicStaticPath ? path.join(publicStaticPath, "index.html") : null;
const uploadsStaticPath = path.join(projectRootPath, "uploads");

function resolveExistingPath(...paths) {
  return paths.find((candidatePath) => candidatePath && fs.existsSync(candidatePath)) || null;
}

const setNoCacheHeaders = (res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
};

app.use(helmet());
app.use(cors());
if (env.nodeEnv !== "production" || process.env.HTTP_LOGS === "true") {
  app.use(morgan(env.nodeEnv === "production" ? "tiny" : "dev"));
}
app.use(compression());
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));

app.use(
  express.static(publicStaticPath || path.join(projectRootPath, "public"), {
    etag: true,
    immutable: true,
    lastModified: true,
    maxAge: "30d",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        setNoCacheHeaders(res);
      }
    },
  })
);
app.use("/images", imagesRoutes);
app.use(
  "/uploads",
  express.static(uploadsStaticPath, {
    etag: true,
    immutable: true,
    lastModified: true,
    maxAge: "30d",
  })
);

app.use((_, res, next) => {
  setNoCacheHeaders(res);
  next();
});

app.get("/health", async (req, res) => {
  if (req.query.database !== "1") {
    res.status(200).json({ status: "ok" });
    return;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", database: "ok" });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Database health check failed:", error);
    res.status(503).json({ status: "ok", database: "error" });
  }
});

app.use("/catalog", catalogRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/vehicles", vehiclesRoutes);
app.use("/vehicles", statusRoutes);
app.use("/vehicles", photosRoutes);
app.use("/admin", adminRoutes);
app.use("/finance", financeRoutes);

app.get(
  [
    "/",
    "/login",
    "/catalogo",
    "/dashboard",
    "/perfil",
    "/vehiculo/:id",
    "/admin/vehiculos",
    "/admin/operadores",
    "/admin/mensajes",
    "/finanzas",
  ],
  (_req, res) => {
    setNoCacheHeaders(res);
    if (!publicIndexPath || !fs.existsSync(publicIndexPath)) {
      res.status(500).type("text/plain").send(
        "No se encontro public/index.html. Sube la carpeta public completa junto a package.json, o configura PUBLIC_STATIC_DIR si usas otra carpeta."
      );
      return;
    }

    res.sendFile(publicIndexPath);
  }
);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use(errorMiddleware);

module.exports = app;
