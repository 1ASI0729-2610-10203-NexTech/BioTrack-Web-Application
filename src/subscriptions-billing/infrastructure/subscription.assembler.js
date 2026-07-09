export const SubscriptionAssembler = {
  fromSubscription(payload) {
    return {
      id: payload.id,
      userId: payload.userId,
      planId: payload.planId,
      status: payload.status,
      startDate: payload.startDate,
      nextBillingDate: payload.nextBillingDate,
    }
  },

  fromBillingSummary(payload) {
    return {
      subscriptionId: payload.subscriptionId,
      userId: payload.userId,
      status: payload.status,
      planName: payload.planName,
      billingCycle: payload.billingCycle,
      monthlyAmount: payload.monthlyAmount,
      startDate: payload.startDate,
      nextBillingDate: payload.nextBillingDate,
      paymentHistory: (payload.paymentHistory ?? []).map((p) => ({
        paymentId: p.paymentId,
        date: p.date,
        amount: p.amount,
        status: p.status,
        transactionId: p.transactionId,
      })),
      pendingInvoices: payload.pendingInvoices,
      outstandingBalance: payload.outstandingBalance,
    }
  },
}
