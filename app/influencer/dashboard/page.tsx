import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@whop/react/components";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getInfluencerData(userId: string) {
  const applications = await prisma.application.findMany({
    where: { influencerId: userId },
    include: {
      deal: {
        include: {
          brand: {
            select: { name: true, email: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const recommendedDeals = await prisma.deal.findMany({
    where: {
      status: "OPEN",
      applications: {
        none: {
          influencerId: userId
        }
      }
    },
    include: {
      brand: {
        select: { name: true, email: true }
      }
    },
    take: 6,
    orderBy: { createdAt: "desc" }
  });

  const stats = {
    totalApplications: applications.length,
    approvedApplications: applications.filter(a => a.status === "APPROVED").length,
    completedApplications: applications.filter(a => a.status === "COMPLETED").length,
    pendingApplications: applications.filter(a => a.status === "APPLIED").length,
  };

  return {
    applications,
    recommendedDeals,
    stats
  };
}

export default async function InfluencerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Check if user is an influencer
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, bio: true, niche: true, platforms: true }
  });

  if (user?.role !== "INFLUENCER") {
    redirect("/dashboard");
  }

  const { applications, recommendedDeals, stats } = await getInfluencerData(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Influencer Dashboard</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Track your applications and discover new opportunities</p>
            <Link href="/influencer/profile">
              <Button variant="ghost" size="3">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Completion Check */}
        {!user.bio && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Complete Your Profile</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Add your bio, niche, and social media links to increase your chances of getting approved for deals.
                </p>
                <div className="mt-4">
                  <Link href="/influencer/profile">
                    <Button variant="ghost" size="2" className="text-yellow-800">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedApplications}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Applications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
            </div>

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {applications.map((app) => (
                <div key={app.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{app.deal.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      app.status === "APPLIED" ? "bg-yellow-100 text-yellow-800" :
                      app.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      app.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                      app.status === "COMPLETED" ? "bg-purple-100 text-purple-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {app.deal.brand.name || app.deal.brand.email} • ${app.deal.budget}
                  </p>
                  <p className="text-xs text-gray-500">{app.deal.niche} • {app.deal.platform}</p>
                </div>
              ))}
            </div>

            {applications.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm mb-4">No applications yet</p>
                <Link href="/deals">
                  <Button variant="ghost" size="2">
                    Browse Deals
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Recommended Deals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recommended Deals</h2>
            </div>

            <div className="p-4 space-y-4">
              {recommendedDeals.map((deal) => (
                <div key={deal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{deal.title}</h3>
                    <span className="text-sm font-bold text-green-600">${deal.budget}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {deal.brand.name || deal.brand.email}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{deal.niche}</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">{deal.platform}</span>
                    </div>
                    <Link href={`/deals/${deal.id}`}>
                      <Button variant="ghost" size="1">
                        Apply
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {recommendedDeals.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm">No new deals available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}