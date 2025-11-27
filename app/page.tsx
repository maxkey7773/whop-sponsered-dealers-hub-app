import { Button } from "@whop/react/components";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
	const session = await getServerSession(authOptions);

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div className="flex items-center">
							<h1 className="text-2xl font-bold text-gray-900">InfluencerHub</h1>
						</div>
						<div className="flex items-center space-x-4">
							{session ? (
								<div className="flex items-center space-x-4">
									<span className="text-sm text-gray-700">Welcome, {session.user?.name || session.user?.email}</span>
									<Link href="/dashboard">
										<Button variant="classic" size="3">Dashboard</Button>
									</Link>
								</div>
							) : (
								<div className="flex items-center space-x-4">
									<Link href="/auth/signin">
										<Button variant="ghost" size="3">Sign In</Button>
									</Link>
									<Link href="/auth/signup">
										<Button variant="classic" size="3">Get Started</Button>
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="text-6xl font-bold text-gray-900 mb-6">
						Connect Brands & Influencers
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
						Discover amazing deals, collaborate with top brands, and earn money doing what you love.
						Secure payments, escrow protection, and seamless communication.
					</p>
					<div className="flex justify-center space-x-4">
						<Link href="/deals">
							<Button variant="classic" size="4" className="px-8">
								Browse Deals
							</Button>
						</Link>
						<Link href="/auth/signup">
							<Button variant="ghost" size="4" className="px-8">
								Join as Influencer
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose InfluencerHub?</h2>
						<p className="text-lg text-gray-600">Everything you need to succeed in influencer marketing</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
							<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">🔒</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
							<p className="text-gray-600">Escrow protection ensures you get paid when work is completed</p>
						</div>
						<div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">💬</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Communication</h3>
							<p className="text-gray-600">Chat directly with brands and share files seamlessly</p>
						</div>
						<div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
							<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">📊</span>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">Track Everything</h3>
							<p className="text-gray-600">Monitor applications, payments, and campaign progress in real-time</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-gray-900 py-20">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
					<p className="text-xl text-gray-300 mb-8">
						Join thousands of influencers and brands already using our platform
					</p>
					<Link href="/auth/signup">
						<Button variant="classic" size="4" className="px-8 bg-blue-600 hover:bg-blue-700">
							Create Your Account
						</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}
