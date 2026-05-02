"use strict";

const path        = require("path");
const express     = require("express");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const hpp         = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");

const helmetMiddleware    = require("./middleware/helmet.middleware");
const corsMiddleware      = require("./middleware/cors.middleware");
const sanitizeMiddleware  = require("./middleware/sanitize.middleware");
const { sanitizeInputs }  = require("./middleware/input-validation.middleware");
const requestLogger       = require("./middleware/request-logger.middleware");
const auditLog            = require("./middleware/audit-log.middleware");
const timeout             = require("./middleware/timeout.middleware");
const { jsonParser, urlencodedParser } = require("./middleware/body-parser.middleware");
const errorHandler        = require("./middleware/error-handler");
const { globalLimiter }   = require("./middleware/rate-limit.middleware");

const app = express();

app.use(helmetMiddleware);
app.use(compression());
app.use(hpp());
app.use(cookieParser());
app.use(corsMiddleware);
app.use(timeout(30000));

if (process.env.NODE_ENV !== "test") app.use(requestLogger);

app.use(jsonParser);
app.use(urlencodedParser);
app.use(globalLimiter);

// Skip sanitization for the intentionally vulnerable demo endpoint
app.use((req, res, next) => {
  if (req.path === "/api/auth/login-vulnerable") return next();
  sanitizeMiddleware(req, res, next);
});

app.use((req, res, next) => {
  if (req.path === "/api/auth/login-vulnerable") return next();
  mongoSanitize({ replaceWith: "_" })(req, res, next);
});

app.use(sanitizeInputs);
app.use(auditLog);

// ── Static uploads — serve uploaded PDFs/images ─────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
  maxAge: "7d",
  etag: true,
}));

// ── Routes ──────────────────────────────────────────────────────
app.use("/api/auth",          require("./routes/auth.routes"));
app.use("/api/stats",         require("./routes/stats.routes"));
app.use("/api/views",         require("./routes/views.routes"));
app.use("/api/locks",         require("./routes/locks.routes"));
app.use("/api/patients",      require("./routes/patients.routes"));
app.use("/api/doctors",       require("./routes/doctors.routes"));
app.use("/api/appointments",  require("./routes/appointments.routes"));
app.use("/api/records",       require("./routes/records.routes"));
app.use("/api/staff",         require("./routes/staff.routes"));
app.use("/api/departments",   require("./routes/departments.routes"));
app.use("/api/rooms",         require("./routes/rooms.routes"));
app.use("/api/services",      require("./routes/services.routes"));
app.use("/api/bills",         require("./routes/bills.routes"));
app.use("/api/inventory",     require("./routes/inventory.routes"));
app.use("/api/prescriptions", require("./routes/prescriptions.routes"));
app.use("/api/lab-results",   require("./routes/lab-results.routes"));
app.use("/api/insurance",     require("./routes/insurance.routes"));
app.use("/api/suppliers",  require("./routes/suppliers.routes"));
app.use("/api/chat",       require("./routes/chat.routes"));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok", env: process.env.NODE_ENV }));

app.use((_req, res) => res.status(404).json({ error: "Not Found" }));
app.use(require("./middleware/conflict-handler.middleware"));
app.use(errorHandler);

module.exports = app;
