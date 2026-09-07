function ok(res, data, meta = undefined, status = 200) {
  return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

function fail(res, status, message, errors = undefined) {
  return res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
}

module.exports = { ok, fail };
