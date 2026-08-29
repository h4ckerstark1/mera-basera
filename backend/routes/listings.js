const express = require("express");
const pool = require("../db/database");

const router = express.Router();

// GET /api/listings
router.get("/", async (req, res) => {
  try {
    const { collage, budget, type, verified } = req.query;

    const conditions = [];
    const values = [];

    if (collage) {
      values.push(`%${collage}%`);
      conditions.push(`collage ILIKE $${values.length}`);
    }

    if (budget) {
      const budgetNumber = Number(budget);

      if (Number.isNaN(budgetNumber)) {
        return res.status(400).json({
          error: "budget must be a number",
        });
      }

      values.push(budgetNumber);
      conditions.push(`rent <= $${values.length}`);
    }

    if (type) {
      values.push(type);
      conditions.push(`room_type = $${values.length}`);
    }

    if (verified !== undefined) {
      if (verified !== "true" && verified !== "false") {
        return res.status(400).json({
          error: "verified must be true or false",
        });
      }

      values.push(verified === "true");
      conditions.push(`verified = $${values.length}`);
    }

    let query = `
      SELECT
        id,
        created_at,
        name,
        collage,
        city,
        room_type,
        rent,
        distance_km,
        amenities,
        phone,
        verified,
        photo_url,
        is_premium
      FROM listings
    `;

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/listings error:", error.message);

    res.status(500).json({
      error: "Failed to fetch listings",
    });
  }
});


// GET /api/listings/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Listing id must be a number",
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        created_at,
        name,
        collage,
        city,
        room_type,
        rent,
        distance_km,
        amenities,
        phone,
        verified,
        photo_url,
        is_premium
       FROM listings
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Listing not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("GET /api/listings/:id error:", error.message);

    res.status(500).json({
      error: "Failed to fetch listing",
    });
  }
});


// POST /api/listings
router.post("/", async (req, res) => {
  try {
    const {
      name,
      collage,
      city,
      room_type,
      rent,
      distance_km,
      amenities,
      phone,
      verified,
      photo_url,
      is_premium,
    } = req.body;

    const requiredFields = {
      name,
      collage,
      city,
      room_type,
      rent,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        fields: missingFields,
      });
    }

    const result = await pool.query(
      `INSERT INTO listings
        (name, collage, city, room_type, rent, distance_km, amenities,
         phone, verified, photo_url, is_premium)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name,
        collage,
        city,
        room_type,
        rent,
        distance_km ?? null,
        amenities ?? null,
        phone ?? null,
        verified ?? false,
        photo_url ?? null,
        is_premium ?? false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST /api/listings error:", error.message);

    res.status(500).json({
      error: "Failed to create listing",
    });
  }
});


// PUT /api/listings/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Listing id must be a number",
      });
    }

    const {
      name,
      collage,
      city,
      room_type,
      rent,
      distance_km,
      amenities,
      phone,
      verified,
      photo_url,
      is_premium,
    } = req.body;

    const result = await pool.query(
      `UPDATE listings
       SET
         name = COALESCE($1, name),
         collage = COALESCE($2, collage),
         city = COALESCE($3, city),
         room_type = COALESCE($4, room_type),
         rent = COALESCE($5, rent),
         distance_km = COALESCE($6, distance_km),
         amenities = COALESCE($7, amenities),
         phone = COALESCE($8, phone),
         verified = COALESCE($9, verified),
         photo_url = COALESCE($10, photo_url),
         is_premium = COALESCE($11, is_premium)
       WHERE id = $12
       RETURNING *`,
      [
        name,
        collage,
        city,
        room_type,
        rent,
        distance_km,
        amenities,
        phone,
        verified,
        photo_url,
        is_premium,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Listing not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("PUT /api/listings/:id error:", error.message);

    res.status(500).json({
      error: "Failed to update listing",
    });
  }
});


// DELETE /api/listings/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Listing id must be a number",
      });
    }

    const result = await pool.query(
      `DELETE FROM listings
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Listing not found",
      });
    }

    res.json({
      success: true,
      deleted_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("DELETE /api/listings/:id error:", error.message);

    res.status(500).json({
      error: "Failed to delete listing",
    });
  }
});

module.exports = router;
