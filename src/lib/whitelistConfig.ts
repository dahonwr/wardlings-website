// Single switch for the whitelist application funnel.
//
// Set to false: ApplicationSection renders the "Whitelist Closed" card
// instead of the multi-step form, so submitStep1Handle() (the only
// function that INSERTs a new row into whitelist_applications) is never
// called from the UI — no new applications can reach Supabase through
// the frontend.
//
// This is a UI-level gate only. It stops the form from being shown and
// stops the app from *calling* the insert, but it does not by itself
// stop someone from POSTing directly to the Supabase REST API with the
// public anon key. That part is enforced at the database level via a
// Row Level Security policy — see supabase/migrations/02_close_whitelist_submissions.sql.
//
// Existing applicant rows are never touched by this flag — it only
// affects whether the form/insert path renders and runs.
export const WHITELIST_OPEN = false;
