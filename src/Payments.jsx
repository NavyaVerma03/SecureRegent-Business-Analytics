import { useEffect, useState } from 'react'
import { loadData, saveData } from './storage'
import {
  CreditCard,
  Plus,
  Search,
  Download,
  X,
  IndianRupee,
  CheckCircle,
  Clock,
  ShoppingCart,
} from 'lucide-react'

const initialPayments = [
  {
    id: 'PAY-1001',
    customer: 'Aarav Sharma',
    invoice: 'INV-1001',
    date: '2026-10-10',
    amount: 45000,
    method: 'Bank Transfer',
    status: 'Completed',
    orderId: '',
  },
  {
    id: 'PAY-1002',
    customer: 'Priya Verma',
    invoice: 'INV-1002',
    date: '2026-10-11',
    amount: 72000,
    method: 'UPI',
    status: 'Completed',
    orderId: '',
  },
  {
    id: 'PAY-1003',
    customer: 'Rahul Kumar',
    invoice: 'INV-1003',
    date: '2026-10-12',
    amount: 28000,
    method: 'Credit Card',
    status: 'Pending',
    orderId: '',
  },
  {
    id: 'PAY-1004',
    customer: 'Ananya Singh',
    invoice: 'INV-1004',
    date: '2026-10-13',
    amount: 56000,
    method: 'UPI',
    status: 'Completed',
    orderId: '',
  },
  {
    id: 'PAY-1005',
    customer: 'Vikram Patel',
    invoice: 'INV-1005',
    date: '2026-10-14',
    amount: 15000,
    method: 'Bank Transfer',
    status: 'Failed',
    orderId: '',
  },
  {
    id: 'PAY-1006',
    customer: 'Meera Gupta',
    invoice: 'INV-1006',
    date: '2026-10-15',
    amount: 32000,
    method: 'Credit Card',
    status: 'Pending',
    orderId: '',
  },
]

const statusColors = {
  Completed: 'bg-green-100 text-green-700',
  Pending: 'bg-amber-100 text-amber-700',
  Failed: 'bg-red-100 text-red-700',
}

function money(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export default function Payments() {
  const [payments, setPayments] = useState(() =>
    loadData('payments', initialPayments),
  )

  const [orders] = useState(() => loadData('orders', []))

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    orderId: '',
    customer: '',
    invoice: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    method: 'UPI',
    status: 'Pending',
  })

  useEffect(() => {
    saveData('payments', payments)
  }, [payments])

  const completedPayments = payments.filter(
    (payment) => payment.status === 'Completed',
  )

  const pendingPayments = payments.filter(
    (payment) => payment.status === 'Pending',
  )

  const totalReceived = completedPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  )

  const pendingAmount = pendingPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  )

  const filteredPayments = payments.filter((payment) => {
    const term = search.toLowerCase()

    const matchesSearch =
      String(payment.customer || '').toLowerCase().includes(term) ||
      String(payment.invoice || '').toLowerCase().includes(term) ||
      String(payment.id || '').toLowerCase().includes(term) ||
      String(payment.orderId || '').toLowerCase().includes(term)

    const matchesStatus =
      statusFilter === 'All' || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  function handleOrderChange(orderId) {
    const selectedOrder = orders.find((order) => order.id === orderId)

    if (!selectedOrder) {
      setForm((previous) => ({
        ...previous,
        orderId: '',
        customer: '',
        amount: '',
      }))
      return
    }

    setForm((previous) => ({
      ...previous,
      orderId: selectedOrder.id,
      customer: selectedOrder.customer || '',
      amount: String(selectedOrder.amount ?? ''),
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextNumber =
      1001 +
      Math.max(
        0,
        ...payments.map(
          (payment) =>
            Number(String(payment.id).replace('PAY-', '')) - 1001,
        ),
      ) +
      1

    const newPayment = {
      id: `PAY-${nextNumber}`,
      orderId: form.orderId,
      customer: form.customer.trim(),
      invoice: form.invoice.trim(),
      date: form.date,
      amount: Number(form.amount),
      method: form.method,
      status: form.status,
    }

    setPayments((previous) => [newPayment, ...previous])

    setForm({
      orderId: '',
      customer: '',
      invoice: '',
      date: new Date().toISOString().slice(0, 10),
      amount: '',
      method: 'UPI',
      status: 'Pending',
    })

    setShowForm(false)
  }

  function exportCSV() {
    const header = [
      'Payment ID',
      'Order ID',
      'Customer',
      'Invoice',
      'Date',
      'Amount',
      'Method',
      'Status',
    ]

    const rows = filteredPayments.map((payment) => [
      payment.id,
      payment.orderId || '',
      payment.customer,
      payment.invoice,
      payment.date,
      payment.amount,
      payment.method,
      payment.status,
    ])

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'payments.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
            Revenue Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Payments
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor received payments, pending dues and transactions.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          <Plus size={18} />
          Add New Payment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Payments"
          value={payments.length}
          subtitle="All transaction records"
          icon={<CreditCard size={21} />}
        />

        <StatCard
          title="Total Received"
          value={money(totalReceived)}
          subtitle="Successfully completed payments"
          icon={<IndianRupee size={21} />}
        />

        <StatCard
          title="Pending Amount"
          value={money(pendingAmount)}
          subtitle="Awaiting payment"
          icon={<Clock size={21} />}
        />

        <StatCard
          title="Completed Payments"
          value={completedPayments.length}
          subtitle="Successfully processed"
          icon={<CheckCircle size={21} />}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              All Payments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and filter payment transactions.
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search payment, customer, invoice or order..."
              className="w-full py-3 text-sm outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-purple-400"
          >
            <option value="All">All payment statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Payment ID</th>
                <th className="px-5 py-4 font-semibold">Order ID</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Invoice</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Method</th>
                <th className="px-5 py-4 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-5 font-semibold text-purple-700">
                    {payment.id}
                  </td>

                  <td className="px-5 py-5 text-sm text-slate-600">
                    {payment.orderId || '—'}
                  </td>

                  <td className="px-5 py-5 font-medium text-slate-800">
                    {payment.customer}
                  </td>

                  <td className="px-5 py-5 text-sm text-slate-600">
                    {payment.invoice}
                  </td>

                  <td className="px-5 py-5 text-sm text-slate-500">
                    {payment.date}
                  </td>

                  <td className="px-5 py-5 font-semibold text-slate-800">
                    {money(payment.amount)}
                  </td>

                  <td className="px-5 py-5 text-sm text-slate-600">
                    {payment.method}
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[payment.status] ||
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No payments found. Try another search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add New Payment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select an order and enter payment details.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Select Order
                </label>

                <select
                  value={form.orderId}
                  onChange={(event) => handleOrderChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option value="">Manual payment (no order)</option>

                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.id} — {order.customer} — {money(order.amount)}
                    </option>
                  ))}
                </select>

                {orders.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No orders found. You can still enter payment details manually.
                  </p>
                )}
              </div>

              {form.orderId && (
                <div className="flex items-center gap-2 rounded-xl bg-purple-50 p-3 text-sm text-purple-700">
                  <ShoppingCart size={18} />
                  Selected order: {form.orderId}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Customer Name
                </label>

                <input
                  required
                  value={form.customer}
                  onChange={(event) =>
                    setForm({ ...form, customer: event.target.value })
                  }
                  placeholder="Enter customer name"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Invoice Number
                </label>

                <input
                  required
                  value={form.invoice}
                  onChange={(event) =>
                    setForm({ ...form, invoice: event.target.value })
                  }
                  placeholder="e.g. INV-1007"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Payment Date
                </label>

                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Amount (₹)
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({ ...form, amount: event.target.value })
                  }
                  placeholder="Enter payment amount"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <select
                  value={form.method}
                  onChange={(event) =>
                    setForm({ ...form, method: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Payment Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>

      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </div>
  )
}