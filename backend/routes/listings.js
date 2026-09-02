const express = require("express");
const pool = require("../db/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/listings — public
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
        return res.status(400).json({ error: "budget must be a number" });
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
          error: "verified must be true or false"
        });
      }

      values.push(verified === "true");
      conditions.push(`verified = $${values.length}`);
    }

    let query = `
      SELECT id, created_at, name, collage, city, room_type, rent, distance_km,
             amenities, phone, verified, photo_url, is_premium
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
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// GET /api/listings/mine
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, created_at, name, collage, city, room_type, rent,
              distance_km, amenities, phone, verified, photo_url,
              is_premium, owner_id
       FROM listings
       WHERE owner_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("GET /api/listings/mine error:", error.message);
    res.status(500).json({ error: "Failed to fetch your listings" });
  }
});

// GET /api/listings/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Listing id must be a number"
      });
    }

    const result = await pool.query(
      `SELECT id, created_at, name, collage, city, room_type, rent,
              distance_km, amenities, phone, verified, photo_url,
              is_premium
       FROM listings
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Listing not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("GET /api/listings/:id error:", error.message);
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

// POST /api/listings — login required
router.post("/", requireAuth, async (req, res) => {
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
      photo_url
    } = req.body;

    const requiredFields = {
      name,
      collage,
      city,
      room_type,
      rent
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) =>
        value === undefined || value === null || value === ""
      )
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        fields: missingFields
      });
    }

    const result = await pool.query(
      `INSERT INTO listings
        (name, collage, city, room_type, rent, distance_km,
         amenities, phone, verified, photo_url, is_premium, owner_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,$9,false,$10)
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
        photo_url ?? null,
        req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("POST /api/listings error:", error.message);
    res.status(500).json({ error: "Failed to create listing" });
  }
});

// PUT /api/listings/:id
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Listing id must be a number"
      });
    }

    const existing = await pool.query(
      "SELECT owner_id FROM listings WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: "Listing not found"
      });
    }

    if (existing.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({
        error: "You can only edit your own listings"
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
      photo_url
    } = req.body;

    const result = await pool.query(
      `UPDATE listings
       SET name = COALESCE($1, name),
           collage = COALESCE($2, collage),
           city = COALESCE($3, city),
           room_type = COALESCE($4, room_type),
           rent = COALESCE($5, rent),
           distance_km = COALESCE($6, distance_km),
           amenities = COALESCE($7, amenities),
           phone = COALESCE($8, phone),
           photo_url = COALESCE($9, photo_url)
       WHERE id = $10
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
        photo_url,
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("PUT /api/listings/:id error:", error.message);
    res.status(500).json({ error: "Failed to update listing" });
  }
});

// DELETE /api/listings/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Listing id must be a number"
      });
    }

    const existing = await pool.query(
      "SELECT owner_id FROM listings WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: "Listing not found"
      });
    }

    if (existing.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({
        error: "You can only delete your own listings"
      });
    }

    const result = await pool.query(
      "DELETE FROM listings WHERE id = $1 RETURNING id",
      [id]
    );

    res.json({
      success: true,
      deleted_id: result.rows[0].id
    });

  } catch (error) {
    console.error("DELETE /api/listings/:id error:", error.message);
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

module.exports = router;
