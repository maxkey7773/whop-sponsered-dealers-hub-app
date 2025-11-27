import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@whop/react/components";
import { redirect } from "next/navigation";

async function getPaymentData(userId: string) {
  const payments = await prisma.payment.findMany({
    where: { userId },
    include: {
      deal: {
        select: { title: true, brand: { select: { name: true, email: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const balance = payments
    .filter(p => p.status === "COMPLETED")
    .reduce((sum, p) => {
      if (p.type === "DEPOSIT") return sum + p.amount;
      if (p.type === "WITHDRAWAL") return sum - p.amount;
      return sum;
    }, 0);

  const pendingPayments = payments.filter(p => p.status === "PENDING").length;

  return {
    payments,
    balance,
    pendingPayments
  };
}

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { payments, balance, pendingPayments } = await getPaymentData(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payments</h1>
          <p className="text-gray-600">Manage your deposits, withdrawals, and payment history</p>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Balance</h2>
              <p className="text-3xl font-bold text-green-600">${balance.toFixed(2)}</p>
              {pendingPayments > 0 && (
                <p className="text-sm text-yellow-600 mt-1">
                  {pendingPayments} pending transaction{pendingPayments !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              <Button variant="classic" size="3">
                Deposit Funds
              </Button>
              <Button variant="ghost" size="3">
                Withdraw
              </Button>
            </div>
          </div>
        </div>

        {/* Fee Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Fee Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Commission Model</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 5-15% fee per completed deal</li>
                <li>• Paid by brand when deal is completed</li>
                <li>• Transparent pricing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Subscription Model</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Monthly fee for premium access</li>
                <li>• Exclusive deals and features</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deposit Funds</h3>
            <p className="text-gray-600 mb-4">
              Add funds to your account to pay for influencer deals. Funds are held in escrow until work is completed.
            </p>
            <Button variant="classic" size="3" className="w-full">
              Make Deposit
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Earnings</h3>
            <p className="text-gray-600 mb-4">
              Withdraw your earnings from completed deals. Processing time: 3-5 business days.
            </p>
            <Button variant="ghost" size="3" className="w-full" disabled={balance <= 0}>
              {balance > 0 ? "Request Withdrawal" : "No Funds Available"}
            </Button>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <div key={payment.id} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}
                      {payment.deal && ` - ${payment.deal.title}`}
                    </p>
                    {payment.deal && (
                      <p className="text-xs text-gray-600">
                        {payment.deal.brand.name || payment.deal.brand.email}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      payment.type === "DEPOSIT" ? "text-green-600" : "text-red-600"
                    }`}>
                      {payment.type === "DEPOSIT" ? "+" : "-"}${payment.amount.toFixed(2)}
                    </p>
                    <p className={`text-xs px-2 py-1 rounded-full inline-block ${
                      payment.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                      payment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {payment.status}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {payments.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-2">No payment history</p>
              <p className="text-gray-400 text-sm">Your transactions will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}