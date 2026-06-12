// Client Supabase — activé seulement si les clés sont fournies.
// Sans VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY, le jeu reste 100 % local
// (sauvegarde localStorage) : aucune régression par rapport à la v1.
import { createClient } from "@supabase/supabase-js";

const env = (import.meta && import.meta.env) || {};
const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

// `cloudEnabled` = true uniquement si les deux clés sont présentes.
export const cloudEnabled = Boolean(url && anonKey);

// `supabase` est null quand le cloud est désactivé. Tout le code appelant
// doit vérifier `cloudEnabled` (ou `supabase`) avant de l'utiliser.
export const supabase = cloudEnabled
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
