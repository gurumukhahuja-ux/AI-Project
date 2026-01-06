import React from 'react';
import { Bot, Zap, Shield, Globe, Cpu, Headset } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        title: 'Smart Agents',
        description: 'Access a marketplace of specialized AI agents for coding, writing, and analysis.',
        icon: Bot
    },
    {
        title: 'Real-time Speed',
        description: 'Powered by the fastest AI models for instant, fluid conversation.',
        icon: Zap
    },
    {
        title: 'Secure & Private',
        description: 'Enterprise-grade security ensures your data and conversations stay private.',
        icon: Shield
    },
    {
        title: 'Global Reach',
        description: 'Connect with users and developers from around the world.',
        icon: Globe
    },
    {
        title: 'Advanced Models',
        description: 'Leveraging state-of-the-art LLMs like Gemini and GPT-4 for superior performance.',
        icon: Cpu
    },
    {
        title: '24/7 Support',
        description: 'Dedicated support team to help you at every step of your journey.',
        icon: Headset
    }
];

const FeaturesSection = () => {
    return (
        <div className="py-24 bg-indigo-50/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Why Choose A-Series<sup className="text-lg">TM</sup>?</h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">Built for performance, designed for scale. Experience the difference with our cutting-edge platform.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group cursor-default"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-white text-primary duration-300">
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturesSection;
