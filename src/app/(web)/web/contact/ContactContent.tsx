"use client";

import React, { useState, useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Send, CheckCircle2, Mail, MessageSquare, Tag, Loader2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/modules/web/Navbar";
import Footer from "@/modules/web/Footer";

export default function ContactContent() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.user.getCurrentUser);

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Prefill email if user is logged in
  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !subject.trim() || !description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          subject,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      toast.success("Message sent successfully!");
      setIsSuccess(true);
      setSubject("");
      setDescription("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#030303] min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative flex flex-col justify-between">
      <Navbar />

      {/* Decorative Gradients for Premium Aesthetics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-gradient-to-b from-blue-500/[0.02] via-indigo-500/[0.01] to-transparent blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[5%] w-[350px] h-[350px] bg-blue-500/[0.01] blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-indigo-500/[0.01] blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-44 pb-28 w-full flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center w-full">
          
          {/* Left Column: Heading and Brand Info */}
          <div className="lg:col-span-5 flex flex-col text-left space-y-10">
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-4xl md:text-5xl font-medium tracking-tight text-white font-pop leading-tight"
              >
                Contact our team
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                className="text-neutral-400 text-sm md:text-[15px] leading-relaxed max-w-md"
              >
                Have a question about our platform, enterprise features, billing, or custom plans? Let us know and we'll be in touch.
              </motion.p>
            </div>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className="space-y-6 pt-8 border-t border-white/[0.06] max-w-md"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-neutral-400 shrink-0 shadow-sm">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest">Email Support</p>
                  <a href="mailto:support@wekraft.xyz" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors mt-1 block">
                    support@wekraft.xyz
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-neutral-400 shrink-0 shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest">Response Time</p>
                  <p className="text-sm font-medium text-neutral-300 mt-1">
                    Within 24 hours
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Premium Form Card */}
          <div className="lg:col-span-7 w-full flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className="w-full max-w-lg bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.06] p-8 md:p-10 rounded-3xl shadow-2xl relative"
            >
              {/* Top highlight glow */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-3xl" />
              
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 relative z-10"
                  >
                    {/* Email Address */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Your Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-neutral-500">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="w-full pl-11 pr-4 py-3 bg-[#121316]/40 border border-white/[0.06] focus:border-white/20 focus:bg-[#121316]/70 rounded-xl text-sm placeholder-neutral-600 focus:outline-none transition-all duration-200 focus:ring-1 focus:ring-white/10"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Subject
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-neutral-500">
                          <Tag className="h-4 w-4" />
                        </div>
                        <input
                          id="subject"
                          type="text"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="What is this regarding?"
                          className="w-full pl-11 pr-4 py-3 bg-[#121316]/40 border border-white/[0.06] focus:border-white/20 focus:bg-[#121316]/70 rounded-xl text-sm placeholder-neutral-600 focus:outline-none transition-all duration-200 focus:ring-1 focus:ring-white/10"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label htmlFor="description" className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Description
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-4.5 flex items-center justify-center pointer-events-none text-neutral-500">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <textarea
                          id="description"
                          required
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Please provide details about your request..."
                          className="w-full pl-11 pr-4 py-3.5 bg-[#121316]/40 border border-white/[0.06] focus:border-white/20 focus:bg-[#121316]/70 rounded-xl text-sm placeholder-neutral-600 focus:outline-none resize-none transition-all duration-200 focus:ring-1 focus:ring-white/10"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-medium text-sm transition-all duration-300 bg-white hover:bg-neutral-100 text-black cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.02)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.08)] flex items-center justify-center gap-2 group border-none"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-black" />
                          <span>Sending inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Message</span>
                          <Send className="h-3.5 w-3.5 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-250" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-view"
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    className="text-center py-6 flex flex-col items-center justify-center space-y-5"
                  >
                    <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mb-1">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white tracking-tight">
                      Message sent successfully
                    </h3>
                    <p className="text-neutral-400 text-xs md:text-sm leading-relaxed max-w-sm">
                      We've received your message. Our team will get back to you at <span className="text-white font-medium">{email}</span> within 24 hours.
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full justify-center">
                      <Button
                        onClick={() => setIsSuccess(false)}
                        variant="outline"
                        className="border-white/[0.08] hover:bg-white/5 text-white hover:text-white rounded-xl cursor-pointer text-xs py-2"
                      >
                        Send another message
                      </Button>
                      <Button
                        onClick={() => router.push("/")}
                        className="bg-white hover:bg-neutral-200 text-black rounded-xl cursor-pointer text-xs py-2"
                      >
                        Return to home
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
