import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DISCORD_CLIENT_ID = Deno.env.get("DISCORD_CLIENT_ID") || "1515320775324995785";
const DISCORD_CLIENT_SECRET = Deno.env.get("DISCORD_CLIENT_SECRET") || "";
const DISCORD_REDIRECT_URI = Deno.env.get("DISCORD_REDIRECT_URI") || "https://osyvztzqmtimbefklcsn.supabase.co/functions/v1/discord-auth";
const DISCORD_GUILD_ID = Deno.env.get("DISCORD_GUILD_ID") || "1515320775324995785";
const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN") || "";

const ALLOCATION_ROLES: Record<string, { id: string; name: string }> = {
  OG: { id: "1515329267712528516", name: "Wardlings" },
  FCFS: { id: "1515335932696592546", name: "Chosen" },
  GTD: { id: "1536037496222122085", name: "Keepers" },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    let code: string | null = null;
    let state: string | null = null;

    if (req.method === "GET") {
      code = url.searchParams.get("code");
      state = url.searchParams.get("state");
      const errorParam = url.searchParams.get("error");
      const errorDesc = url.searchParams.get("error_description");

      if (errorParam) {
        return handleOAuthError(errorParam, errorDesc, state);
      }
    } else if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      code = body.code || url.searchParams.get("code");
      state = body.state || url.searchParams.get("state");
    }

    if (!code) {
      return new Response(
        JSON.stringify({ error: "Missing authorization code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decode state if provided
    let stateData: any = {};
    if (state) {
      try {
        stateData = JSON.parse(decodeURIComponent(escape(atob(state))));
      } catch {
        // Fallback
      }
    }

    const requestedAllocation: string | undefined = stateData?.allocation;

    // 1. Exchange OAuth code for Discord access token
    const tokenResponse = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("Failed to exchange Discord code for token:", errText);
      return returnResult(
        {
          success: false,
          error: "Failed to exchange Discord authorization code",
          details: errText,
        },
        state,
        req.method === "GET"
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch Discord user identity
    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errText = await userResponse.text();
      console.error("Failed to fetch Discord user:", errText);
      return returnResult(
        {
          success: false,
          error: "Failed to fetch user profile from Discord",
        },
        state,
        req.method === "GET"
      );
    }

    const userData = await userResponse.json();

    // 3. Fetch Guild Member info (Wardlings Discord server ID: 1515320775324995785)
    let memberData: any = null;
    let isMember = false;

    // Priority A: Check user's own token with guilds/@me/member
    try {
      const memberResponse = await fetch(
        `https://discord.com/api/v10/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (memberResponse.ok) {
        memberData = await memberResponse.json();
        isMember = true;
      }
    } catch (e) {
      console.warn("User guilds endpoint failed, checking bot endpoint:", e);
    }

    // Priority B: If not confirmed and bot token is available, check via bot
    if (!isMember && DISCORD_BOT_TOKEN) {
      try {
        const botMemberRes = await fetch(
          `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${userData.id}`,
          {
            headers: {
              Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            },
          }
        );
        if (botMemberRes.ok) {
          memberData = await botMemberRes.json();
          isMember = true;
        }
      } catch (e) {
        console.warn("Bot member check error:", e);
      }
    }

    if (!isMember) {
      // User is not a member of the Wardlings Discord server
      return returnResult(
        {
          success: true,
          isMember: false,
          error: "not_in_guild",
          message: "Join the Wardlings Discord first, then verify your Discord account.",
          user: {
            id: userData.id,
            username: userData.username,
            discriminator: userData.discriminator,
            global_name: userData.global_name,
            avatar: userData.avatar,
          },
        },
        state,
        req.method === "GET"
      );
    }

    // 4. Guild member exists! Check roles and assign if applicable
    const existingRoles: string[] = memberData?.roles || [];
    let roleStatus: "already_assigned" | "assigned" | "eligible" = "eligible";
    let targetAllocation = requestedAllocation || "GTD";
    let targetRoleConfig = ALLOCATION_ROLES[targetAllocation] || ALLOCATION_ROLES.GTD;

    if (requestedAllocation && ALLOCATION_ROLES[requestedAllocation]) {
      targetAllocation = requestedAllocation;
      targetRoleConfig = ALLOCATION_ROLES[requestedAllocation];
    } else {
      // Check if user already holds one of the roles
      if (existingRoles.includes(ALLOCATION_ROLES.OG.id)) {
        targetAllocation = "OG";
        targetRoleConfig = ALLOCATION_ROLES.OG;
      } else if (existingRoles.includes(ALLOCATION_ROLES.FCFS.id)) {
        targetAllocation = "FCFS";
        targetRoleConfig = ALLOCATION_ROLES.FCFS;
      } else if (existingRoles.includes(ALLOCATION_ROLES.GTD.id)) {
        targetAllocation = "GTD";
        targetRoleConfig = ALLOCATION_ROLES.GTD;
      }
    }

    // Check if the user already has this specific role
    if (existingRoles.includes(targetRoleConfig.id)) {
      roleStatus = "already_assigned";
    } else if (DISCORD_BOT_TOKEN) {
      // Attempt to assign the role via Discord Bot API
      try {
        const assignRes = await fetch(
          `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${userData.id}/roles/${targetRoleConfig.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            },
          }
        );
        if (assignRes.ok || assignRes.status === 204) {
          roleStatus = "assigned";
        }
      } catch (err) {
        console.warn("Could not auto-assign role via bot:", err);
      }
    }

    const payload = {
      success: true,
      isMember: true,
      role: targetAllocation,
      roleName: targetRoleConfig.name,
      roleStatus,
      roles: existingRoles,
      user: {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        global_name: userData.global_name,
        avatar: userData.avatar,
      },
    };

    return returnResult(payload, state, req.method === "GET");
  } catch (error) {
    console.error("Unhandled Discord auth error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function handleOAuthError(error: string, description: string | null, state: string | null) {
  return returnResult(
    {
      success: false,
      error: description || error,
    },
    state,
    true
  );
}

function returnResult(data: any, stateParam: string | null, isGetRedirect: boolean) {
  if (!isGetRedirect) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse state
  let targetOrigin = "*";
  let returnUrl = "";
  if (stateParam) {
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(stateParam))));
      if (decoded.origin) targetOrigin = decoded.origin;
      if (decoded.returnUrl) returnUrl = decoded.returnUrl;
    } catch {
      // Ignore parse failure
    }
  }

  const jsonStr = JSON.stringify(data);

  // Return HTML popup response that broadcasts to opener or redirects
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Wardlings Verification</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      background: #FFFDF8;
      color: #2F241D;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #E5DFD5;
      border-top-color: #5C8E47;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p>Verifying Wardlings Sanctuary role...</p>
  <script>
    const payload = ${jsonStr};
    const targetOrigin = ${JSON.stringify(targetOrigin)};
    const returnUrl = ${JSON.stringify(returnUrl)};

    if (window.opener) {
      try {
        window.opener.postMessage({
          type: 'DISCORD_AUTH_SUCCESS',
          ...payload
        }, '*');
      } catch (e) {}
      setTimeout(() => { window.close(); }, 350);
    } else if (returnUrl) {
      const url = new URL(returnUrl);
      if (payload.role) url.searchParams.set('role', payload.role);
      if (payload.roleName) url.searchParams.set('role_name', payload.roleName);
      if (payload.roleStatus) url.searchParams.set('role_status', payload.roleStatus);
      if (payload.user?.username) url.searchParams.set('username', payload.user.username);
      if (payload.user?.id) url.searchParams.set('user_id', payload.user.id);
      if (payload.user?.avatar) url.searchParams.set('avatar', payload.user.avatar);
      if (payload.isMember === false) url.searchParams.set('is_member', 'false');
      if (payload.error) url.searchParams.set('auth_error', payload.error);
      window.location.href = url.toString();
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
