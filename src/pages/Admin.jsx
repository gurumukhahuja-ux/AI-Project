import React, { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import { Save, Shield, Users, CreditCard, Lock } from "lucide-react";

const Admin = () => {
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await apiService.getAdminSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await apiService.updateAdminSettings(settings);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (!settings) {
    return <div className="p-8 text-subtext">Loading settings...</div>;
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-secondary">
      <h1 className="text-2xl md:text-3xl font-bold text-maintext mb-2">
        Admin Settings
      </h1>
      <p className="text-sm md:text-base text-subtext mb-8">
        Configure global preferences and permissions.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {[
            { id: "general", label: "General", icon: Shield },
            { id: "users", label: "Users & Roles", icon: Users },
            { id: "billing", label: "Billing", icon: CreditCard },
            { id: "security", label: "Security", icon: Lock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-subtext hover:bg-surface hover:text-maintext"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          {activeTab === "general" && (
            <div className="space-y-6 max-w-2xl">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-maintext mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) =>
                    handleChange("organizationName", e.target.value)
                  }
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-maintext focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Default Model */}
              <div>
                <label className="block text-sm font-medium text-maintext mb-2">
                  Default Model
                </label>
                <select
                  value={settings.defaultModel}
                  onChange={(e) => handleChange("defaultModel", e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-maintext focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gemini-ultra">Gemini Ultra</option>
                </select>
              </div>

              {/* Public Signup */}
              <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                <div>
                  <div className="text-maintext font-medium">Public Signup</div>
                  <div className="text-xs text-subtext">
                    Allow users to register without invite
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleChange(
                      "allowPublicSignup",
                      !settings.allowPublicSignup
                    )
                  }
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    settings.allowPublicSignup
                      ? "bg-green-500 justify-end flex"
                      : "bg-gray-300 justify-start flex"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Token Limit */}
              <div>
                <label className="block text-sm font-medium text-maintext mb-2">
                  Token Limit Per User
                </label>
                <input
                  type="number"
                  value={settings.maxTokensPerUser}
                  onChange={(e) =>
                    handleChange("maxTokensPerUser", Number(e.target.value))
                  }
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-maintext focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-primary hover:opacity-90 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md w-full sm:w-auto justify-center"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Locked Sections */}
          {activeTab !== "general" && (
            <div className="flex flex-col items-center justify-center h-64 text-subtext">
              <Lock className="w-12 h-12 mb-4 opacity-20" />
              <p>This section is locked in demo mode.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;