require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.llscwyutuxmvpjyovwok",
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect()
  .then(() => {
    console.log("✅ Supabase PostgreSQL connected successfully!");
    return client.end();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:");
    console.error(err.message);
  });
