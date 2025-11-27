"use client";

import { useState } from "react";
import { Button } from "@whop/react/components";
import { useRouter } from "next/navigation";

export default function NewDealPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    niche: "",
    platform: "",
    budget: "",
    region: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget),
        }),
      });

      if (response.ok) {
        router.push("/brand/dashboard");
      } else {
        alert("Failed to create deal");
      }
    } catch (error) {
      console.error("Error creating deal:", error);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Post New Deal</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Deal Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Instagram Product Review"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what you need the influencer to do..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-2">
                  Niche
                </label>
                <select
                  id="niche"
                  name="niche"
                  required
                  value={formData.niche}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select niche</option>
                  <option value="fashion">Fashion</option>
                  <option value="beauty">Beauty</option>
                  <option value="tech">Technology</option>
                  <option value="food">Food</option>
                  <option value="travel">Travel</option>
                  <option value="fitness">Fitness</option>
                  <option value="gaming">Gaming</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>

              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  required
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter</option>
                  <option value="twitch">Twitch</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget ($)
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  required
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100.00"
                />
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  id="region"
                  name="region"
                  required
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select region</option>
                  <option value="north-america">North America</option>
                  <option value="europe">Europe</option>
                  <option value="asia">Asia</option>
                  <option value="australia">Australia</option>
                  <option value="global">Global</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="ghost"
                size="3"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="classic"
                size="3"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Deal"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}