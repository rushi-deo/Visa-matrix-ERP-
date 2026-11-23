// Isolated placeholders let tests import configuration without reading or
// printing project credentials. Tests never connect to Supabase.
process.env.NODE_ENV = "test";
process.env.SUPABASE_URL = "http://127.0.0.1:9";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-placeholder";
process.env.JWT_SECRET = "test-jwt-secret-placeholder";
process.env.NEXUS_INTERNAL_TOKEN = "test-nexus-internal-token";
