import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bot, Zap, Shield, CircleUser,
  Github,
  Linkedin, Mail, MapPin, Phone, Facebook, Instagram, Youtube, MessageSquare, MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { logo, name } from '../constants';
import { getUserData } from '../userStore/userData';
import { AppRoute } from '../types';
import LandingLiveDemoModal from '../Components/LiveDemo/LandingLiveDemoModal';
import { useRecoilState } from 'recoil';
import { demoModalState } from '../userStore/demoStore';
import SecurityModal from '../Components/LiveDemo/SecurityModal';
import { FaXTwitter } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import StatsBanner from '../Components/Landing/StatsBanner';
import FeaturesSection from '../Components/Landing/FeaturesSection';
import apiService from '../services/apiService';

const Landing = () => {
  const navigate = useNavigate();
  const user = getUserData("user")
  const [demoState, setDemoState] = useRecoilState(demoModalState);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [featuredAgents, setFeaturedAgents] = useState([]);

  React.useEffect(() => {
    const fetchAgents = async () => {
      try {
        // Fetch top 5 agents for featured section (all agents, not just Live)
        const data = await apiService.getAgents({ limit: 5, featured: 'true' });
        setFeaturedAgents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch featured agents:", error);
        setFeaturedAgents([]);
      }
    };
    fetchAgents();
  }, []);

  const btnClass = "px-8 py-4 bg-primary rounded-2xl font-bold text-lg text-white shadow-xl shadow-primary/30 flex items-center justify-center gap-2 border border-primary/10 w-full sm:w-auto overflow-hidden";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50">

      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-14 h-14 object-contain" />
          <span className="text-3xl font-black tracking-tighter text-maintext">A-Series<sup className="text-sm">TM</sup></span>
        </div>
        {user ? <Link to={AppRoute.PROFILE}><CircleUser className=' h-7 w-7' /></Link> : <div className="flex gap-4">
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
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
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
          A-Series<sup className="text-xs">TM</sup> learns, adapts, and creates with you in real-time through a stunning interface.
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






        <StatsBanner />

        <FeaturesSection />

        {/* Featured Agents Preview */}
        <div className="w-full py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Featured Agents</h2>
                <p className="text-lg text-gray-500">Discover top-rated AI agents from our marketplace.</p>
              </div>
              <button
                onClick={() => navigate(AppRoute.MARKETPLACE)}
                className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
              >
                View Marketplace <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* We will load agents here dynamically in the next step, for now showing a placeholder or static content is better than breaking */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredAgents.length > 0 ? (
                featuredAgents.map((agent) => (
                  <div key={agent._id} className="group relative bg-white rounded-3xl border border-gray-100 p-4 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer" onClick={() => navigate(`${AppRoute.MARKETPLACE}/${agent._id}`)}>
                    <div className="aspect-square rounded-2xl bg-indigo-50 mb-4 overflow-hidden relative p-6">
                      <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/5 transition-colors" />
                      {agent.avatar ? (
                        <img src={agent.avatar} alt={agent.agentName} className="w-full h-full object-contain" />
                      ) : (
                        <Bot className="w-12 h-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
                      )}

                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-wider">{agent.category || 'AI'}</span>
                      <span className="text-sm font-bold text-gray-900">{agent.pricing?.type !== 'Free' ? 'Paid' : 'Free'}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{agent.agentName}<sup className="text-xs">TM</sup></h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{agent.description}</p>
                  </div>
                ))
              ) : (
                // Show helpful message when no agents are available
                <div className="col-span-full text-center py-12">
                  <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Featured Agents Yet</h3>
                  <p className="text-gray-500 mb-6">Check back soon for amazing AI agents in our marketplace!</p>
                  <button
                    onClick={() => navigate(AppRoute.MARKETPLACE)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                  >
                    Explore Marketplace
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate(AppRoute.MARKETPLACE)}
              className="md:hidden w-full mt-8 flex items-center justify-center gap-2 text-primary font-bold bg-indigo-50 py-4 rounded-xl"
            >
              View All Agents <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vendor Call to Action */}
        <div className="w-full py-24 bg-black relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-50 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6">For Developers</span>
            <h2 className="text-4xl md:text-6xl font-black force-white-text mb-6 tracking-tight">Monetize Your AI Models</h2>
            <p className="text-xl force-white-text max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Join thousands of developers earning revenue by publishing their AI agents on A-Series<sup className="text-xs">TM</sup>. We handle the billing, you handle the code.
            </p>
            <button
              onClick={() => navigate("/vendor")}
              className="px-8 py-5 bg-white text-gray-900 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-2xl shadow-white/20"
            >
              Become a Vendor
            </button>
          </div>
        </div>


      </main>

      {/* Footer Section */}
      <footer className="w-full bg-background border-t border-border mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                <span className="text-2xl font-black tracking-tighter text-maintext">A-Series<sup className="text-xs">TM</sup></span>
              </div>
              <p className="text-sm text-subtext leading-relaxed max-w-sm">
                A-Series<sup className="text-[10px]">TM</sup> — India’s First AI App Marketplace <br />
                100 AI Apps | A-Series™ | Partner Integrations<br />
                Powered by UWO™
              </p>
              <div className="flex items-center gap-4">
                {[
                  {
                    icon: <Linkedin className="w-5 h-5" />,
                    href: "https://www.linkedin.com/authwall?trk=bf&trkInfo=AQF3pSWm3RFcZQAAAZtzxKHoH3Gk0Is5rVSKn-E57xtOi8yVUop7C1hlM2loZWRfEP9RIwqwNjjt4PjJQMmAxxwNqIw5YDwxftwn5e_z7XccQBdXFipFYgZgnb9UscYZ4BTGo3o=&original_referer=&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fin%2Faimall-global%2F",
                    color: "text-[#0077B5]",
                    bg: "bg-[#0077B5]/10",
                    hover: "hover:bg-[#0077B5]"
                  },
                  {
                    icon: <FaXTwitter className="w-5 h-5" />,
                    href: "https://x.com/aimallglobal",
                    color: "text-[#000000]",
                    bg: "bg-[#000000]/10",
                    hover: "hover:bg-[#000000]"
                  },
                  {
                    icon: <Facebook className="w-5 h-5" />,
                    href: "https://www.facebook.com/aimallglobal/",
                    color: "text-[#1877F2]",
                    bg: "bg-[#1877F2]/10",
                    hover: "hover:bg-[#1877F2]"
                  },
                  {
                    icon: <Instagram className="w-5 h-5" />,
                    href: "https://www.instagram.com/aimall.global/",
                    color: "text-[#E4405F]",
                    bg: "bg-[#E4405F]/10",
                    hover: "hover:bg-[#E4405F]"
                  },
                  {
                    icon: <Youtube className="w-5 h-5" />,
                    href: "https://www.youtube.com/@aimallglobal",
                    color: "text-[#FF0000]",
                    bg: "bg-[#FF0000]/10",
                    hover: "hover:bg-[#FF0000]"
                  },
                  {
                    icon: (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    ),
                    href: "https://api.whatsapp.com/send?phone=918359890909",
                    color: "text-[#25D366]",
                    bg: "bg-[#25D366]/10",
                    hover: "hover:bg-[#25D366]"
                  }
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl ${social.bg} transition-all duration-300 flex items-center justify-center ${social.color} ${social.hover} hover:text-white shrink-0 shadow-sm`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Explore Column */}
            <div>
              <h4 className="text-sm font-bold text-maintext uppercase tracking-widest mb-6">Explore</h4>
              <ul className="space-y-4">
                {[
                  { label: "Marketplace", onClick: () => navigate(AppRoute.DASHBOARD + "/marketplace") },
                  { label: "My Agents", onClick: () => navigate(AppRoute.DASHBOARD + "/agents") },
                  { label: "Become a Vendor", onClick: () => navigate("/vendor") },
                  { label: "Live Demos", onClick: () => setDemoState({ ...demoState, isOpen: true }) }
                ].map((link, i) => (
                  <li key={i}>
                    <button
                      onClick={link.onClick}
                      className="text-sm text-subtext hover:text-primary transition-colors font-medium"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="text-sm font-bold text-maintext uppercase tracking-widest mb-6">Support</h4>
              <ul className="space-y-4">
                {[
                  { label: "Help Center", path: "#" },
                  { label: "Security & Guidelines", onClick: () => setIsSecurityModalOpen(true) },
                  { label: "Contact Us", path: "mailto:contact@a-series.ai" },
                  { label: "Status Page", path: "#" }
                ].map((link, i) => (
                  <li key={i}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className="text-sm text-subtext hover:text-primary transition-colors font-medium"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.path}
                        className="text-sm text-subtext hover:text-primary transition-colors font-medium"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-maintext uppercase tracking-widest mb-6">Contact</h4>
              <div className="space-y-4">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Jabalpur+Madhya+Pradesh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-subtext leading-relaxed group-hover:text-primary transition-colors">
                    Jabalpur, Madhya Pradesh
                  </p>
                </a>
                <a
                  href="mailto:support@a-series.ai"
                  className="flex items-center gap-3 group"
                >
                  <Mail className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-subtext group-hover:text-primary transition-colors font-medium">
                    support@a-series.ai
                  </span>
                </a>
                <a
                  href="tel:+918358990909"
                  className="flex items-center gap-3 group"
                >
                  <Phone className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-subtext group-hover:text-primary transition-colors font-medium">
                    +91 83589 90909
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-subtext font-medium">
              © {new Date().getFullYear()} {name}. All rights reserved. Partnered with UWO-LINK™.
            </p>
            <div className="flex items-center gap-8">
              <a href="#" className="text-xs text-subtext hover:text-maintext transition-colors font-medium">Privacy Policy</a>
              <a href="#" className="text-xs text-subtext hover:text-maintext transition-colors font-medium">Terms of Service</a>
              <a href="#" className="text-xs text-subtext hover:text-maintext transition-colors font-medium">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <LandingLiveDemoModal
        isOpen={demoState.isOpen}
        onClose={() => setDemoState({ ...demoState, isOpen: false })}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </div >
  );
};

export default Landing;