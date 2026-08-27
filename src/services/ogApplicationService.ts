export interface OgApplicationPayload {
  x_username: string;
  wallet_address: string;
  completed_follow: boolean;
  completed_like: boolean;
  completed_share: boolean;
  completed_comment: boolean;
  completed_tag: boolean;
}

export interface OgApplicationResponse {
  success: boolean;
  message?: string;
  id?: number | string;
  error?: string;
}

export interface SubmitOgResult {
  ok: boolean;
  status: number;
  data?: OgApplicationResponse;
  errorMessage?: string;
  isDuplicate?: boolean;
}

const DIRECT_OG_API_ENDPOINT = 'https://wardlings-og-api.xethrial.workers.dev/';
const PROXY_OG_API_ENDPOINT = '/api/og-apply';

export async function submitOgApplication(
  payload: OgApplicationPayload
): Promise<SubmitOgResult> {
  // Determine primary endpoint:
  // If running in production domain wardlings.xyz, direct endpoint works natively with CORS.
  // In development, preview, or sandboxed iframe environments, use the /api/og-apply backend proxy.
  const isWardlingsHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'wardlings.xyz' ||
      window.location.hostname.endsWith('.wardlings.xyz'));

  const primaryEndpoint = isWardlingsHost
    ? DIRECT_OG_API_ENDPOINT
    : PROXY_OG_API_ENDPOINT;

  const fallbackEndpoint = isWardlingsHost
    ? PROXY_OG_API_ENDPOINT
    : DIRECT_OG_API_ENDPOINT;

  const trySubmit = async (endpoint: string): Promise<SubmitOgResult> => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let json: OgApplicationResponse | null = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (response.status === 409) {
      return {
        ok: false,
        status: 409,
        isDuplicate: true,
        errorMessage:
          json?.error ||
          json?.message ||
          'We already have an application for this X username or wallet.'
      };
    }

    if (!response.ok) {
      const errorMsg =
        json?.error ||
        json?.message ||
        "Your application wasn't submitted. Please try again.";
      return {
        ok: false,
        status: response.status,
        errorMessage: errorMsg
      };
    }

    return {
      ok: true,
      status: response.status,
      data: json || { success: true }
    };
  };

  try {
    return await trySubmit(primaryEndpoint);
  } catch (primaryErr) {
    console.warn(
      `Primary submission endpoint (${primaryEndpoint}) failed, trying fallback (${fallbackEndpoint}):`,
      primaryErr
    );
    try {
      return await trySubmit(fallbackEndpoint);
    } catch (fallbackErr) {
      console.error('All OG application endpoints failed:', fallbackErr);
      return {
        ok: false,
        status: 0,
        errorMessage: "Your application wasn't submitted. Please try again."
      };
    }
  }
}
