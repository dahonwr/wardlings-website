import { useState, useCallback, useEffect } from 'react';
import { WhitelistApplication, TaskProgress } from '../types';
import {
  createOrGetApplication,
  saveTaskProgress,
  updateWalletAddress,
  submitCommentLink,
  findApplicationByHandleOrWallet,
  SOCIAL_TASKS,
  updateStep
} from '../services/whitelistService';

export function useWhitelist() {
  const [application, setApplication] = useState<WhitelistApplication | null>(null);
  const [tasks, setTasks] = useState<TaskProgress[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Inputs
  const [xHandleInput, setXHandleInput] = useState<string>('');
  const [walletInput, setWalletInput] = useState<string>('');
  const [commentLinkInput, setCommentLinkInput] = useState<string>('');

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if a task is completed in state
  const isTaskCompleted = useCallback((taskName: string): boolean => {
    return tasks.some(t => t.task_name === taskName && t.completed);
  }, [tasks]);

  // Check if all 4 social tasks are completed
  const areAllSocialTasksCompleted = useCallback((): boolean => {
    return SOCIAL_TASKS.every(st => tasks.some(t => t.task_name === st.id && t.completed));
  }, [tasks]);

  // Restore state from Supabase if application exists
  const restoreApplication = useCallback(async (identifier: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const savedAppId = localStorage.getItem('applicationId');
      console.log('[useWhitelist] Reading applicationId from localStorage:', savedAppId);

      const targetId = savedAppId || identifier;
      const cleanId = targetId.trim().replace(/^@/, '').toLowerCase();
      
      const result = await findApplicationByHandleOrWallet(cleanId);
      if (result.application) {
        setApplication(result.application);

        // Ensure applicationId is saved in localStorage
        localStorage.setItem('applicationId', result.application.id);
        localStorage.setItem('wardlings_active_identifier', result.application.id);
        console.log('[useWhitelist] Restored application with UUID:', result.application.id);

        // Retrieve local fallback completed tasks if any
        let localCompleted: string[] = [];
        try {
          const raw = localStorage.getItem(`wardlings_completed_tasks_${result.application.x_handle}`);
          if (raw) localCompleted = JSON.parse(raw);
        } catch (e) {
          // ignore parsing error
        }

        // Merge DB tasks with local completed cache
        const taskMap = new Map<string, TaskProgress>();
        result.tasks.forEach(t => taskMap.set(t.task_name, t));
        localCompleted.forEach(tName => {
          const existing = taskMap.get(tName);
          taskMap.set(tName, {
            id: existing?.id || `local-${tName}`,
            application_id: result.application?.id || 'local',
            task_name: tName,
            completed: true,
            completed_at: existing?.completed_at || new Date().toISOString()
          });
        });

        const mergedTasks = Array.from(taskMap.values());
        setTasks(mergedTasks);
        setXHandleInput(result.application.x_handle);
        if (result.application.wallet_address) setWalletInput(result.application.wallet_address);
        if (result.application.comment_link) setCommentLinkInput(result.application.comment_link);

        // Determine step cleanly
        if (result.application.completed || result.application.comment_link) {
          setCurrentStep(5); // Final screen
        } else if (result.application.wallet_address) {
          setCurrentStep(4); // Step 4: Comment link
        } else if (result.application.current_step >= 2) {
          const allDone = SOCIAL_TASKS.every(st => mergedTasks.some(t => t.task_name === st.id && t.completed));
          setCurrentStep(allDone ? 3 : 2);
        } else {
          setCurrentStep(1);
        }
        return true;
      }
      return false;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error checking existing application');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-resume progress from localStorage once on mount
  useEffect(() => {
    const savedAppId = localStorage.getItem('applicationId');
    const savedIdentifier = localStorage.getItem('wardlings_active_identifier');
    const active = savedAppId || savedIdentifier;
    if (active) {
      console.log('[useWhitelist] Auto-resuming with active ID/handle from localStorage:', active);
      restoreApplication(active);
    }
  }, []);

  // Step 1 Submit: Create application in Supabase with x_handle, current_step = 2
  const submitStep1Handle = useCallback(async (handleText: string) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const clean = handleText.trim().replace(/^@/, '').toLowerCase();
      if (!clean) {
        setErrorMessage('Please enter a valid X handle.');
        return false;
      }

      const res = await createOrGetApplication(clean);

      setApplication(res.application);
      setXHandleInput(res.application.x_handle);
      if (res.application.wallet_address) setWalletInput(res.application.wallet_address);
      if (res.application.comment_link) setCommentLinkInput(res.application.comment_link);

      // Save returned UUID to localStorage as applicationId
      const realUuid = res.application.id;
      localStorage.setItem('applicationId', realUuid);
      localStorage.setItem('wardlings_active_identifier', realUuid);

      console.log('[useWhitelist] Stored returned UUID in localStorage as applicationId:', localStorage.getItem('applicationId'));

      // Merge tasks with localStorage
      let localCompleted: string[] = [];
      try {
        const raw = localStorage.getItem(`wardlings_completed_tasks_${res.application.x_handle}`);
        if (raw) localCompleted = JSON.parse(raw);
      } catch (e) {
        // ignore
      }

      const taskMap = new Map<string, TaskProgress>();
      res.tasks.forEach(t => taskMap.set(t.task_name, t));
      localCompleted.forEach(tName => {
        const existing = taskMap.get(tName);
        taskMap.set(tName, {
          id: existing?.id || `local-${tName}`,
          application_id: realUuid,
          task_name: tName,
          completed: true,
          completed_at: existing?.completed_at || new Date().toISOString()
        });
      });

      const mergedTasks = Array.from(taskMap.values());
      setTasks(mergedTasks);

      if (res.isExisting) {
        setSuccessMessage('Welcome back! Restored your application progress from the Sanctuary.');
        if (res.application.completed || res.application.comment_link) {
          setCurrentStep(5);
        } else if (res.application.wallet_address) {
          setCurrentStep(4);
        } else {
          const allDone = SOCIAL_TASKS.every(st => mergedTasks.some(t => t.task_name === st.id && t.completed));
          setCurrentStep(allDone ? 3 : 2);
        }
      } else {
        // Fresh application created in Supabase
        setCurrentStep(2);
      }
      return true;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize whitelist application in Supabase.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Step 2 Social Task completion
  const toggleSocialTask = useCallback(async (taskName: string) => {
    setErrorMessage(null);

    // 1. Mark as completed in local state immediately
    setTasks(prev => {
      const exists = prev.some(t => t.task_name === taskName);
      if (exists) {
        return prev.map(t => t.task_name === taskName ? { ...t, completed: true } : t);
      }
      return [
        ...prev,
        {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          application_id: application?.id || 'local',
          task_name: taskName,
          completed: true,
          completed_at: new Date().toISOString()
        }
      ];
    });

    // Save to LocalStorage cache
    if (xHandleInput) {
      try {
        const cleanHandle = xHandleInput.trim().replace(/^@/, '').toLowerCase();
        const key = `wardlings_completed_tasks_${cleanHandle}`;
        const raw = localStorage.getItem(key);
        const existing: string[] = raw ? JSON.parse(raw) : [];
        if (!existing.includes(taskName)) {
          existing.push(taskName);
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } catch (e) {
        // ignore
      }
    }

    // 2. Save to Supabase and wait for update to complete
    if (application?.id) {
      try {
        const res = await saveTaskProgress(application.id, taskName, true);
        if (res.success && res.tasks && res.tasks.length > 0) {
          setTasks(prev => {
            const taskMap = new Map<string, TaskProgress>();
            // Keep current local tasks first
            prev.forEach(t => taskMap.set(t.task_name, t));
            // Overlay DB tasks ensuring completed = true is preserved
            res.tasks.forEach(dbTask => {
              const localTask = taskMap.get(dbTask.task_name);
              taskMap.set(dbTask.task_name, {
                ...dbTask,
                completed: Boolean(dbTask.completed || localTask?.completed)
              });
            });
            return Array.from(taskMap.values());
          });
        }

        // Check if all tasks are completed
        setTasks(currentTasks => {
          const allDoneNow = SOCIAL_TASKS.every(st =>
            currentTasks.some(t => t.task_name === st.id && t.completed)
          );

          if (allDoneNow) {
            updateStep(application.id, 3).then(() => {
              setApplication(prev => prev ? { ...prev, current_step: 3 } : null);
            });
          }
          return currentTasks;
        });
      } catch (err: any) {
        console.warn('Supabase task save error:', err);
      }
    }
  }, [application, xHandleInput]);

  // Proceed to Step 3 (Wallet) after social tasks
  const proceedToStep3Wallet = useCallback(async () => {
    if (!areAllSocialTasksCompleted()) {
      setErrorMessage('Please complete all social tasks before continuing.');
      return false;
    }
    if (application) {
      await updateStep(application.id, 3);
    }
    setCurrentStep(3);
    return true;
  }, [application, areAllSocialTasksCompleted]);

  // Step 3 Submit: Wallet address
  const submitStep3Wallet = useCallback(async (walletAddr: string) => {
    if (!application) return false;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await updateWalletAddress(application.id, walletAddr);
      if (res.success && res.application) {
        setApplication(res.application);
        setWalletInput(res.application.wallet_address || walletAddr);
        setCurrentStep(4);
        return true;
      } else {
        setErrorMessage(res.error || 'Failed to save wallet address.');
        return false;
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error saving wallet address to Supabase.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [application]);

  // Step 4 Submit: Comment link
  const submitStep4CommentLink = useCallback(async (linkUrl: string) => {
    if (!application) return false;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await submitCommentLink(application.id, linkUrl);
      if (res.success && res.application) {
        setApplication(res.application);
        setCommentLinkInput(res.application.comment_link || linkUrl);
        setCurrentStep(5); // Final confirmation step
        return true;
      } else {
        setErrorMessage(res.error || 'Failed to save comment link.');
        return false;
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error saving comment link to Supabase.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [application]);

  return {
    application,
    tasks,
    currentStep,
    setCurrentStep,
    xHandleInput,
    setXHandleInput,
    walletInput,
    setWalletInput,
    commentLinkInput,
    setCommentLinkInput,
    isLoading,
    isSubmitting,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    isTaskCompleted,
    areAllSocialTasksCompleted,
    restoreApplication,
    submitStep1Handle,
    toggleSocialTask,
    proceedToStep3Wallet,
    submitStep3Wallet,
    submitStep4CommentLink
  };
}
