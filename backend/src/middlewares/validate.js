// validator siêu nhẹ (string/number/optional "?")
function _check(shape, obj, source) {
  for (const [k, type] of Object.entries(shape)) {
    const optional = type.endsWith("?");
    const base = optional ? type.slice(0, -1) : type;
    const val = obj[k];
    if (val === undefined || val === null) {
      if (optional) continue;
      throw Object.assign(new Error(`${source}.${k} is required`), { status: 400 });
    }
    if (base === "string" && typeof val !== "string")
      throw Object.assign(new Error(`${source}.${k} must be string`), { status: 400 });
    if (base === "number" && typeof val !== "number")
      throw Object.assign(new Error(`${source}.${k} must be number`), { status: 400 });
  }
}

export const validateBody = (shape) => (req, _res, next) => {
  try {
    _check(shape, req.body || {}, "body");
    next();
  } catch (e) { next(e); }
};

export const validateQuery = (shape) => (req, _res, next) => {
  try {
    const q = { ...req.query };
    // ép kiểu number đơn giản
    for (const [k, t] of Object.entries(shape)) {
      if (t.startsWith("number") && q[k] !== undefined) q[k] = Number(q[k]);
    }
    _check(shape, q, "query");
    // gán lại để controller dùng số đã ép
    Object.assign(req.query, q);
    next();
  } catch (e) { next(e); }
};
