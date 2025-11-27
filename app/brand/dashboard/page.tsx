import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@whop/react/components";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getBrandData(userId: string) {
  const deals = await prisma.deal.findMany({
    where: { brandId: userId },
    include: {
      applications: {
        include: {
          influencer: {
            select: { name: true, email: true, bio: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => d.status === "OPEN").length;
  const completedDeals = deals.filter(d => d.status === "COMPLETED").length;
  const totalApplications = deals.reduce((sum, deal) => sum + deal.applications.length, 0);

  return {
    deals,
    stats: {
      totalDeals,
      activeDeals,
      completedDeals,
      totalApplications,
    }
  };
}

export default async function BrandDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Check if user is a brand
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (user?.role !== "BRAND") {
    redirect("/dashboard");
  }

  const { deals, stats } = await getBrandData(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Brand Dashboard</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Manage your campaigns and applications</p>
            <Link href="/brand/new-deal">
              <Button variant="classic" size="3">
                Post New Deal
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDeals}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.completedDeals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-orange-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deals List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Deals</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {deals.map((deal) => (
              <div key={deal.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{deal.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{deal.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>${deal.budget}</span>
                      <span>{deal.niche}</span>
                      <span>{deal.platform}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        deal.status === "OPEN" ? "bg-green-100 text-green-800" :
                        deal.status === "CLOSED" ? "bg-gray-100 text-gray-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {deal.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/brand/deals/${deal.id}`}>
                      <Button variant="ghost" size="2">
                        View Applications ({deal.applications.length})
                      </Button>
                    </Link>
                  </div>
                </div>

                {deal.applications.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Applications:</h4>
                    <div className="space-y-2">
                      {deal.applications.slice(0, 3).map((app) => (
                        <div key={app.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {app.influencer.name || app.influencer.email}
                            </p>
                            <p className="text-xs text-gray-600">{app.influencer.bio}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            app.status === "APPLIED" ? "bg-yellow-100 text-yellow-800" :
                            app.status === "APPROVED" ? "bg-green-100 text-green-800" :
                            app.status === "REJECTED" ? "bg-red-100 text-red-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {deals.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">No deals posted yet</p>
              <Link href="/brand/new-deal">
                <Button variant="classic" size="3">
                  Create Your First Deal
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}