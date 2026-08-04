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

  const walletError = getWalletError(formData.walletAddress);
  const xHandleError = getXHandleError(formData.xHandle);
  const commentLinkError = getCommentLinkError(formData.commentLink);
  const reasonError = getReasonError(formData.reason);

  const isFormValid =
    !walletError &&
    !xHandleError &&
    !commentLinkError &&
    !reasonError &&
    formData.confirmed;

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
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
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

              {/* Required Steps Tasks */}
              <div className="bg-[#FBF9F5] p-5 sm:p-6 rounded-[24px] border border-[#ECE7DF] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#ECE7DF]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C544B]">
                    Required Steps
                  </span>
                  <span className="text-xs font-bold text-[#5E7D3A]">
                    {Object.values(checklist).filter(Boolean).length}/4 Done
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    type="button"
                    onClick={() => {
                      toggleChecklist('followX');
                      window.open('https://x.com/wardlingsnft', '_blank', 'noopener,noreferrer');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#ECE7DF] hover:border-[#5E7D3A] transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {checklist.followX ? (
                        <CheckCircle className="w-5 h-5 text-[#5E7D3A] shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-[#5C544B] group-hover:text-[#5E7D3A] shrink-0" />
                      )}
                      <span className="text-xs font-bold text-[#2B241F]">
                        Follow @wardlingsnft on X
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#5C544B] group-hover:text-[#5E7D3A] shrink-0" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    type="button"
                    onClick={() => {
                      toggleChecklist('likePost');
                      window.open('https://x.com/wardlingsnft', '_blank', 'noopener,noreferrer');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#ECE7DF] hover:border-[#5E7D3A] transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {checklist.likePost ? (
                        <CheckCircle className="w-5 h-5 text-[#5E7D3A] shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-[#5C544B] group-hover:text-[#5E7D3A] shrink-0" />
                      )}
                      <span className="text-xs font-bold text-[#2B241F]">
                        Like the pinned post
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#5C544B] group-hover:text-[#5E7D3A] shrink-0" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    type="button"
                    onClick={() => {
                      toggleChecklist('repostPost');
                      window.open('https://x.com/wardlingsnft', '_blank', 'noopener,noreferrer');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#ECE7DF] hover:border-[#5E7D3A] transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {checklist.repostPost ? (
                        <CheckCircle className="w-5 h-5 text-[#5E7D3A] shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-[#5C544B] group-hover:text-[#5E7D3A] shrink-0" />
                      )}
                      <span className="text-xs font-bold text-[#2B241F]">
                        Repost the pinned post
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#5C544B] group-hover:text-[#5E7D3A] shrink-0" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    type="button"
                    onClick={() => {
                      toggleChecklist('commentPost');
                      window.open('https://x.com/wardlingsnft', '_blank', 'noopener,noreferrer');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#ECE7DF] hover:border-[#5E7D3A] transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {checklist.commentPost ? (
                        <CheckCircle className="w-5 h-5 text-[#5E7D3A] shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-[#5C544B] group-hover:text-[#5E7D3A] shrink-0" />
                      )}
                      <span className="text-xs font-bold text-[#2B241F]">
                        Comment on the pinned post
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#5C544B] group-hover:text-[#5E7D3A] shrink-0" />
                  </motion.button>
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
                    }}
                    className="text-xs font-bold text-[#5E7D3A] underline hover:text-[#4E6A2E] cursor-pointer pt-2 inline-block"
                  >
                    Submit another response
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Ethereum Wallet Address */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#2B241F]">
                      Ethereum Wallet Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      disabled={isSubmitting}
                      value={formData.walletAddress}
                      onChange={(e) => {
                        setFormData({ ...formData, walletAddress: e.target.value });
                        if (errorMessage) setErrorMessage('');
                      }}
                      onBlur={() => handleBlur('walletAddress')}
                      className={`w-full px-4 py-3 rounded-2xl bg-white border text-sm font-mono text-[#2B241F] placeholder-[#5C544B]/40 outline-hidden transition-all disabled:opacity-60 ${
                        touched.walletAddress && walletError
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-[#ECE7DF] focus:border-[#5E7D3A] focus:ring-2 focus:ring-[#5E7D3A]/20'
                      }`}
                    />
                    {touched.walletAddress && walletError && (
                      <p className="text-xs font-medium text-red-600 pt-0.5">{walletError}</p>
                    )}
                  </div>

                  {/* X Handle & Comment Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#2B241F]">
                        X Handle <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="@yourhandle"
                        disabled={isSubmitting}
                        value={formData.xHandle}
                        onChange={(e) => {
                          setFormData({ ...formData, xHandle: e.target.value });
                          if (errorMessage) setErrorMessage('');
                        }}
                        onBlur={() => handleBlur('xHandle')}
                        className={`w-full px-4 py-3 rounded-2xl bg-white border text-sm text-[#2B241F] placeholder-[#5C544B]/40 outline-hidden transition-all disabled:opacity-60 ${
                          touched.xHandle && xHandleError
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-[#ECE7DF] focus:border-[#5E7D3A] focus:ring-2 focus:ring-[#5E7D3A]/20'
                        }`}
                      />
                      {touched.xHandle && xHandleError && (
                        <p className="text-xs font-medium text-red-600 pt-0.5">{xHandleError}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#2B241F]">
                        Comment Link <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://x.com/..."
                        disabled={isSubmitting}
                        value={formData.commentLink}
                        onChange={(e) => {
                          setFormData({ ...formData, commentLink: e.target.value });
                          if (errorMessage) setErrorMessage('');
                        }}
                        onBlur={() => handleBlur('commentLink')}
                        className={`w-full px-4 py-3 rounded-2xl bg-white border text-sm text-[#2B241F] placeholder-[#5C544B]/40 outline-hidden transition-all disabled:opacity-60 ${
                          touched.commentLink && commentLinkError
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-[#ECE7DF] focus:border-[#5E7D3A] focus:ring-2 focus:ring-[#5E7D3A]/20'
                        }`}
                      />
                      {touched.commentLink && commentLinkError && (
                        <p className="text-xs font-medium text-red-600 pt-0.5">{commentLinkError}</p>
                      )}
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <label className="flex items-center gap-3 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      disabled={isSubmitting}
                      checked={formData.confirmed}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmed: e.target.checked })
                      }
                      className="w-4 h-4 rounded-md accent-[#5E7D3A] border-[#ECE7DF] cursor-pointer disabled:opacity-60"
                    />
                    <span className="text-xs font-medium text-[#5C544B]">
                      I confirm all information is correct.
                    </span>
                  </label>

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
                          <span>Submitting...</span>
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
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
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
