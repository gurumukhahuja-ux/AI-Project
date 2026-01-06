import React from 'react';
import { Users, Bot, Zap } from 'lucide-react';

const stats = [
    { label: 'Active Agents', value: '100+', icon: Bot },
    { label: 'Happy Users', value: '10k+', icon: Users },
    { label: 'Fast Inference', value: '<50ms', icon: Zap },
];

const StatsBanner = () => {
    return (
        <div className="w-full bg-white border-y border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex items-center justify-center gap-4 group hover:scale-105 transition-transform duration-300">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-4xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsBanner;
