export default function errorHandler(err, req, res, _next) {
  // log đầy đủ để xem trên CloudWatch
  console.error(
    "[ERR]",
    err.name || "Error",
    err.message,
    { path: req.method + " " + req.originalUrl, stack: err.stack }
  );
  const code = err.status || err.statusCode || 500;
  res.status(code).json({ error: err.name || "Error", message: err.message });
}
