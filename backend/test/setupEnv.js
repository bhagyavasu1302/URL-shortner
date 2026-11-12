process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortner_test";
process.env.JWT_SECRET = "test-secret-with-more-than-thirty-two-characters";
process.env.JWT_EXPIRES_IN = "15m";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.PUBLIC_SHORT_URL_BASE = "https://links.example";
process.env.TRUST_PROXY = "false";
