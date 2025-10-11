export default function errorHandler(err, req, res, _next) {
  console.error("[ERROR]", err);
  const status = err.status || err.statusCode || 500;
  const msg = err.message || "internal_error";
  res.status(status).json({ error: msg });
}
