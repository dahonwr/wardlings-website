import { supabase } from '../lib/supabase';
import { WhitelistApplication, TaskProgress, AdminNote, WhitelistStatus } from '../types';

export const SOCIAL_TASKS = [
  { id: 'follow_x', label: 'Follow on X' },
  { id: 'like_pinned', label: 'Like the pinned post' },
  { id: 'repost_pinned', label: 'Repost the pinned post' },
  { id: 'comment_pinned', label: 'Comment on the pinned post' }
];

export const GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/16YuotUZIWPms-M_DwoRVcw9W5iitSbFU4_yG_IlVUuc/export?format=csv&gid=0';

export interface WinnerCheckResult {
  found: boolean;
  allocation?: string;
  project?: string;
  searchedAddress?: string;
}

export async function checkWinnerAllocation(walletAddress: string): Promise<WinnerCheckResult> {
  const cleanInput = walletAddress.trim().toLowerCase();
  if (!cleanInput) {
    return { found: false, searchedAddress: walletAddress };
  }

  // Fetch with cache-busting timestamp to always retrieve latest sheet entries
  const url = `${GOOGLE_SHEET_CSV_URL}&_t=${Date.now()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'text/csv, text/plain, */*'
    }
  });

  if (!res.ok) {
    throw new Error('Failed to retrieve spreadsheet data');
  }

  const csvText = await res.text();
  const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { found: false, searchedAddress: walletAddress };
  }

  // Parse header to dynamically locate ADDRESS and WHITELIST columns
  const headerParts = lines[0].split(',').map(h => h.trim().toUpperCase().replace(/^["']|["']$/g, ''));
  let addressIdx = headerParts.indexOf('ADDRESS');
  let whitelistIdx = headerParts.indexOf('WHITELIST');
  let projectIdx = headerParts.indexOf('PROJECT');

  if (addressIdx === -1) addressIdx = 2;
  if (whitelistIdx === -1) whitelistIdx = 1;
  if (projectIdx === -1) projectIdx = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length <= addressIdx) continue;

    const rowAddress = cols[addressIdx]?.toLowerCase();
    if (rowAddress && rowAddress === cleanInput) {
      let rawAlloc = (cols[whitelistIdx] || 'GTD').trim().toUpperCase();
      let normalizedAlloc = 'GTD';
      if (rawAlloc.includes('OG')) {
        normalizedAlloc = 'OG';
      } else if (rawAlloc.includes('FCFS')) {
        normalizedAlloc = 'FCFS';
      } else {
        normalizedAlloc = 'GTD';
      }

      return {
        found: true,
        allocation: normalizedAlloc,
        project: cols[projectIdx] || '',
        searchedAddress: walletAddress.trim()
      };
    }
  }

  return { found: false, searchedAddress: walletAddress.trim() };
}

// Helper to construct a WhitelistApplication with derived step and completion state
function mapDbRowToApplication(row: any, tasks: TaskProgress[] = []): WhitelistApplication {
  const hasCommentLink = Boolean(row.comment_link && row.comment_link.trim());
  const hasWalletAddress = Boolean(row.wallet_address && row.wallet_address.trim());
  const allSocialDone = SOCIAL_TASKS.every(st => tasks.some(t => t.task_name === st.id && t.completed));

  let derivedStep = 2;
  if (hasCommentLink) {
    derivedStep = 5;
  } else if (hasWalletAddress) {
    derivedStep = 4;
  } else if (allSocialDone) {
    derivedStep = 3;
  }

  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
    x_handle: row.x_handle,
    wallet_address: row.wallet_address || null,
    comment_link: row.comment_link || null,
    current_step: derivedStep,
    completed: hasCommentLink,
    status: (row.status as WhitelistStatus) || 'pending'
  };
}

export async function findApplicationByHandleOrWallet(identifier: string): Promise<{
  application: WhitelistApplication | null;
  tasks: TaskProgress[];
  error?: string;
}> {
  const clean = identifier.trim().replace(/^@/, '').toLowerCase();
  if (!clean) return { application: null, tasks: [] };

  try {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(clean);

    let query = supabase
      .from('whitelist_applications')
      .select('id, created_at, x_handle, wallet_address, comment_link, status');

    if (isUuid) {
      console.log('[findApplicationByHandleOrWallet] Querying by UUID:', clean);
      query = query.or(`id.eq.${clean},x_handle.ilike.${clean},wallet_address.ilike.${clean}`);
    } else {
      console.log('[findApplicationByHandleOrWallet] Querying by handle/wallet:', clean);
      query = query.or(`x_handle.ilike.${clean},wallet_address.ilike.${clean}`);
    }

    const { data: apps, error: fetchErr } = await query;

    if (fetchErr) {
      console.error('[findApplicationByHandleOrWallet] Supabase query error:', fetchErr);
      return { application: null, tasks: [], error: fetchErr.message };
    }

    if (!apps || apps.length === 0) {
      console.log('[findApplicationByHandleOrWallet] No existing application found for:', clean);
      return { application: null, tasks: [] };
    }

    const row = apps[0];
    console.log('[findApplicationByHandleOrWallet] Found row, UUID:', row.id);

    // Fetch task progress
    let taskData: TaskProgress[] = [];
    try {
      const { data: tData, error: tErr } = await supabase
        .from('task_progress')
        .select('*')
        .eq('application_id', row.id);
      if (!tErr && tData) {
        taskData = tData as TaskProgress[];
      }
    } catch (e) {
      // Table may not exist yet in schema cache
    }

    const application = mapDbRowToApplication(row, taskData);

    return {
      application,
      tasks: taskData
    };
  } catch (err: any) {
    console.error('[findApplicationByHandleOrWallet] Exception:', err);
    return { application: null, tasks: [], error: err?.message || 'Error querying database' };
  }
}

export async function createOrGetApplication(xHandleInput: string): Promise<{
  application: WhitelistApplication;
  tasks: TaskProgress[];
  isExisting: boolean;
  error?: string;
}> {
  const cleanHandle = xHandleInput.trim().replace(/^@/, '').toLowerCase();

  if (!cleanHandle) {
    throw new Error('Please enter a valid X handle.');
  }

  // 1. Check if application already exists for this handle
  const existing = await findApplicationByHandleOrWallet(cleanHandle);

  if (existing.application) {
    console.log('[createOrGetApplication] Found existing application row:', existing.application);
    console.log('[createOrGetApplication] Returned UUID from existing row:', existing.application.id);
    return {
      application: existing.application,
      tasks: existing.tasks,
      isExisting: true
    };
  }

  // 2. Create a new whitelist application without id field (let Supabase generate UUID)
  const newAppPayload = {
    x_handle: cleanHandle,
    status: 'pending' as WhitelistStatus,
    created_at: new Date().toISOString()
  };

  console.log('[createOrGetApplication] Inserting new whitelist_application row:', newAppPayload);

  const { data, error } = await supabase
    .from('whitelist_applications')
    .insert([newAppPayload])
    .select()
    .single();

  console.log('[createOrGetApplication] Inserted row result from Supabase:', data);
  console.log('[createOrGetApplication] Returned UUID from insert:', data?.id);

  if (error) {
    console.error('[createOrGetApplication] Insert error:', error);
    if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('x_handle')) {
      const recheck = await findApplicationByHandleOrWallet(cleanHandle);
      if (recheck.application) {
        console.log('[createOrGetApplication] Rechecked and found existing application after conflict, UUID:', recheck.application.id);
        return {
          application: recheck.application,
          tasks: recheck.tasks,
          isExisting: true
        };
      }
      throw new Error('This X handle has already been registered in the Sanctuary.');
    }
    throw new Error(error.message || 'Failed to create whitelist application.');
  }

  if (data) {
    const application = mapDbRowToApplication(data, []);
    console.log('[createOrGetApplication] Successfully initialized application with UUID:', application.id);
    return {
      application,
      tasks: [],
      isExisting: false
    };
  }

  const recheck = await findApplicationByHandleOrWallet(cleanHandle);
  if (recheck.application) {
    console.log('[createOrGetApplication] Final recheck found application UUID:', recheck.application.id);
    return {
      application: recheck.application,
      tasks: [],
      isExisting: false
    };
  }

  throw new Error('Failed to create application record in database.');
}

export async function saveTaskProgress(
  applicationId: string,
  taskName: string,
  completed: boolean
): Promise<{ success: boolean; tasks: TaskProgress[]; error?: string }> {
  try {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(applicationId);
    if (!isUuid) {
      console.warn('[saveTaskProgress] Called with non-UUID applicationId:', applicationId);
      return { success: true, tasks: [] };
    }

    console.log('[saveTaskProgress] Updating task progress query for applicationId:', applicationId, 'task:', taskName, 'completed:', completed);

    const now = new Date().toISOString();

    // Check if entry exists in task_progress table
    let taskData: TaskProgress[] = [];
    try {
      const { data: existing } = await supabase
        .from('task_progress')
        .select('id')
        .eq('application_id', applicationId)
        .eq('task_name', taskName)
        .maybeSingle();

      if (existing?.id) {
        const { error: upErr } = await supabase
          .from('task_progress')
          .update({ completed, completed_at: now })
          .eq('id', existing.id);
        console.log('[saveTaskProgress] Updated existing task_progress entry for task:', taskName, 'error:', upErr);
      } else {
        const { error: inErr } = await supabase.from('task_progress').insert([{
          application_id: applicationId,
          task_name: taskName,
          completed,
          completed_at: now
        }]);
        console.log('[saveTaskProgress] Inserted new task_progress entry for task:', taskName, 'error:', inErr);
      }

      // Fetch fresh tasks
      const { data: freshTasks } = await supabase
        .from('task_progress')
        .select('*')
        .eq('application_id', applicationId);

      if (freshTasks) {
        taskData = freshTasks as TaskProgress[];
      }
    } catch (e) {
      console.warn('[saveTaskProgress] task_progress sync warning:', e);
    }

    return {
      success: true,
      tasks: taskData
    };
  } catch (err: any) {
    console.error('[saveTaskProgress] Error:', err);
    return { success: false, tasks: [], error: err?.message || 'Failed to update task progress.' };
  }
}

export async function updateWalletAddress(
  applicationId: string,
  walletAddressInput: string
): Promise<{ success: boolean; application?: WhitelistApplication; error?: string }> {
  const cleanWallet = walletAddressInput.trim().toLowerCase();

  if (!cleanWallet || !cleanWallet.startsWith('0x') || cleanWallet.length < 10) {
    return { success: false, error: 'Please enter a valid Robinhood Chain address starting with 0x.' };
  }

  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(applicationId);

  try {
    console.log('[updateWalletAddress] Updating wallet_address query for applicationId:', applicationId, 'wallet:', cleanWallet);

    // Check if wallet is already used by ANOTHER application
    let walletQuery = supabase
      .from('whitelist_applications')
      .select('id, x_handle')
      .ilike('wallet_address', cleanWallet);

    if (isUuid) {
      walletQuery = walletQuery.neq('id', applicationId);
    }

    const { data: existingWallet } = await walletQuery;

    if (existingWallet && existingWallet.length > 0) {
      console.warn('[updateWalletAddress] Wallet already linked to another application:', existingWallet);
      return {
        success: false,
        error: 'This wallet address is already linked to another Sanctuary application.'
      };
    }

    if (isUuid) {
      const { data: updateData, error } = await supabase
        .from('whitelist_applications')
        .update({ wallet_address: cleanWallet })
        .eq('id', applicationId)
        .select();

      console.log('[updateWalletAddress] Update wallet query result for applicationId:', applicationId, 'data:', updateData, 'error:', error);

      if (error) {
        if (error.code === '23505' || error.message.includes('unique')) {
          return {
            success: false,
            error: 'This wallet address is already linked to another application.'
          };
        }
        return { success: false, error: error.message };
      }
    }

    const updated = await findApplicationByHandleOrWallet(applicationId);

    const application: WhitelistApplication = updated.application || {
      id: applicationId,
      created_at: new Date().toISOString(),
      x_handle: '',
      wallet_address: cleanWallet,
      comment_link: null,
      current_step: 4,
      completed: false,
      status: 'pending'
    };

    return { success: true, application };
  } catch (err: any) {
    console.error('[updateWalletAddress] Exception:', err);
    return { success: false, error: err?.message || 'Failed to update wallet address.' };
  }
}

export async function submitCommentLink(
  applicationId: string,
  commentLinkInput: string
): Promise<{ success: boolean; application?: WhitelistApplication; error?: string }> {
  const cleanLink = commentLinkInput.trim();

  // Validate X post URL
  const xPostRegex = /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/status\/[0-9]+/;
  if (!cleanLink || (!cleanLink.includes('x.com/') && !cleanLink.includes('twitter.com/')) || !xPostRegex.test(cleanLink)) {
    return {
      success: false,
      error: 'Please enter a valid X (Twitter) post link (e.g. https://x.com/username/status/123456...)'
    };
  }

  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(applicationId);

  try {
    console.log('[submitCommentLink] Updating comment_link query for applicationId:', applicationId, 'link:', cleanLink);

    if (isUuid) {
      const { data: updateData, error } = await supabase
        .from('whitelist_applications')
        .update({ comment_link: cleanLink })
        .eq('id', applicationId)
        .select();

      console.log('[submitCommentLink] Update comment link query result for applicationId:', applicationId, 'data:', updateData, 'error:', error);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    const updated = await findApplicationByHandleOrWallet(applicationId);

    const application: WhitelistApplication = updated.application || {
      id: applicationId,
      created_at: new Date().toISOString(),
      x_handle: '',
      wallet_address: null,
      comment_link: cleanLink,
      current_step: 5,
      completed: true,
      status: 'pending'
    };

    return { success: true, application };
  } catch (err: any) {
    console.error('[submitCommentLink] Exception:', err);
    return { success: false, error: err?.message || 'Failed to submit comment link.' };
  }
}

export async function updateStep(
  _applicationId: string,
  _step: number
): Promise<void> {
  // Step is dynamically computed from x_handle, task progress, wallet_address, comment_link
}

export async function fetchAllApplications(): Promise<WhitelistApplication[]> {
  try {
    const { data, error } = await supabase
      .from('whitelist_applications')
      .select('id, created_at, x_handle, wallet_address, comment_link, status')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchAllApplications error:', error);
      return [];
    }

    return (data || []).map(row => mapDbRowToApplication(row, []));
  } catch (e) {
    console.error('fetchAllApplications exception:', e);
    return [];
  }
}

export async function updateApplicationStatusAndNotes(
  applicationId: string,
  status: WhitelistStatus,
  notes?: string,
  reviewedBy: string = 'admin'
): Promise<boolean> {
  try {
    console.log('[updateApplicationStatusAndNotes] Updating status query for applicationId:', applicationId, 'status:', status);

    const { data: updateData, error: appErr } = await supabase
      .from('whitelist_applications')
      .update({ status })
      .eq('id', applicationId)
      .select();

    console.log('[updateApplicationStatusAndNotes] Update status query result for applicationId:', applicationId, 'data:', updateData, 'error:', appErr);

    if (appErr) console.error('update status error:', appErr);

    if (notes !== undefined) {
      try {
        const { data: existingNote } = await supabase
          .from('admin_notes')
          .select('id')
          .eq('application_id', applicationId)
          .maybeSingle();

        if (existingNote?.id) {
          await supabase
            .from('admin_notes')
            .update({
              notes,
              reviewed_by: reviewedBy,
              reviewed_at: new Date().toISOString()
            })
            .eq('id', existingNote.id);
        } else {
          await supabase.from('admin_notes').insert([{
            application_id: applicationId,
            notes,
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString()
          }]);
        }
      } catch (e) {
        console.warn('admin_notes sync deferred (table absent in DB schema cache)');
      }
    }

    return true;
  } catch (e) {
    console.error('updateApplicationStatusAndNotes exception:', e);
    return false;
  }
}

export async function fetchAdminNotes(applicationId: string): Promise<AdminNote | null> {
  try {
    const { data } = await supabase
      .from('admin_notes')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    return data as AdminNote | null;
  } catch (e) {
    return null;
  }
}


