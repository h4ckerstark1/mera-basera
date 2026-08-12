import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://llscwyutuxmvpjyovwok.supabase.co";
const SUPABASE_KEY = "sb_publishable_jBmd_ppVJDAlO4ICCfwptQ_GZeTSLb6";

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str);
}

export function iconFor(a) {
  const map = { WiFi: "📶", Meals: "🍛", Laundry: "🧺", AC: "❄️" };
  return map[a] || "•";
}

export function mapListingRow(row) {
  return {
    id: row.id,
    college: row.college,
    city: row.city,
    name: row.name,
    type: row.room_type,
    rent: row.rent,
    distance: row.distance_km,
    amenities: row.amenities ? row.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
    verified: row.verified,
    phone: row.phone || "919999999999",
    photoUrl: row.photo_url || null,
    isPremium: row.is_premium || false,
  };
}

export function mapRoommateRow(row) {
  return {
    id: row.id,
    name: row.name,
    college: row.college,
    budget: row.budget,
    gender: row.gender,
    prefs: row.preferences ? row.preferences.split(',').map(s => s.trim()).filter(Boolean) : [],
    phone: row.phone,
  };
}

export const seedListings = [
  { college: "Ambalika University", city: "Lucknow", name: "Sharma PG for Boys", room_type: "Single", rent: 6000, distance_km: 0.8, amenities: "WiFi,Meals,Laundry", verified: true, phone: "919999999999" },
  { college: "Ambalika University", city: "Lucknow", name: "Green Valley Boys Hostel", room_type: "Triple", rent: 4500, distance_km: 1.2, amenities: "WiFi,Meals", verified: true, phone: "919999999999" },
  { college: "Ambalika University", city: "Lucknow", name: "Comfort Stay Girls PG", room_type: "Double", rent: 7000, distance_km: 0.5, amenities: "WiFi,Meals,AC", verified: true, phone: "919999999999" },
  { college: "Ambalika University", city: "Lucknow", name: "Student Nest", room_type: "Double", rent: 5000, distance_km: 1.5, amenities: "WiFi", verified: false, phone: "919999999999" },
  { college: "Ambalika University", city: "Lucknow", name: "Royal Residency", room_type: "Single", rent: 8500, distance_km: 0.3, amenities: "WiFi,Meals,AC,Laundry", verified: true, phone: "919999999999" },
];

export const seedRoommates = [
  { name: "Rahul Verma", college: "Ambalika University", budget: 4000, gender: "Male", preferences: "Non-smoker,Early sleeper", phone: "919999999999" },
  { name: "Priya Singh", college: "Ambalika University", budget: 3500, gender: "Female", preferences: "Vegetarian,Studious", phone: "919999999999" },
];
