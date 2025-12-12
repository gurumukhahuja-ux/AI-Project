import React, { useEffect, useState } from 'react';
import { Plus, Settings, Trash2, Bot, Code, Edit3, Save } from 'lucide-react';
import { apiService } from '../services/apiService';
import axios from 'axios';
import { apis } from '../types';
import { getUserData } from '../userStore/userData';

const MyAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editedInstructions, setEditedInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const agies = JSON.parse(localStorage.getItem("agents"))
  const user = getUserData("user")


  useEffect(() => {
    console.log(user.id);

    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    axios.post(apis.getUserAgents, { userId: user.id }).then((res) => {
      console.log(res.data.agents);
      setAgents(res.data.agents);
    }).catch(err => console.log(err))
    setLoading(false);
  };

  const handleCreateAgent = async () => {
    const newAgent = {
      name: 'New Agent',
      description: 'A new custom assistant.',
      type: 'general',
      instructions: 'You are a helpful assistant.'
    };
    await apiService.createAgent(newAgent);
    loadAgents();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this agent?')) {
      await apiService.deleteAgent(id);
      loadAgents();
    }
  };

  const toggleExpand = (agent) => {
    if (expandedId === agent._id) {
      setExpandedId(null);
    } else {
      setExpandedId(agent._id);
      setEditedInstructions(agent.instructions || '');
    }
  };

  const handleSaveInstructions = async (id) => {
    setIsSaving(true);
    await apiService.updateAgent(id, { instructions: editedInstructions });

    setAgents((prev) =>
      prev.map((a) => (a._id === id ? { ...a, instructions: editedInstructions } : a))
    );

    setIsSaving(false);
    setExpandedId(null);
  };

  const getIcon = (type) => {
    if (type === 'coder') return <Code className="w-6 h-6 text-blue-500" />;
    if (type === 'writer') return <Edit3 className="w-6 h-6 text-pink-500" />;
    return <Bot className="w-6 h-6 text-primary" />;
  };

  return (
    <div className="p-4 md:p-8 h-full bg-secondary overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-maintext mb-2">My Custom Agents</h1>
          <p className="text-sm md:text-base text-subtext">Create and manage your personalized AI assistants.</p>
        </div>

        <button
          onClick={handleCreateAgent}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" /> Create New Agent
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-subtext text-center">Loading agents...</div>
      ) : (
        <div className="">
          <div className='flex gap-5'>
            {agents.map((agent) => 
              <div
                key={agent._id}
                className=" group bg-white border border-border hover:border-primary/50 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 flex flex-col w-1/3 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-19 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                  />

                  <div className="bg-surface border border-border px-2 py-1 rounded-lg flex items-center gap-1">
                    {/* <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> */}
                    <span className="text-xs font-bold text-maintext">4.9</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-maintext mb-1">{agent.agentName}</h3>

                <span className="text-xs text-primary uppercase tracking-wider font-semibold mb-3">
                  {agent.category}
                </span>

                <p className="text-sm text-subtext mb-6 flex-1">{agent.description}</p>

                {/* Install Button */}
                <a href={agent.url}>
                  <button


                    className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${true
                      ? 'bg-green-50 text-green-600 border border-green-100'
                      : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20'
                      }`}
                  >
                    Use It
                  </button></a>

              </div>)}
          </div>
          {agents.map((agent) => (
            <div
              key={agent._id}
              className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden shadow-sm ${expandedId === agent._id
                ? 'border-primary shadow-lg shadow-primary/10 col-span-1 lg:col-span-2 xl:col-span-2 row-span-2'
                : 'border-border hover:border-primary/30 hover:shadow-md'
                }`}
            >
              <div className="p-6 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
                    {getIcon(agent.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-maintext mb-1">{agent.name}</h3>
                    <p className="text-sm text-subtext">{agent.description}</p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggleExpand(agent)}
                    className={`p-2 rounded-lg transition-colors border ${expandedId === agent._id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-border text-subtext hover:text-maintext hover:bg-surface'
                      }`}
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(agent._id, e)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors border border-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expand Section */}
              {expandedId === agent._id && (
                <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="h-px w-full bg-border mb-4" />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-primary mb-2 flex items-center gap-2">
                      <Bot className="w-4 h-4" /> System Instructions
                    </label>

                    <p className="text-xs text-subtext mb-3">
                      Define how this agent should behave, tone, and special skills.
                    </p>

                    <textarea
                      value={editedInstructions}
                      onChange={(e) => setEditedInstructions(e.target.value)}
                      className="w-full h-40 bg-surface border border-border rounded-xl p-4 text-maintext text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-mono"
                      placeholder="e.g., You are an expert Python developer..."
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setExpandedId(null)}
                      className="px-4 py-2 rounded-lg bg-white border border-border hover:bg-surface text-subtext text-sm font-medium"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => handleSaveInstructions(agent._id)}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-white text-sm font-medium flex items-center gap-2 shadow-md"
                    >
                      {isSaving ? 'Saving...' : <>
                        <Save className="w-4 h-4" /> Save Instructions
                      </>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Empty Create Card */}
          <div
            onClick={handleCreateAgent}
            className="border border-dashed border-border bg-surface/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-surface transition-colors cursor-pointer group min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-full bg-white border border-border flex items-center justify-center mb-3 group-hover:border-primary/50">
              <Plus className="w-6 h-6 text-subtext group-hover:text-primary" />
            </div>
            <h3 className="font-medium text-maintext">Create from Template</h3>
            <p className="text-xs text-subtext mt-1">Start with a pre-configured base</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAgents;