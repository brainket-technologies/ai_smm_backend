require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const firebaseConfig = {
    type: "service_account",
    projectId: "fir-notes-20c44",
    privateKeyId: "5e0bc7b5b0ff45176f5694bb1b3fe2e4763c72e3",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDM5MenOEnJ3mRU\noL7H36Yhh8GA+Cn8rcS6wKg3iUX+qfY6WFQ4nAHX2XqHiUMv5JgyRLXe4ah62nZ9\n22NUrIluIeRBEs48gHL56PKqGA6UurV2tpLlInR+F/3VQ7KNgAbJAJrhVa++rIf3\nUFZkngFT6ruon4L3fmdbIgh52W1Lsc8lr6WM7ZSAwYi+ILOyZ60sKe+f+EDKVvxK\nIp6y/Cb6ZTI82l66nwBo+Fh2pRnj1jgTFGnxA8k2BM4J5CtOc0QKvp4e+gO/aAS9\naDesjRWPl+anfa+IQW1vA4qMhyvH0e2qqNXBKJdhaJQph3oMWM+886g9lJHn/NdI\n3vc2HmDzAgMBAAECggEAQIB/R+nE9PuBe1DVboe+PY0GwkqdsTGlHqOa8UzST68C\n2HBJJz8Zp3GMDNIN6CxfK2gNFzrT9sUCi3F+7j+YziZ2PHQmn85SI9GNXzXOlUzH\n5rToPqEfqjh0TOiQc9JLkIiTuX9noa+f6CAO6oMBaQEbDaUVrkNJV1u57l4f9bVW\niRqDM5nJlm/Z8R7PyROnuU4DkRki+nxdD8qqWtV8lw3IEd4/ZHqk7GRUciZJz40n\namSVgslLlJoq/wdxg5WeU2AQ1AqPUFFHe8zm8tv4PRT+0yijwOAjjNYBKZikQXLc\nJNoEVt9qlk98exjUQO5cvwvRGpPug6k9wGWlHp8BhQKBgQDohYqkO2sE/NYsD+40\nkrtrfpSaZcvzBDTV3XEIhDDtIJ6UItcJvcs/JhXWs2iW+uJaa1u6EQdbKa5b55WS\nTzaKZAr9OF+uOLet5GK7V66KYkk9ZAF8RzcvR0B6QRs+MK+pPYONlbtADrTDMhYO\nJLyt8xF0Ft0bmS2U3TDjP/w51QKBgQDhlRUAP/icKA/pc7OpOE9jyFOHDqYTuHrp\nYWY/lf0boUbS6lFwPUsndgc+T9ZMmempFlJwN1rLxMhbspDNFhqY99DEROHAV/7d\n+N/t23GOD64E+hwRlY29Xu2eHO4ykQV5DzHi45SVI1CFrCowFN4N+uOZCAMYYfu7\nR/VB6XaLpwKBgBEWPynyc9rZ+aMjSI30enFby+/Mq0AgfwF4VGYb0LycOQsJxGOi\n3ty1H8W3SWhO53NdkFAMEE5Ssc1vJz6pM4jX8TbKfb1/zX+p2NeLifgBYQBx6OoJ\nEbUXt1VEk4vuZ/o32wL8jdYXPpFZjOVdLcBarF2rkHQGvaLC3mTUvuRBAoGBALH0\nXaDY1lK59/N+Ztizp01cFyiQEcu02KGLSJIYzJcjXy+70Yrtj4ANyCEL8k5zjLTq\n+xWzVVkyX6yW7Uwch9bsiDCM9lo6EMEjN+P4HVioXetnMwVcKXiejm0Q/Ye+h8a8\nieonBmuwdDE/Y/iSPaphpXJvs6FkiqVvWrcoaXA5AoGBALfoex1XAsf0k3W2l0hN\n69NQOs6oIpz/1VS36/93EZg3fW3p6iK/zKSuDbGD428uk3uIFrvB8OLUKx8mfx7Z\nwle0WDN3+LNOK/I3FMoGQImkeiv2/+WTb7SjCRygxAI74byEtlUAbXfkYqOyCfUv\nxH3sSK55tfqRH6Du1FnFgKwn\n-----END PRIVATE KEY-----\n",
    clientEmail: "firebase-adminsdk-lkmsq@fir-notes-20c44.iam.gserviceaccount.com",
    clientId: "116512367569565630555",
    authUri: "https://accounts.google.com/o/oauth2/auth",
    tokenUri: "https://oauth2.googleapis.com/token",
    authProviderX509CertUrl: "https://www.googleapis.com/v1/certs",
    clientX509CertUrl: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-lkmsq%40fir-notes-20c44.iam.gserviceaccount.com",
    universeDomain: "googleapis.com"
  };

  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO external_service_configs (category, provider, config, is_active, is_default, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (category, provider)
      DO UPDATE SET config = $3, is_active = $4, updated_at = NOW();
    `;
    await client.query(query, ['notifications', 'firebase', JSON.stringify(firebaseConfig), true, true]);
    console.log('✅ Firebase configuration updated successfully using pg.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
