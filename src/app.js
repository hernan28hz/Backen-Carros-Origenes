const path = require("node:path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("./config/env");
const prisma = require("./config/prisma");
const errorMiddleware = require("./middlewares/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const vehiclesRoutes = require("./modules/vehicles/vehicles.routes");
const statusRoutes = require("./modules/status/status.routes");
const photosRoutes = require("./modules/photos/photos.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const catalogRoutes = require("./modules/catalog/catalog.routes");

const app = express();
const publicIndexPath = path.join(process.cwd(), "public", "index.html");
const publicStaticPath = path.join(process.cwd(), "public");
const uploadsStaticPath = path.join(process.cwd(), "uploads");

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
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use((_, res, next) => {
  setNoCacheHeaders(res);
  next();
});

app.use(
  express.static(publicStaticPath, {
    etag: false,
    lastModified: false,
    maxAge: 0,
    setHeaders: (res) => {
      setNoCacheHeaders(res);
      res.removeHeader("ETag");
      res.removeHeader("Last-Modified");
    },
  })
);
app.use(
  "/uploads",
  express.static(uploadsStaticPath, {
    etag: false,
    lastModified: false,
    maxAge: 0,
    setHeaders: (res) => {
      setNoCacheHeaders(res);
      res.removeHeader("ETag");
      res.removeHeader("Last-Modified");
    },
  })
);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    res.status(200).json({ status: "ok", database: "ok" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "error",
      message: error.message,
    });
  }
});

app.use("/catalog", catalogRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/vehicles", vehiclesRoutes);
app.use("/vehicles", statusRoutes);
app.use("/vehicles", photosRoutes);
app.use("/admin", adminRoutes);

app.get(
  ["/", "/login", "/catalogo", "/dashboard", "/perfil", "/vehiculo/:id", "/admin/vehiculos", "/admin/operadores", "/admin/mensajes"],
  (_req, res) => {
    setNoCacheHeaders(res);
    res.sendFile(publicIndexPath);
  }
);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use(errorMiddleware);

module.exports = app;
