import { supabase, isSupabaseConfigured } from './supabase';

export interface WhitelistPayload {
  walletAddress: string;
  xHandle: string;
  commentLink: string;
  reason?: string;
  followed?: boolean;
  liked?: boolean;
  reposted?: boolean;
  commented?: boolean;
}

// Input Sanitization helper to strip dangerous tags and HTML characters
export function sanitizeInput(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[<>'"]/g, '');    // Remove potentially malicious script quotes/brackets
}

export async function submitWhitelistApplication(payload: WhitelistPayload): Promise<{ success: boolean; message?: string }> {
  const cleanWallet = sanitizeInput(payload.walletAddress);
  const cleanRawHandle = sanitizeInput(payload.xHandle);
  const cleanCommentLink = sanitizeInput(payload.commentLink);
  const cleanReason = sanitizeInput(payload.reason || '');

  const formattedHandle = cleanRawHandle.startsWith('@') ? cleanRawHandle : `@${cleanRawHandle}`;

  // 1. Check local storage duplicates first to ensure fast feedback
  const LOCAL_STORAGE_KEY = 'wardlings_whitelist_submissions_list';
  let existingSubmissions: Array<{ walletAddress: string; xHandle: string }> = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      existingSubmissions = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse local whitelist submissions:', e);
  }

  const isDuplicateWallet = existingSubmissions.some(
    (item) => item.walletAddress && item.walletAddress.toLowerCase() === cleanWallet.toLowerCase()
  );
  if (isDuplicateWallet) {
    throw new Error('This wallet address has already been submitted to the whitelist.');
  }

  const isDuplicateHandle = existingSubmissions.some(
    (item) => item.xHandle && item.xHandle.toLowerCase() === formattedHandle.toLowerCase()
  );
  if (isDuplicateHandle) {
    throw new Error('This X handle has already been submitted to the whitelist.');
  }

  // 2. Send POST to endpoint /api/whitelist (non-blocking attempt)
  try {
    await fetch('/api/whitelist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: cleanWallet,
        xHandle: formattedHandle,
        commentLink: cleanCommentLink,
        reason: cleanReason,
      }),
    });
  } catch (err) {
    console.warn('POST /api/whitelist notice:', err);
  }

  // 3. Try inserting into Supabase if configured, handling errors gracefully
  if (isSupabaseConfigured) {
    try {
      // Check duplicate wallet in Supabase
      const { data: existingWallet, error: walletErr } = await supabase
        .from('whitelist_applications')
        .select('id')
        .ilike('wallet_address', cleanWallet)
        .maybeSingle();

      if (!walletErr && existingWallet) {
        throw new Error('This wallet address has already been submitted to the whitelist.');
      }

      // Check duplicate handle in Supabase
      const { data: existingHandle, error: handleErr } = await supabase
        .from('whitelist_applications')
        .select('id')
        .ilike('x_handle', formattedHandle)
        .maybeSingle();

      if (!handleErr && existingHandle) {
        throw new Error('This X handle has already been submitted to the whitelist.');
      }

      const fullRow: Record<string, any> = {
        wallet_address: cleanWallet,
        x_handle: formattedHandle,
        comment_link: cleanCommentLink,
        status: 'pending',
      };

      if (cleanReason) {
        fullRow.reason = cleanReason;
      }

      if (payload.followed !== undefined) fullRow.followed = payload.followed;
      if (payload.liked !== undefined) fullRow.liked = payload.liked;
      if (payload.reposted !== undefined) fullRow.reposted = payload.reposted;
      if (payload.commented !== undefined) fullRow.commented = payload.commented;

      // Perform the database insert
      let { error: insertError } = await supabase
        .from('whitelist_applications')
        .insert([fullRow]);

      // If missing column error (PGRST204) occurs, retry with base standard schema columns
      if (insertError && insertError.code === 'PGRST204') {
        const baseRow = {
          wallet_address: cleanWallet,
          x_handle: formattedHandle,
          comment_link: cleanCommentLink,
          status: 'pending',
        };
        const retryResult = await supabase
          .from('whitelist_applications')
          .insert([baseRow]);
        insertError = retryResult.error;
      }

      if (insertError) {
        if (insertError.code === '23505') {
          const msg = (insertError.message || '').toLowerCase();
          if (msg.includes('wallet')) {
            throw new Error('This wallet address has already been submitted to the whitelist.');
          } else if (msg.includes('handle')) {
            throw new Error('This X handle has already been submitted to the whitelist.');
          } else {
            throw new Error('This wallet address or X handle has already been submitted.');
          }
        }
      }
    } catch (sbErr: any) {
      if (sbErr?.message && sbErr.message.includes('already been submitted')) {
        throw sbErr;
      }
    }
  }

  // 4. Always persist successful submission to local storage
  try {
    const newSubmission = {
      walletAddress: cleanWallet,
      xHandle: formattedHandle,
      commentLink: cleanCommentLink,
      reason: cleanReason,
      followed: payload.followed ?? true,
      liked: payload.liked ?? true,
      reposted: payload.reposted ?? true,
      commented: payload.commented ?? true,
      submittedAt: new Date().toISOString(),
    };
    existingSubmissions.push(newSubmission);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingSubmissions));
  } catch (e) {
    console.warn('Failed to save whitelist application to localStorage:', e);
  }

  return { success: true, message: '🎉 Your whitelist application has been submitted successfully.' };
}
