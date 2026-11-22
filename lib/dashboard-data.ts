import { ObjectId } from 'mongodb'
import { database } from '@/lib/mongodb'
import type { AccountRole } from '@/lib/session'

export type DashboardStat = { label: string; value: number; detail: string }

export async function getDashboardStats(role: AccountRole, userId: string): Promise<DashboardStat[]> {
  const users = database.collection('users')
  const services = database.collection('services')
  const bookings = database.collection('bookings')

  if (role === 'customer') {
    const [total, pending, accepted, rejected] = await Promise.all([
      bookings.countDocuments({ customerId: userId }),
      bookings.countDocuments({ customerId: userId, status: 'pending' }),
      bookings.countDocuments({ customerId: userId, status: 'accepted' }),
      bookings.countDocuments({ customerId: userId, status: 'rejected' }),
    ])
    return [
      { label: 'Booking requests', value: total, detail: 'Requests you have sent' },
      { label: 'Awaiting a reply', value: pending, detail: 'Pending with your vendors' },
      { label: 'Confirmed', value: accepted, detail: 'Accepted by your vendors' },
      { label: 'Not accepted', value: rejected, detail: 'Requests marked as rejected' },
    ]
  }

  if (role === 'vendor') {
    const [totalServices, activeServices, pending, accepted] = await Promise.all([
      services.countDocuments({ vendorId: userId }),
      services.countDocuments({ vendorId: userId, status: 'approved', isActive: true }),
      bookings.countDocuments({ vendorId: userId, status: 'pending' }),
      bookings.countDocuments({ vendorId: userId, status: 'accepted' }),
    ])
    const vendor = ObjectId.isValid(userId)
      ? await users.findOne({ _id: new ObjectId(userId) }, { projection: { subscriptionPlan: 1 } })
      : null
    return [
      { label: 'My services', value: totalServices, detail: 'Services in your profile' },
      { label: 'Active services', value: activeServices, detail: 'Approved and visible to couples' },
      { label: 'New requests', value: pending, detail: 'Waiting for your response' },
      { label: 'Accepted bookings', value: accepted, detail: `Current plan: ${vendor?.subscriptionPlan ?? 'free'}` },
    ]
  }

  const [totalUsers, vendors, customers, totalServices, pendingServices, totalTransactions] = await Promise.all([
    users.countDocuments({}),
    users.countDocuments({ role: 'vendor' }),
    users.countDocuments({ role: 'customer' }),
    services.countDocuments({}),
    services.countDocuments({ status: 'pending' }),
    database.collection('transactions').countDocuments({}),
  ])
  return [
    { label: 'Registered users', value: totalUsers, detail: `${vendors} vendors · ${customers} customers` },
    { label: 'Submitted services', value: totalServices, detail: 'Across the marketplace' },
    { label: 'Needs review', value: pendingServices, detail: 'Services awaiting moderation' },
    { label: 'Transactions', value: totalTransactions, detail: 'Payment records from verified events' },
  ]
}
