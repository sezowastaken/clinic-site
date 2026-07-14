function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.API_PORT) || 3000,
  databaseUrl: required("DATABASE_URL"),
  sessionCookieName: process.env.SESSION_COOKIE_NAME || "clinic_admin_session",
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS) || 14,
};
