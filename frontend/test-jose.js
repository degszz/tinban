// Test de importación de jose
import { SignJWT } from "jose";

console.log("✅ Jose importado correctamente");

const testJWT = async () => {
  const secret = new TextEncoder().encode("test-secret-key");
  const token = await new SignJWT({ test: true })
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);
  console.log("✅ JWT creado:", token.substring(0, 20) + "...");
};

testJWT().catch(console.error);
