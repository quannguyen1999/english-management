export const BACKEND_API = process.env.BACKEND_API || "http://localhost:9000";
export const USER_API = `${BACKEND_API}/user-service`;
export const CLIENT_ID = process.env.CLIENT_ID || "admin";
export const CLIENT_SECRET = process.env.CLIENT_SECRET || "password";
export const GRANT_TYPE = process.env.GRANT_TYPE || "custom_password";
