// Lecture/écriture de la sauvegarde dans Supabase (table `saves`).
// Une ligne par joueur : { user_id, data (jsonb), updated_at }.
import { supabase } from "./supabaseClient.js";

// Récupère l'instantané cloud du joueur, ou null s'il n'en a pas encore.
export async function loadCloudSave(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from("saves")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("[cloudSave] load:", error.message);
    return null;
  }
  return data?.data ?? null;
}

// Écrit (upsert) l'instantané cloud du joueur. Renvoie true si OK.
export async function writeCloudSave(userId, snapshot) {
  if (!supabase || !userId) return false;
  const { error } = await supabase
    .from("saves")
    .upsert(
      { user_id: userId, data: snapshot, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  if (error) {
    console.warn("[cloudSave] write:", error.message);
    return false;
  }
  return true;
}
