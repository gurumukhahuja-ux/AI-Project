import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { Zap, Mail, GitBranch, Database, Calendar, Plus } from 'lucide-react';

const Automations = () => {
  const [automations, setAutomations] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await apiService.getAutomations();
      setAutomations(data);
    };
    loadData();
  }, []);

  const handleToggle = async (id) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
    await apiService.toggleAutomation(id);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Email':
        return <Mail className="w-6 h-6 text-pink-500" />;
      case 'Dev':
        return <GitBranch className="w-6 h-6 text-blue-500" />;
      case 'CRM':
        return <Database className="w-6 h-6 text-green-500" />;
      case 'Productivity':
        return <Calendar className="w-6 h-6 text-orange-500" />;
      default:
        return <Zap className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className='p-8 h-full overflow-y-auto'>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-maintext mb-2">
            Automations
          </h1>
          <p className="text-sm md:text-base text-subtext">
            Manage background workflows and agent triggers.
          </p>
        </div>

        <button className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-colors flex items-center gap-2 shadow-md">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New Automation</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automations.map((auto) => (
          <div
            key={auto.id}
            className={`relative p-6 rounded-2xl border transition-all duration-300 shadow-sm ${auto.active
                ? 'bg-white border-primary shadow-lg shadow-primary/5'
                : 'bg-surface border-border opacity-70'
              }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-surface border border-border">
                {getIcon(auto.type)}
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(auto.id)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${auto.active ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-maintext mb-2">{auto.name}</h3>
            <p className="text-sm text-subtext mb-6 min-h-[40px]">{auto.description}</p>

            <div className="flex items-center justify-between text-xs font-medium">
              <span
                className={`px-2 py-1 rounded-md ${auto.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}
              >
                {auto.active ? 'Active' : 'Paused'}
              </span>

              <span className="text-subtext">{auto.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Automations;