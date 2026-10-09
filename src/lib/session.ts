import { supabase } from "@/integrations/supabase/client";

/**
 * The signed-in user from the locally stored session, in the same shape as
 * supabase.auth.getUser(). getUser() makes a round trip to the auth server on
 * every call; queries here only need the id, and RLS still verifies the token.
 */
export async function getSessionUser() {
  const { data, error } = await supabase.auth.getSession();
  return { data: { user: data.session?.user ?? null }, error };
}
