import React from 'react';

const LiveDemoCard = ({ agent, onSubscribe }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg">{agent.agentName}<sup className="text-xs">TM</sup></h3>
            <p className="text-gray-500 text-sm mb-4">{agent.description}</p>
            <button
                onClick={() => onSubscribe(agent._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
                Subscribe
            </button>
        </div>
    );
};

export default LiveDemoCard;
