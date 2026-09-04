import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import emailjs from '@emailjs/browser';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const recipientEmail = import.meta.env.VITE_CONTACT_EMAIL || 'karthikreddy.kkr77@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in all fields before transmitting.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const isEmailJSConfigured =
      Boolean(serviceId &&
      serviceId !== 'your_service_id_here' &&
      templateId &&
      templateId !== 'your_template_id_here' &&
      publicKey &&
      publicKey !== 'your_public_key_here');

    let isSuccess = false;

    // 1. Try EmailJS first if environment variables are configured
    if (isEmailJSConfigured) {
      try {
        await emailjs.send(
          serviceId!,
          templateId!,
          {
            from_name: formData.name,
            from_email: formData.email,
            name: formData.name,
            email: formData.email,
            message: formData.message,
            reply_to: formData.email,
          },
          publicKey!
        );
        isSuccess = true;
      } catch (emailjsError) {
        console.warn('EmailJS delivery failed, trying direct form endpoint fallback...', emailjsError);
      }
    }

    // 2. Direct endpoint fallback via FormSubmit to ensure messages are never dropped
    if (!isSuccess) {
      try {
        const response = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
            _subject: `Portfolio Transmission from ${formData.name}`,
            _template: 'table',
          }),
        });

        if (response.ok) {
          isSuccess = true;
        } else {
          const resData = await response.json().catch(() => ({}));
          console.error('Direct endpoint error:', resData);
          setErrorMessage(resData.message || 'Direct transmission dispatch failed.');
        }
      } catch (fetchError) {
        console.error('Transmission fetch failed:', fetchError);
        setErrorMessage('Network error during transmission dispatch.');
      }
    }

    setIsSubmitting(false);

    if (isSuccess) {
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } else {
      setSubmitStatus('error');
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  return (
    <footer
      id="contact"
      className="relative w-full bg-[#050505] text-[#E8DFD8] font-sans selection:bg-[#D4AF37] selection:text-black pt-24 pb-14 px-6 sm:px-12 lg:px-20 overflow-hidden border-t border-[#8C6D4F]/20"
    >
      {/* ================= AMBIENT BACKGROUND GLOWS ================= */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/12 w-[34rem] h-[34rem] bg-[#D4AF37] rounded-full blur-[180px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 right-1/12 w-[30rem] h-[30rem] bg-[#8C6D4F] rounded-full blur-[180px] pointer-events-none"
      />

      {/* Subtle Grid Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #D4AF37 1px, transparent 1px), linear-gradient(to bottom, #D4AF37 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* ================= MAIN SPLIT GRID ================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start mb-20"
        >
          
          {/* ================= LEFT PANEL (7 COLS) ================= */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            
            <div>
              {/* Section Label */}
              <motion.div
                variants={fadeUpVariants}
                className="flex items-center space-x-4 mb-6"
              >
                <span
                  className="text-[11px] font-medium tracking-[0.38em] uppercase text-[#D4AF37]"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  05 // CONTACT
                </span>
                <div className="w-20 h-[1px] bg-gradient-to-r from-[#D4AF37]/80 via-[#8C6D4F]/40 to-transparent" />
              </motion.div>

              {/* Main Heading */}
              <motion.div variants={fadeUpVariants} className="mb-6 select-none">
                <h2
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.2rem] tracking-tight uppercase leading-[0.88]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#E8DFD8] to-[#8A7D71] drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
                    LET'S BUILD
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#F7E7C4] via-[#D4AF37] to-[#8C6D4F] drop-shadow-[0_6px_22px_rgba(212,175,55,0.35)]">
                    SOMETHING
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#D5CBC0] to-[#605448] drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
                    AMAZING.
                  </span>
                </h2>
              </motion.div>

              {/* Description */}
              <motion.div variants={fadeUpVariants} className="space-y-3 text-xs sm:text-[13.5px] font-light text-[#B8A89A] leading-[1.8] max-w-xl mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <p className="text-[#F3DBB3] font-medium">
                  Looking for an AI Engineer, Full Stack Developer, or Hackathon-winning problem solver?
                </p>
                <p>
                  I'm always open to internships, full-time opportunities, freelance projects, hackathons, startup collaborations, and innovative AI solutions.
                </p>
                <p className="text-[#A8988B]">
                  Whether you have an exciting project, a career opportunity, or simply want to connect, I'd love to hear from you.
                </p>
              </motion.div>
            </div>

            {/* ================= MISSION CHANNELS (3 ON ONE SIDE + 3 ON ANOTHER SIDE) ================= */}
            <motion.div variants={fadeUpVariants} className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <span 
                  className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#D4AF37] font-semibold"
                >
                  MISSION CHANNELS
                </span>
                <div className="flex-1 ml-4 h-[1px] bg-gradient-to-r from-[#D4AF37]/50 via-[#8C6D4F]/25 to-transparent" />
              </div>

              {/* 2-Column Grid: 3 Left + 3 Right */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* SIDE 1: COLUMN 1 (EMAIL, PHONE, LOCATION) */}
                <div className="space-y-3.5 flex flex-col justify-between">
                  
                  {/* 1. EMAIL */}
                  <a
                    href="mailto:karthikreddy.kkr77@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-between p-3.5 rounded-sm border border-[#8C6D4F]/30 bg-[#0E0C09]/75 hover:bg-[#16120D] hover:border-[#D4AF37]/80 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] min-h-[72px]"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-sm bg-[#1A1510] border border-[#8C6D4F]/40 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37] group-hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all duration-300 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[8.5px] font-mono tracking-[0.2em] text-[#8C6D4F] uppercase group-hover:text-[#D4AF37] transition-colors">
                          EMAIL
                        </span>
                        <span className="block text-xs text-[#E8DFD8] group-hover:text-[#FFF8E7] font-medium truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          karthikreddy.kkr77@gmail.com
                        </span>
                      </div>
                    </div>
                    <span className="text-[#8C6D4F] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all duration-300 text-xs ml-1.5 shrink-0">
                      ↗
                    </span>
                  </a>

                  {/* 2. PHONE */}
                  <a
                    href="tel:+917730970875"
                    className="group relative flex items-center justify-between p-3.5 rounded-sm border border-[#8C6D4F]/30 bg-[#0E0C09]/75 hover:bg-[#16120D] hover:border-[#D4AF37]/80 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] min-h-[72px]"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-sm bg-[#1A1510] border border-[#8C6D4F]/40 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37] group-hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all duration-300 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[8.5px] font-mono tracking-[0.2em] text-[#8C6D4F] uppercase group-hover:text-[#D4AF37] transition-colors">
                          PHONE
                        </span>
                        <span className="block text-xs text-[#E8DFD8] group-hover:text-[#FFF8E7] font-medium truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          +91 7730970875
                        </span>
                      </div>
                    </div>
                    <span className="text-[#8C6D4F] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all duration-300 text-xs ml-1.5 shrink-0">
                      ↗
                    </span>
                  </a>

                  {/* 3. LOCATION */}
                  <div className="group relative flex items-center justify-between p-3.5 rounded-sm border border-[#8C6D4F]/30 bg-[#0E0C09]/75 hover:bg-[#16120D] hover:border-[#D4AF37]/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] min-h-[72px]">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-sm bg-[#1A1510] border border-[#8C6D4F]/40 flex items-center justify-center text-[#D4AF37] transition-all duration-300 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[8.5px] font-mono tracking-[0.2em] text-[#8C6D4F] uppercase">
                          LOCATION
                        </span>
                        <span className="block text-xs text-[#E8DFD8] font-medium truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          Bengaluru, India
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#8C6D4F] px-1.5 py-0.5 border border-[#8C6D4F]/30 rounded-[2px] shrink-0">
                      UTC+5:30
                    </span>
                  </div>

                </div>

                {/* SIDE 2: COLUMN 2 (LINKEDIN, GITHUB, STATUS) */}
                <div className="space-y-3.5 flex flex-col justify-between">
                  
                  {/* 4. LINKEDIN */}
                  <a
                    href="https://www.linkedin.com/in/kamasani-karthik-reddy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-between p-3.5 rounded-sm border border-[#8C6D4F]/30 bg-[#0E0C09]/75 hover:bg-[#16120D] hover:border-[#D4AF37]/80 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] min-h-[72px]"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-sm bg-[#1A1510] border border-[#8C6D4F]/40 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37] group-hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all duration-300 shrink-0">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V9.97H5.06v8.53h2.8z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[8.5px] font-mono tracking-[0.2em] text-[#8C6D4F] uppercase group-hover:text-[#D4AF37] transition-colors">
                          LINKEDIN
                        </span>
                        <span className="block text-xs text-[#E8DFD8] group-hover:text-[#FFF8E7] font-medium truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          kamasani-karthik-reddy
                        </span>
                      </div>
                    </div>
                    <span className="text-[#8C6D4F] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all duration-300 text-xs ml-1.5 shrink-0">
                      ↗
                    </span>
                  </a>

                  {/* 5. GITHUB */}
                  <a
                    href="https://github.com/KamasaniKarthikReddy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-between p-3.5 rounded-sm border border-[#8C6D4F]/30 bg-[#0E0C09]/75 hover:bg-[#16120D] hover:border-[#D4AF37]/80 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] min-h-[72px]"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-sm bg-[#1A1510] border border-[#8C6D4F]/40 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37] group-hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all duration-300 shrink-0">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[8.5px] font-mono tracking-[0.2em] text-[#8C6D4F] uppercase group-hover:text-[#D4AF37] transition-colors">
                          GITHUB
                        </span>
                        <span className="block text-xs text-[#E8DFD8] group-hover:text-[#FFF8E7] font-medium truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          KamasaniKarthikReddy
                        </span>
                      </div>
                    </div>
                    <span className="text-[#8C6D4F] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all duration-300 text-xs ml-1.5 shrink-0">
                      ↗
                    </span>
                  </a>

                  {/* 6. STATUS BADGE */}
                  <div className="p-3 rounded-sm border border-[#D4AF37]/35 bg-[#120F0B]/90 shadow-[0_4px_25px_rgba(0,0,0,0.6)] flex items-center space-x-3 min-h-[72px]">
                    <div className="relative flex items-center justify-center shrink-0 w-3 h-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[8px] font-mono tracking-[0.22em] text-[#D4AF37] uppercase font-semibold">
                        STATUS // ACTIVE
                      </span>
                      <span className="block text-[10.5px] text-[#E8DFD8] font-medium tracking-tight leading-snug mt-0.5 line-clamp-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Open for Internships, Full-Time &amp; AI Roles
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>

          </div>

          {/* ================= RIGHT PANEL: FUTURISTIC CONTACT FORM (5 COLS) ================= */}
          <motion.div
            variants={fadeUpVariants}
            className="lg:col-span-5 relative w-full rounded-sm border border-[#8C6D4F]/40 bg-[#0A0806]/95 backdrop-blur-2xl p-7 sm:p-9 lg:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
          >
            {/* Top Gold Horizon Edge */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
            
            {/* Precision Corner Crosshairs */}
            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D4AF37]" />
            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D4AF37]" />

            {/* Subtle Terminal Header Bar */}
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#8C6D4F]/20">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]/80" />
                <span className="w-2 h-2 rounded-full bg-[#8C6D4F]/50" />
                <span className="w-2 h-2 rounded-full bg-[#8C6D4F]/30" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#A8988B] uppercase ml-2">
                  TRANSMISSION_TERMINAL // V2.6
                </span>
              </div>
              <span className="text-[9.5px] font-mono text-[#D4AF37] tracking-widest hidden sm:inline-block">
                SECURE_ENCRYPTION // 256-BIT
              </span>
            </div>

            <AnimatePresence mode="wait">
              {submitStatus === 'success' ? (
                /* ================= SUCCESS NOTIFICATION ================= */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="py-12 sm:py-16 text-center space-y-6 flex flex-col items-center justify-center"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-[#120F0C] border-2 border-[#D4AF37] text-[#D4AF37] flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                      ✔
                    </div>
                    <span className="animate-ping absolute inset-0 rounded-full border border-[#D4AF37]/50" />
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h3 
                      className="text-2xl sm:text-3xl font-medium tracking-tight text-white uppercase"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#F7E7C4] to-[#D4AF37]">
                        Transmission Received Successfully.
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-[#D5CBC0] font-light leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      Thank you for reaching out!
                      <br />
                      <span className="text-[#A8988B]">I'll get back to you within 24–48 hours.</span>
                    </p>
                  </div>

                  <button
                    onClick={handleReset}
                    type="button"
                    className="mt-4 px-6 py-2.5 text-[11px] font-mono tracking-[0.2em] uppercase text-[#D4AF37] border border-[#8C6D4F]/50 bg-[#120F0C] hover:bg-[#1A1510] hover:border-[#D4AF37] transition-all duration-300 rounded-[2px]"
                  >
                    ← SEND ANOTHER TRANSMISSION
                  </button>
                </motion.div>
              ) : (
                /* ================= FORM INPUTS ================= */
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {submitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-sm border border-red-500/50 bg-red-950/30 text-xs text-red-200 flex items-start space-x-3"
                    >
                      <span className="text-red-400 text-sm font-bold mt-0.5">⚠</span>
                      <div className="space-y-1.5 flex-1">
                        <p className="font-semibold text-red-300">Transmission Interrupted</p>
                        <p className="text-red-300/85 text-[11px] leading-relaxed">
                          {errorMessage || 'Unable to send message via the transmission relay.'}
                        </p>
                        <p className="text-[11px] text-[#E8DFD8]/80 pt-1">
                          You can also reach me directly at{' '}
                          <a
                            href={`mailto:${recipientEmail}?subject=${encodeURIComponent('Transmission from ' + (formData.name || 'Visitor'))}&body=${encodeURIComponent(formData.message || '')}`}
                            className="text-[#D4AF37] underline hover:text-[#FFF8E7] font-medium"
                          >
                            {recipientEmail}
                          </a>
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* FIELD 1: // SENDER */}
                    <div>
                      <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-[#D4AF37] mb-2 font-medium">
                        // SENDER
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your name"
                          className="w-full bg-[#120F0C]/90 border border-[#8C6D4F]/40 focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.2)] text-xs sm:text-[13px] text-white placeholder-[#8C6D4F]/60 px-4 py-3.5 outline-none rounded-sm transition-all duration-300"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        />
                        <div className="absolute inset-0 rounded-sm pointer-events-none border border-transparent group-hover:border-[#D4AF37]/30 transition-colors" />
                      </div>
                    </div>

                    {/* FIELD 2: // CHANNEL */}
                    <div>
                      <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-[#D4AF37] mb-2 font-medium">
                        // CHANNEL
                      </label>
                      <div className="relative group">
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                          className="w-full bg-[#120F0C]/90 border border-[#8C6D4F]/40 focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.2)] text-xs sm:text-[13px] text-white placeholder-[#8C6D4F]/60 px-4 py-3.5 outline-none rounded-sm transition-all duration-300"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        />
                        <div className="absolute inset-0 rounded-sm pointer-events-none border border-transparent group-hover:border-[#D4AF37]/30 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* FIELD 3: // PAYLOAD */}
                  <div>
                    <label className="block text-[10px] font-mono tracking-[0.22em] uppercase text-[#D4AF37] mb-2 font-medium">
                      // PAYLOAD
                    </label>
                    <div className="relative group">
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell me about your project, collaboration, internship opportunity, or message..."
                        className="w-full bg-[#120F0C]/90 border border-[#8C6D4F]/40 focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.2)] text-xs sm:text-[13px] text-white placeholder-[#8C6D4F]/60 p-4 outline-none rounded-sm transition-all duration-300 resize-none leading-relaxed"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      />
                      <div className="absolute inset-0 rounded-sm pointer-events-none border border-transparent group-hover:border-[#D4AF37]/30 transition-colors" />
                    </div>
                  </div>

                  {/* PRIMARY BUTTON */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative w-full overflow-hidden group py-4 px-6 border border-[#D4AF37]/60 bg-gradient-to-r from-[#14100D] via-[#1C1610] to-[#14100D] hover:border-[#D4AF37] text-[#F7E7C4] hover:text-white text-xs sm:text-[13px] font-semibold tracking-[0.28em] uppercase transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-60 cursor-pointer"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {/* Glowing Shimmer Bar */}
                    <span className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
                    
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>TRANSMITTING PAYLOAD...</span>
                        </>
                      ) : (
                        <>
                          <span>SEND TRANSMISSION</span>
                          <span className="group-hover:translate-x-1.5 transition-transform duration-300 text-sm">→</span>
                        </>
                      )}
                    </span>
                  </button>

                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

        </motion.div>

        {/* ================= FOOTER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="pt-10 mt-10 border-t border-[#8C6D4F]/25 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6"
        >
          {/* Left Footer: Copyright & Attribution */}
          <div className="space-y-1">
            <p className="text-xs sm:text-[13px] font-semibold text-[#E8DFD8] tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              © 2026 KAMASANI KARTHIK REDDY
            </p>
            <p className="text-[11px] text-[#A8988B] tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Designed &amp; Developed by <span className="text-[#D4AF37] font-medium">KAMASANI KARTHIK REDDY</span>
            </p>
          </div>

          {/* Center Footer: Tech Stack Badges */}
          <div className="flex items-center space-x-2 text-[10.5px] font-mono text-[#8C6D4F]">
            <span>Built with React • Three.js • GSAP • Tailwind CSS</span>
          </div>

          {/* Right Footer: Engineered with Precision */}
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[10px] font-mono tracking-[0.28em] text-[#D4AF37] uppercase font-semibold">
              ENGINEERED WITH PRECISION.
            </span>
          </div>
        </motion.div>

      </div>
    </footer>
  );
};

export default ContactSection;