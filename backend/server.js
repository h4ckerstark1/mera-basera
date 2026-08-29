const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const listingsRouter = require("./routes/listings");

app.use(cors());
app.use(express.json());

app.use("/api/listings", listingsRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Mera Basera Backend is running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
