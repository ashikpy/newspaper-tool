"use client";

import { useState, useEffect } from "react";
import { useAuth, Show, SignInButton } from "@clerk/nextjs";
import { getVendorConfigs, updateVendorConfig } from "../tracker/actions";

export default function ProfilePage() {
  const { isSignedIn } = useAuth();
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const vendors = [
    "The Hindu",
    "Times of India",
    "The New Indian Express",
    "Daily Thanthi",
    "Dinamalar",
    "Dinakaran"
  ];

  useEffect(() => {
    if (isSignedIn) {
      getVendorConfigs().then((data) => {
        const map: Record<string, string> = {};
        data.forEach((c) => {
          if (c.upiVpa) map[c.vendorName] = c.upiVpa;
        });
        setConfigs(map);
        setLoading(false);
      });
    }
  }, [isSignedIn]);

  const handleSave = async (vendor: string) => {
    setSaving(vendor);
    try {
      await updateVendorConfig(vendor, configs[vendor] || "");
      alert(`VPA for ${vendor} updated!`);
    } catch (err) {
      alert("Error saving VPA");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-newspaper-base p-4 md:p-8 text-[#111] font-body">
      <main className="max-w-4xl mx-auto border-4 border-[#111] bg-white shadow-[8px_8px_0px_0px_#111] p-6 md:p-12">
        <header className="mb-12 border-b-4 border-[#111] pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black font-display uppercase">Vendor Settings</h1>
            <p className="font-bold text-gray-600 mt-2">Configure UPI VPAs for your newspaper bills.</p>
          </div>
          <a href="/tracker" className="border-2 border-[#111] bg-neo-yellow px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_#111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
            Back to Tracker
          </a>
        </header>

        <Show when="signed-in">
          {loading ? (
            <div className="p-12 text-center font-black text-2xl uppercase">Loading...</div>
          ) : (
            <div className="grid gap-6">
              {vendors.map((vendor) => (
                <div key={vendor} className="border-4 border-[#111] p-6 bg-white shadow-[4px_4px_0px_0px_#111] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black uppercase">{vendor}</h3>
                    <p className="text-xs font-bold opacity-60">UPI Virtual Payment Address</p>
                  </div>
                  <div className="flex flex-1 md:max-w-md gap-2">
                    <input
                      type="text"
                      placeholder="e.g. vendor@upi"
                      className="flex-1 border-2 border-[#111] p-2 font-mono text-sm focus:outline-none focus:bg-neo-yellow transition-colors"
                      value={configs[vendor] || ""}
                      onChange={(e) => setConfigs({ ...configs, [vendor]: e.target.value })}
                    />
                    <button
                      disabled={saving === vendor}
                      onClick={() => handleSave(vendor)}
                      className="border-2 border-[#111] bg-[#111] text-white px-6 py-2 font-black uppercase hover:bg-white hover:text-[#111] transition-all disabled:opacity-50"
                    >
                      {saving === vendor ? "..." : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Show>

        <Show when="signed-out">
          <div className="p-12 text-center bg-neo-red border-4 border-[#111] shadow-[4px_4px_0px_0px_#111]">
            <h2 className="text-2xl font-black uppercase mb-4 text-white">Sign In Required</h2>
            <SignInButton mode="modal">
              <button className="border-2 border-[#111] bg-white px-8 py-3 font-black uppercase shadow-[4px_4px_0px_0px_#111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                Sign In
              </button>
            </SignInButton>
          </div>
        </Show>
      </main>
    </div>
  );
}
