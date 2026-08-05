import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, CheckCircle, Square, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { WhitelistFormData, WhitelistChecklistState } from '../types';
import { submitWhitelistApplication } from '../lib/api';

export const WhitelistSection: React.FC = () => {
  const [checklist, setChecklist] = useState<WhitelistChecklistState>({
    followX: false,
    likePost: false,
    repostPost: false,
    commentPost: false,
  });

  const [formData, setFormData] = useState<WhitelistFormData>({
    walletAddress: '',
    xHandle: '',
    commentLink: '',
    reason: '',
    confirmed: false,
  });

  const [touched, setTouched] = useState<{
    walletAddress?: boolean;
    xHandle?: boolean;
    commentLink?: boolean;
    reason?: boolean;
  }>({});

  const [submitted, setSubmitted] = useState(false);
  const [submittedWalletAddress, setSubmittedWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const toggleChecklist = (key: keyof WhitelistChecklistState) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Field Validation Helpers
  const getWalletError = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return 'Ethereum Wallet Address is required.';
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return 'Ethereum Wallet Address must be a valid Ethereum address (starting with 0x, 42 chars).';
    }
    return '';
  };

  const getXHandleError = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return 'X Handle is required.';
    const formatted = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
    if (!/^@[a-zA-Z0-9_]{1,15}$/.test(formatted)) {
      return 'X Handle must be a valid X username (e.g. @username).';
    }
    return '';
  };

  const getCommentLinkError = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return 'Comment Link is required.';
    try {
      const parsedUrl = new URL(trimmed);
      const isXHost =
        (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') &&
        (parsedUrl.hostname.toLowerCase() === 'x.com' ||
          parsedUrl.hostname.toLowerCase().endsWith('.x.com') ||
          parsedUrl.hostname.toLowerCase() === 'twitter.com' ||
          parsedUrl.hostname.toLowerCase().endsWith('.twitter.com'));
      if (!isXHost) {
        return 'Comment Link must be a valid x.com or twitter.com URL.';
      }
    } catch {
      return 'Comment Link must be a valid x.com or twitter.com URL.';
    }
    return '';
  };

  const getReasonError = (val: string): string => {
    const trimmed = val.trim();
    if (trimmed.length > 300) return 'Reason must be 300 characters or less.';
    return '';
  };

  // Sequential Step Unlocking Logic (8 Steps in total)
  // Step 1: Follow @wardlingsnft on X
  const step1Done = checklist.followX;

  // Step 2: Like the pinned post
  const step2Unlocked = step1Done;
  const step2Done = step2Unlocked && checklist.likePost;

  // Step 3: Repost the pinned post
  const step3Unlocked = step2Done;
  const step3Done = step3Unlocked && checklist.repostPost;

  // Step 4: Comment on the pinned post
  const step4Unlocked = step3Done;
  const step4Done = step4Unlocked && checklist.commentPost;

  // Step 5: Ethereum Wallet Address
  const step5Unlocked = step4Done;
  const walletError = getWalletError(formData.walletAddress);
  const step5Done = step5Unlocked && formData.walletAddress.trim() !== '' && !walletError;

  // Step 6: X Handle
  const step6Unlocked = step5Done;
  const xHandleError = getXHandleError(formData.xHandle);
  const step6Done = step6Unlocked && formData.xHandle.trim() !== '' && !xHandleError;

  // Step 7: Comment Link
  const step7Unlocked = step6Done;
  const commentLinkError = getCommentLinkError(formData.commentLink);
  const step7Done = step7Unlocked && formData.commentLink.trim() !== '' && !commentLinkError;

  // Step 8: Confirmation checkbox
  const step8Unlocked = step7Done;
  const step8Done = step8Unlocked && formData.confirmed;

  const completedCount = [
    step1Done,
    step2Done,
    step3Done,
    step4Done,
    step5Done,
    step6Done,
    step7Done,
    step8Done,
  ].filter(Boolean).length;

  const currentStepNumber = Math.min(completedCount + 1, 8);
  const progressPercent = Math.round((completedCount / 8) * 100);

  const isFormValid = step8Done;

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submission if already submitting
    if (isSubmitting) return;

    setErrorMessage('');
    setSuccessMessage('');

    // Mark fields touched
    setTouched({
      walletAddress: true,
      xHandle: true,
      commentLink: true,
      reason: true,
    });

    if (!isFormValid) {
      if (walletError) setErrorMessage(walletError);
      else if (xHandleError) setErrorMessage(xHandleError);
      else if (commentLinkError) setErrorMessage(commentLinkError);
      else if (reasonError) setErrorMessage(reasonError);
      else if (!formData.confirmed) setErrorMessage('Please confirm all information is correct.');
      return;
    }

    // Rate limiting check (1 submission per 60 seconds per browser)
    const LAST_SUBMIT_KEY = 'wardlings_last_whitelist_submit';
    const lastSubmitStr = localStorage.getItem(LAST_SUBMIT_KEY);
    if (lastSubmitStr) {
      const lastSubmitTime = parseInt(lastSubmitStr, 10);
      const elapsed = Date.now() - lastSubmitTime;
      if (elapsed < 60000) {
        const secondsLeft = Math.ceil((60000 - elapsed) / 1000);
        setErrorMessage(`Please wait ${secondsLeft} seconds before submitting another application.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const result = await submitWhitelistApplication({
        walletAddress: formData.walletAddress,
        xHandle: formData.xHandle,
        commentLink: formData.commentLink,
        reason: formData.reason,
        followed: checklist.followX,
        liked: checklist.likePost,
        reposted: checklist.repostPost,
        commented: checklist.commentPost,
      });

      if (result.success) {
        // Brief artificial delay for verification perception
        await new Promise((resolve) => setTimeout(resolve, 850));

        // Record timestamp for rate limiting
        localStorage.setItem(LAST_SUBMIT_KEY, Date.now().toString());

        setSubmittedWalletAddress(formData.walletAddress.trim());
        setSuccessMessage('🎉 Your whitelist application has been submitted successfully.');
        setSubmitted(true);

        // Reset form inputs only after successful submission
        setFormData({
          walletAddress: '',
          xHandle: '',
          commentLink: '',
          reason: '',
          confirmed: false,
        });
        setTouched({});
        setChecklist({
          followX: false,
          likePost: false,
          repostPost: false,
          commentPost: false,
        });
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } catch (err: any) {
      console.error('Whitelist application submission error:', err);
      const msg = err?.message || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="whitelist" className="py-16 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Section Card: Rounded white card (32px radius) with soft shadow */}
        <div className="bg-white rounded-[32px] border border-[#ECE7DF] p-6 sm:p-10 lg:p-12 wardling-card-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Whitelist Form & Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="lg:col-span-6 space-y-8"
            >
              {/* Header */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBF9F5] border border-[#ECE7DF] text-xs font-bold text-[#5E7D3A] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#5E7D3A]" />
                  WHITELIST APPLICATION
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2B241F] font-heading">
                  Become a Keeper
                </h2>
                <p className="text-base text-[#5C544B]">
                  Complete every step before submitting your whitelist application.
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="bg-[#FBF9F5] p-4 sm:p-5 rounded-[24px] border border-[#ECE7DF] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#2B241F]">
                  <span className="uppercase tracking-wider text-[#5C544B]">
                    {completedCount === 8 ? 'All 8 Steps Completed!' : `Step ${currentStepNumber} of 8`}
                  </span>
                  <span className="text-[#5E7D3A] font-mono font-extrabold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#ECE7DF] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#5E7D3A] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Form or Submitted Success View */}
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#5E7D3A]/10 border border-[#5E7D3A]/30 p-8 rounded-[24px] text-center space-y-4"
                >
                  <div className="w-14 h-14 bg-[#5E7D3A] text-white rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2B241F] font-heading">
                    {successMessage || '🎉 Your whitelist application has been submitted successfully.'}
                  </h3>
                  <p className="text-sm text-[#5C544B] max-w-md mx-auto leading-relaxed">
                    Thank you for applying to become a Keeper in the Wardlings Sanctuary.
                    {submittedWalletAddress && (
                      <>
                        {' '}Your application is recorded for address{' '}
                        <span className="font-mono font-semibold text-[#2B241F]">
                          {submittedWalletAddress.slice(0, 6)}...{submittedWalletAddress.slice(-4)}
                        </span>
                        .
                      </>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setSubmittedWalletAddress('');
                      setErrorMessage('');
                      setSuccessMessage('');
                      setFormData({
                        walletAddress: '',
                        xHandle: '',
                        commentLink: '',
                        reason: '',
                        confirmed: false,
                      });
                      setTouched({});
                      setChecklist({
                        followX: false,
                        likePost: false,
                        repostPost: false,
                        commentPost: false,
                      });
                    }}
                    className="text-xs font-bold text-[#5E7D3A] underline hover:text-[#4E6A2E] cursor-pointer pt-2 inline-block"
                  >
                    Submit another response
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Step 1: Follow @wardlingsnft on X */}
                  <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      step1Done
                        ? 'bg-[#5E7D3A]/5 border-[#5E7D3A]/40'
                        : 'bg-white border-[#ECE7DF] hover:border-[#5E7D3A]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        toggleChecklist('followX');
                        window.open('https://x.com/wardlingsnft', '_blank', 'noopener,noreferrer');
                      }}
                      className="w-full flex items-center justify-between text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            step1Done ? 'bg-[#5E7D3A] text-white' : 'bg-[#FBF9F5] text-[#5E7D3A] border border-[#ECE7DF]'
                          }`}
                        >
                          {step1Done ? <Check className="w-3.5 h-3.5" /> : '1'}
                        </div>
                        <span className="text-xs font-bold text-[#2B241F]">
                          1. Follow @wardlingsnft on X
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {step1Done && (
                          <span className="text-[10px] font-bold text-[#5E7D3A] bg-[#5E7D3A]/10 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                        <ExternalLink className="w-3.5 h-3.5 text-[#5C544B] group-hover:text-[#5E7D3A]" />
                      </div>
                    </button>
                  </motion.div>

                  {/* Step 2: Like the pinned post */}
                  <motion.div
                    initial={{ opacity: 0.4, y: 4 }}
                    animate={{ opacity: step2Unlocked ? 1 : 0.4, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      step2Done
                        ? 'bg-[#5E7D3A]/5 border-[#5E7D3A]/40'
                        : step2Unlocked
                        ? 'bg-white border-[#ECE7DF] hover:border-[#5E7D3A]'
                        : 'bg-[#FBF9F5] border-[#ECE7DF]/80 opacity-40 pointer-events-none'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={!step2Unlocked}
                      onClick={() => {
                        if (!step2Unlocked) return;
                        toggleChecklist('likePost');
                        window.open('https://x.com/wardlingsnft', '_blank', 'noopener,noreferrer');
                      }}
                      className={`w-full flex items-center justify-between text-left group ${
                        step2Unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            step2Done
                              ? 'bg-[#5E7D3A] text-white'
                              : step2Unlocked
                              ? 'bg-[#FBF9F5] text-[#5E7D3A] border border-[#ECE7DF]'
                              : 'bg-[#ECE7DF]/60 text-[#5C544B]/60'
                          }`}
                        >
                          {step2Done ? <Check className="w-3.5 h-3.5" /> : '2'}
                        </div>
                        <span className="text-xs font-bold text-[#2B241F]">
                          2. Like the pinned post
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {step2Done && (
                          <span className="text-[10px] font-bold text-[#5E7D3A] bg-[#5E7D3A]/10 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                        <ExternalLink className={`w-3.5 h-3.5 ${step2Unlocked ? 'text-[#5C544B] group-hover:text-[#5E7D3A]' : 'text-[#5C544B]/40'}`} />
                      </div>
                    </button>
                  </motion.div>

                  {/* Step 3: Repost the pinned post */}
                  <motion.div
                    initial={{ opacity: 0.4, y: 4 }}
                    animate={{ opacity: step3Unlocked ? 1 : 0.4, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      step3Done
                        ? 'bg-[#5E7D3A]/5 border-[#5E7D3A]/40'
                        : step3Unlocked
                        ? 'bg-white border-[#ECE7DF] hover:border-[#5E7D3A]'
                        : 'bg-[#FBF9F5] border-[#ECE7DF]/80 opacity-40 pointer-events-none'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={!step3Unlocked}
                      onClick={() => {
                        if (!step3Unlocked) return;
                        toggleChecklist('repostPost');
                        window.open('https://x.com/wardlingsnft', '_blank', 'noopener,noreferrer');
                      }}
                      className={`w-full flex items-center justify-between text-left group ${
                        step3Unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            step3Done
                              ? 'bg-[#5E7D3A] text-white'
                              : step3Unlocked
                              ? 'bg-[#FBF9F5] text-[#5E7D3A] border border-[#ECE7DF]'
                              : 'bg-[#ECE7DF]/60 text-[#5C544B]/60'
                          }`}
                        >
                          {step3Done ? <Check className="w-3.5 h-3.5" /> : '3'}
                        </div>
                        <span className="text-xs font-bold text-[#2B241F]">
                          3. Repost the pinned post
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {step3Done && (
                          <span className="text-[10px] font-bold text-[#5E7D3A] bg-[#5E7D3A]/10 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                        <ExternalLink className={`w-3.5 h-3.5 ${step3Unlocked ? 'text-[#5C544B] group-hover:text-[#5E7D3A]' : 'text-[#5C544B]/40'}`} />
                      </div>
                    </button>
                  </motion.div>

                  {/* Step 4: Comment on the pinned post */}
                  <motion.div
                    initial={{ opacity: 0.4, y: 4 }}
                    animate={{ opacity: step4Unlocked ? 1 : 0.4, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      step4Done
                        ? 'bg-[#5E7D3A]/5 border-[#5E7D3A]/40'
                        : step4Unlocked
                        ? 'bg-white border-[#ECE7DF] hover:border-[#5E7D3A]'
                        : 'bg-[#FBF9F5] border-[#ECE7DF]/80 opacity-40 pointer-events-none'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={!step4Unlocked}
                      onClick={() => {
                        if (!step4Unlocked) return;
                        toggleChecklist('commentPost');
                        window.open('https://x.com/wardlingsnft', '_blank', 'noopener,noreferrer');
                      }}
                      className={`w-full flex items-center justify-between text-left group ${
                        step4Unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            step4Done
                              ? 'bg-[#5E7D3A] text-white'
                              : step4Unlocked
                              ? 'bg-[#FBF9F5] text-[#5E7D3A] border border-[#ECE7DF]'
                              : 'bg-[#ECE7DF]/60 text-[#5C544B]/60'
                          }`}
                        >
                          {step4Done ? <Check className="w-3.5 h-3.5" /> : '4'}
                        </div>
                        <span className="text-xs font-bold text-[#2B241F]">
                          4. Comment on the pinned post
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {step4Done && (
                          <span className="text-[10px] font-bold text-[#5E7D3A] bg-[#5E7D3A]/10 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                        <ExternalLink className={`w-3.5 h-3.5 ${step4Unlocked ? 'text-[#5C544B] group-hover:text-[#5E7D3A]' : 'text-[#5C544B]/40'}`} />
                      </div>
                    </button>
                  </motion.div>

                  {/* Step 5: Ethereum Wallet Address */}
                  <motion.div
                    initial={{ opacity: 0.4, y: 4 }}
                    animate={{ opacity: step5Unlocked ? 1 : 0.4, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`space-y-1.5 p-3.5 rounded-2xl border transition-all ${
                      step5Done
                        ? 'bg-[#5E7D3A]/5 border-[#5E7D3A]/40'
                        : step5Unlocked
                        ? 'bg-white border-[#ECE7DF]'
                        : 'bg-[#FBF9F5] border-[#ECE7DF]/80 opacity-40 pointer-events-none'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            step5Done
                              ? 'bg-[#5E7D3A] text-white'
                              : step5Unlocked
                              ? 'bg-[#FBF9F5] text-[#5E7D3A] border border-[#ECE7DF]'
                              : 'bg-[#ECE7DF]/60 text-[#5C544B]/60'
                          }`}
                        >
                          {step5Done ? <Check className="w-3.5 h-3.5" /> : '5'}
                        </div>
                        <label className="text-xs font-bold text-[#2B241F]">
                          5. Ethereum Wallet Address <span className="text-red-500">*</span>
                        </label>
                      </div>
                      {step5Done && (
                        <span className="text-[10px] font-bold text-[#5E7D3A] bg-[#5E7D3A]/10 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="0x..."
                      disabled={!step5Unlocked || isSubmitting}
                      value={formData.walletAddress}
                      onChange={(e) => {
                        setFormData({ ...formData, walletAddress: e.target.value });
                        if (errorMessage) setErrorMessage('');
                      }}
                      onBlur={() => handleBlur('walletAddress')}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm font-mono text-[#2B241F] placeholder-[#5C544B]/40 outline-hidden transition-all disabled:bg-[#FBF9F5] disabled:cursor-not-allowed ${
                        touched.walletAddress && walletError
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : step5Done
                          ? 'border-[#5E7D3A]/40 focus:border-[#5E7D3A]'
                          : 'border-[#ECE7DF] focus:border-[#5E7D3A] focus:ring-2 focus:ring-[#5E7D3A]/20'
                      }`}
                    />
                    {touched.walletAddress && walletError && (
                      <p className="text-xs font-medium text-red-600 pt-0.5 pl-1">{walletError}</p>
                    )}
                  </motion.div>

                  {/* Step 6: X Handle */}
                  <motion.div
                    initial={{ opacity: 0.4, y: 4 }}
                    animate={{ opacity: step6Unlocked ? 1 : 0.4, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`space-y-1.5 p-3.5 rounded-2xl border transition-all ${
                      step6Done
                        ? 'bg-[#5E7D3A]/5 border-[#5E7D3A]/40'
                        : step6Unlocked
                        ? 'bg-white border-[#ECE7DF]'
                        : 'bg-[#FBF9F5] border-[#ECE7DF]/80 opacity-40 pointer-events-none'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            step6Done
                              ? 'bg-[#5E7D3A] text-white'
                              : step6Unlocked
                              ? 'bg-[#FBF9F5] text-[#5E7D3A] border border-[#ECE7DF]'
                              : 'bg-[#ECE7DF]/60 text-[#5C544B]/60'
                          }`}
                        >
                          {step6Done ? <Check className="w-3.5 h-3.5" /> : '6'}
                        </div>
                        <label className="text-xs font-bold text-[#2B241F]">
                          6. X Handle <span className="text-red-500">*</span>
                        </label>
                      </div>
                      {step6Done && (
                        <span className="text-[10px] font-bold text-[#5E7D3A] bg-[#5E7D3A]/10 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="@yourhandle"
                      disabled={!step6Unlocked || isSubmitting}
                      value={formData.xHandle}
                      onChange={(e) => {
                        setFormData({ ...formData, xHandle: e.target.value });
                        if (errorMessage) setErrorMessage('');
                      }}
                      onBlur={() => handleBlur('xHandle')}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-[#2B241F] placeholder-[#5C544B]/40 outline-hidden transition-all disabled:bg-[#FBF9F5] disabled:cursor-not-allowed ${
                        touched.xHandle && xHandleError
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : step6Done
                          ? 'border-[#5E7D3A]/40 focus:border-[#5E7D3A]'
                          : 'border-[#ECE7DF] focus:border-[#5E7D3A] focus:ring-2 focus:ring-[#5E7D3A]/20'
                      }`}
                    />
                    {touched.xHandle && xHandleError && (
                      <p className="text-xs font-medium text-red-600 pt-0.5 pl-1">{xHandleError}</p>
                    )}
                  </motion.div>

                  {/* Step 7: Comment Link */}
                  <motion.div
                    initial={{ opacity: 0.4, y: 4 }}
                    animate={{ opacity: step7Unlocked ? 1 : 0.4, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`space-y-1.5 p-3.5 rounded-2xl border transition-all ${
                      step7Done
                        ? 'bg-[#5E7D3A]/5 border-[#5E7D3A]/40'
                        : step7Unlocked
                        ? 'bg-white border-[#ECE7DF]'
                        : 'bg-[#FBF9F5] border-[#ECE7DF]/80 opacity-40 pointer-events-none'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            step7Done
                              ? 'bg-[#5E7D3A] text-white'
                              : step7Unlocked
                              ? 'bg-[#FBF9F5] text-[#5E7D3A] border border-[#ECE7DF]'
                              : 'bg-[#ECE7DF]/60 text-[#5C544B]/60'
                          }`}
                        >
                          {step7Done ? <Check className="w-3.5 h-3.5" /> : '7'}
                        </div>
                        <label className="text-xs font-bold text-[#2B241F]">
                          7. Comment Link <span className="text-red-500">*</span>
                        </label>
                      </div>
                      {step7Done && (
                        <span className="text-[10px] font-bold text-[#5E7D3A] bg-[#5E7D3A]/10 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="https://x.com/..."
                      disabled={!step7Unlocked || isSubmitting}
                      value={formData.commentLink}
                      onChange={(e) => {
                        setFormData({ ...formData, commentLink: e.target.value });
                        if (errorMessage) setErrorMessage('');
                      }}
                      onBlur={() => handleBlur('commentLink')}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-[#2B241F] placeholder-[#5C544B]/40 outline-hidden transition-all disabled:bg-[#FBF9F5] disabled:cursor-not-allowed ${
                        touched.commentLink && commentLinkError
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : step7Done
                          ? 'border-[#5E7D3A]/40 focus:border-[#5E7D3A]'
                          : 'border-[#ECE7DF] focus:border-[#5E7D3A] focus:ring-2 focus:ring-[#5E7D3A]/20'
                      }`}
                    />
                    {touched.commentLink && commentLinkError && (
                      <p className="text-xs font-medium text-red-600 pt-0.5 pl-1">{commentLinkError}</p>
                    )}
                  </motion.div>

                  {/* Step 8: Confirmation Checkbox */}
                  <motion.div
                    initial={{ opacity: 0.4, y: 4 }}
                    animate={{ opacity: step8Unlocked ? 1 : 0.4, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      step8Done
                        ? 'bg-[#5E7D3A]/5 border-[#5E7D3A]/40'
                        : step8Unlocked
                        ? 'bg-white border-[#ECE7DF]'
                        : 'bg-[#FBF9F5] border-[#ECE7DF]/80 opacity-40 pointer-events-none'
                    }`}
                  >
                    <label className={`flex items-center justify-between select-none ${step8Unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            step8Done
                              ? 'bg-[#5E7D3A] text-white'
                              : step8Unlocked
                              ? 'bg-[#FBF9F5] text-[#5E7D3A] border border-[#ECE7DF]'
                              : 'bg-[#ECE7DF]/60 text-[#5C544B]/60'
                          }`}
                        >
                          {step8Done ? <Check className="w-3.5 h-3.5" /> : '8'}
                        </div>
                        <input
                          type="checkbox"
                          disabled={!step8Unlocked || isSubmitting}
                          checked={formData.confirmed}
                          onChange={(e) =>
                            setFormData({ ...formData, confirmed: e.target.checked })
                          }
                          className="w-4 h-4 rounded-md accent-[#5E7D3A] border-[#ECE7DF] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        <span className="text-xs font-bold text-[#2B241F]">
                          8. I confirm all information is correct.
                        </span>
                      </div>
                      {step8Done && (
                        <span className="text-[10px] font-bold text-[#5E7D3A] bg-[#5E7D3A]/10 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </label>
                  </motion.div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={isSubmitting || !isFormValid ? {} : { scale: 1.02 }}
                      whileTap={isSubmitting || !isFormValid ? {} : { scale: 0.98 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      type="submit"
                      disabled={isSubmitting || !isFormValid}
                      className={`w-full bg-[#5E7D3A] hover:bg-[#4E6A2E] text-white py-4 rounded-full text-base font-bold shadow-xs transition-colors flex items-center justify-center gap-2 ${
                        isSubmitting || !isFormValid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Verifying application...</span>
                        </>
                      ) : (
                        <span>Join Whitelist</span>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>

            {/* Right Column: Whitelist Illustration */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.42, delay: 0.08, ease: 'easeOut' }}
              className="lg:col-span-6 flex items-end justify-center lg:justify-end p-2 sm:p-4 w-full h-full min-h-[460px] sm:min-h-[580px] lg:min-h-[680px]"
            >
              <img
                src="https://osyvztzqmtimbefklcsn.supabase.co/storage/v1/object/public/assets/Whitelist.png"
                alt="Whitelist Illustration"
                className="w-full h-auto max-w-[850px] max-h-[720px] sm:max-h-[820px] lg:max-h-[920px] object-contain pointer-events-none select-none"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
