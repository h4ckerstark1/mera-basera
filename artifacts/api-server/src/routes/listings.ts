import { Router, type IRouter } from "express";

const router: IRouter = Router();

const supabaseUrl =
  process.env["SUPABASE_URL"] ?? "https://llscwyutuxmvpjyovwok.supabase.co";
const supabaseKey =
  process.env["SUPABASE_ANON_KEY"] ??
  "sb_publishable_jBmd_ppVJDAlO4ICCfwptQ_GZeTSLb6";

router.get("/listings", async (_req, res) => {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/listings?select=id,created_at,name,collage,city,room_type,rent,distance_km,amenities,amenities_json,phone,verified,photo_url,is_premium`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Supabase returned HTTP ${response.status}`);
    }

    const listings: unknown = await response.json();
    res.json(listings);
  } catch (error) {
    console.error("Failed to fetch listings from Supabase:", error);
    res.status(502).json({ error: "Failed to fetch listings" });
  }
});

export default router;