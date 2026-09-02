const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://llscwyutuxmvpjyovwok.supabase.co";
const SUPABASE_KEY = "sb_publishable_jBmd_ppVJDAlO4ICCfwptQ_GZeTSLb6";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or invalid Authorization header"
    });
  }

  const token = header.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({
      error: "Invalid or expired session"
    });
  }

  req.user = data.user;
  next();
}

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    const token = header.split(" ")[1];
    const { data } = await supabase.auth.getUser(token);

    if (data && data.user) {
      req.user = data.user;
    }
  }

  next();
}

module.exports = { requireAuth, optionalAuth };
