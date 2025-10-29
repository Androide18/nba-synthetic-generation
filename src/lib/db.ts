import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

// check the connection on app startup
/* (async () => {
  try {
    const res = await pool.query("SELECT 1");
    console.log("✅ Database connected:", res.rows[0]);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})(); */
