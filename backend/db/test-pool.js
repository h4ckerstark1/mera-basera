const pool = require("./database");

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");
    console.log("✅ PostgreSQL Pool connected successfully!");
    console.log("🕒 Database time:", result.rows[0].current_time);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
