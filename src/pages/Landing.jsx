import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Bot, Zap, Shield, CircleUser, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { logo, faqs } from '../constants';
import { getUserData } from '../userStore/userData';
import { AppRoute } from '../types';

const Landing = () => {
  const navigate = useNavigate();
  const user = getUserData("user")
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const btnClass = "px-8 py-4 bg-primary rounded-2xl font-bold text-lg text-white shadow-xl shadow-primary/30 flex items-center justify-center gap-2 border border-primary/10 w-full sm:w-auto overflow-hidden";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-secondary">

      {/* Background Blur Effects */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-blue-400/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-20 h-20 rounded-lg flex items-center justify-center">
            <img src={logo} alt="AI-Mall Logo" />
          </div>
        </div>
        {user ? <CircleUser className=' h-7 w-7' /> : <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="text-subtext hover:text-primary font-medium transition-colors"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="bg-primary text-white px-5 py-2 rounded-full font-semibold hover:opacity-90 transition-colors shadow-lg shadow-primary/20"
          >
            Get Started
          </button>
        </div>}
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 py-20">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-sm text-subtext mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Powered by UWO
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-maintext"
        >
          The Future of <br />
          <span className="text-primary">Conversational AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-subtext max-w-2xl mb-10 leading-relaxed"
        >
          Experience the next generation of intelligent assistance.
          AI Mall learns, adapts, and creates with you in real-time through a stunning interface.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-2xl"
        >

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(AppRoute.MARKETPLACE)}
            className="px-8 py-4 bg-primary rounded-2xl font-bold text-lg text-white shadow-xl shadow-primary/30 hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-center gap-2"
          >
            Start Now <ArrowRight className="w-5 h-5" />
          </motion.button>

          {!user && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className={btnClass}
            >
              Existing User
            </motion.button>
          )}
        </motion.div>



        {/* FAQ Section */}
        <div className="mt-20 w-full max-w-3xl mb-8">
          <h2 className="text-3xl font-bold text-center mb-10 text-maintext">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-border rounded-xl bg-white overflow-hidden hover:shadow-md transition-all">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-surface transition-colors focus:outline-none"
                >
                  <span className="font-semibold text-maintext text-lg">{faq.question}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-subtext" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="p-5 pt-0 text-subtext leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left"
        >
          <div className="p-6 rounded-3xl bg-white border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-maintext">Smart Agents</h3>
            <p className="text-subtext">
              Access a marketplace of specialized AI agents for coding, writing, and analysis.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-maintext">Real-time Speed</h3>
            <p className="text-subtext">
              Powered by the fastest AI models for instant, fluid conversation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-maintext">Secure & Private</h3>
            <p className="text-subtext">
              Enterprise-grade security ensures your data and conversations stay private.
            </p>
          </div>
        </motion.div>

      </main>

      {/* Footer / Copyright */}
      <footer className="p-8 text-center text-subtext text-xs relative z-10 border-t border-border mt-auto bg-surface/30">
        © 2024 AI-Mall. All systems integrated with UWO-LINK.
      </footer>
    </div >
  );
};

export default Landing;