import { prisma } from "@/lib/prisma";
import { Button } from "@whop/react/components";
import Link from "next/link";

async function getDeals() {
  const deals = await prisma.deal.findMany({
    where: { status: "OPEN" },
    include: {
      brand: {
        select: { name: true, email: true }
      },
      applications: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return deals;
}

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Available Deals</h1>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search deals..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Niches</option>
                <option value="fashion">Fashion</option>
                <option value="tech">Technology</option>
                <option value="food">Food</option>
                <option value="travel">Travel</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
              </select>
            </div>
            <Link href="/brand/new-deal">
              <Button variant="classic" size="3">
                Post New Deal
              </Button>
            </Link>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{deal.title}</h3>
                  <p className="text-sm text-gray-600">by {deal.brand.name || deal.brand.email}</p>
                </div>
                <span className="text-2xl font-bold text-green-600">${deal.budget}</span>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{deal.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{deal.niche}</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{deal.platform}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{deal.region}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{deal.applications.length} applications</span>
                <Link href={`/deals/${deal.id}`}>
                  <Button variant="ghost" size="2">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {deals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No deals available at the moment.</p>
            <p className="text-gray-400 mt-2">Check back later or post your own deal!</p>
          </div>
        )}
      </div>
    </div>
  );
}