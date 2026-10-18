import { useEffect, useState } from 'react'
import { loadData, saveData } from './storage'
import {
  ShoppingCart,
  Plus,
  Search,
  Download,
  X,
  IndianRupee,
  PackageCheck,
  Truck,
  Link2,
} from 'lucide-react'

const initialOrders = [
  {
    id: 'ORD-1001',
    customer: 'Aarav Sharma',
    product: 'Website Development',
    date: '2026-10-10',
    amount: 45000,
    status: 'Delivered',
    payment: 'Paid',
    dealId: '',
  },
  {
    id: 'ORD-1002',
    customer: 'Priya Verma',
    product: 'CRM Software',
    date: '2026-10-11',
    amount: 72000,
    status: 'Processing',
    payment: 'Paid',
    dealId: '',
  },
  {
    id: 'ORD-1003',
    customer: 'Rahul Kumar',
    product: 'SEO Services',
    date: '2026-10-12',
    amount: 28000,
    status: 'Pending',
    payment: 'Unpaid',
    dealId: '',
  },
  {
    id: 'ORD-1004',
    customer: 'Ananya Singh',
    product: 'Mobile App',
    date: '2026-10-13',
    amount: 56000,
    status: 'Shipped',
    payment: 'Paid',
    dealId: '',
  },
  {
    id: 'ORD-1005',
    customer: 'Vikram Patel',
    product: 'Marketing Package',
    date: '2026-10-14',
    amount: 15000,
    status: 'Cancelled',
    payment: 'Unpaid',
    dealId: '',
  },
]

const statusColors = {
  Delivered: 'bg-green-100 text-green-700',
  Processing: 'bg-blue-100 text-blue-700',
  Pending: 'bg-amber-100 text-amber-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Cancelled: 'bg-red-100 text-red-700',
}

const paymentColors = {
  Paid: 'bg-green-100 text-green-700',
  Unpaid: 'bg-red-100 text-red-700',
}

function money(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}

function getToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function createEmptyForm() {
  return {
    customer: '',
    product: '',
    date: getToday(),
    amount: '',
    status: 'Pending',
    payment: 'Unpaid',
    dealId: '',
  }
}

export default function Orders() {
  const [orders, setOrders] = useState(() =>
    loadData('orders', initialOrders),
  )

  const [deals] = useState(() =>
    loadData('deals', []),
  )

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(createEmptyForm)

  useEffect(() => {
    saveData('orders', orders)
  }, [orders])

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.amount || 0),
    0,
  )

  const delivered = orders.filter(
    (order) => order.status === 'Delivered',
  )

  const pending = orders.filter((order) =>
    ['Pending', 'Processing'].includes(order.status),
  )

  const filteredOrders = orders.filter((order) => {
    const term = search.toLowerCase()

    const matchesSearch =
      String(order.customer || '').toLowerCase().includes(term) ||
      String(order.product || '').toLowerCase().includes(term) ||
      String(order.id || '').toLowerCase().includes(term) ||
      String(order.dealId || '').toLowerCase().includes(term)

    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  function handleDealChange(dealId) {
    const selectedDeal = deals.find(
      (deal) => deal.id === dealId,
    )

    if (!selectedDeal) {
      setForm((previous) => ({
        ...previous,
        dealId: '',
        customer: '',
        product: '',
        amount: '',
      }))
      return
    }

    setForm((previous) => ({
      ...previous,
      dealId: selectedDeal.id,
      customer: selectedDeal.customer || '',
      product: selectedDeal.name || '',
      amount: String(selectedDeal.value || ''),
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.customer.trim() || !form.product.trim()) {
      alert('Please enter customer name and product/service.')
      return
    }

    const amount = Number(form.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Please enter a valid order amount.')
      return
    }

    const nextNumber =
      1001 +
      Math.max(
        0,
        ...orders.map(
          (order) =>
            Number(String(order.id).replace('ORD-', '')) - 1001,
        ),
      ) +
      1

    const newOrder = {
      id: `ORD-${nextNumber}`,
      customer: form.customer.trim(),
      product: form.product.trim(),
      date: form.date,
      amount,
      status: form.status,
      payment: form.payment,
      dealId: form.dealId,
    }

    setOrders((previous) => [newOrder, ...previous])
    setForm(createEmptyForm())
    setShowForm(false)
  }

  function exportCSV() {
    const header = [
      'Order ID',
      'Customer',
      'Product / Service',
      'Date',
      'Amount',
      'Order Status',
      'Payment Status',
      'Deal ID',
    ]

    const rows = filteredOrders.map((order) => [
      order.id,
      order.customer,
      order.product,
      order.date,
      order.amount,
      order.status,
      order.payment,
      order.dealId || '',
    ])

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? '').replaceAll('"', '""')}"`,
          )
          .join(','),
      )
      .join('\n')

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'orders.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
            Sales Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Orders Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage customer orders and link them with sales deals.
          </p>
        </div>

        <button
          onClick={() => {
            setForm(createEmptyForm())
            setShowForm(true)
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          <Plus size={18} />
          Add New Order
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={orders.length}
          subtitle="All customer orders"
          icon={<ShoppingCart size={21} />}
        />

        <StatCard
          title="Total Order Value"
          value={money(totalValue)}
          subtitle="Combined order amount"
          icon={<IndianRupee size={21} />}
        />

        <StatCard
          title="Delivered Orders"
          value={delivered.length}
          subtitle="Successfully delivered"
          icon={<PackageCheck size={21} />}
        />

        <StatCard
          title="Pending Orders"
          value={pending.length}
          subtitle="Pending or processing"
          icon={<Truck size={21} />}
        />
      </div>

      {/* Orders table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              All Orders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and filter customer orders.
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

        {/* Search and filter */}
        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer, product or deal..."
              className="w-full py-3 text-sm outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-purple-400"
          >
            <option value="All">All order statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Order ID</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Product / Service</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Order Status</th>
                <th className="px-5 py-4 font-semibold">Payment</th>
                <th className="px-5 py-4 font-semibold">Deal ID</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-5 font-semibold text-purple-700">
                    {order.id}
                  </td>

                  <td className="px-5 py-5 font-medium text-slate-800">
                    {order.customer}
                  </td>

                  <td className="px-5 py-5 text-sm text-slate-600">
                    {order.product}
                  </td>

                  <td className="px-5 py-5 text-sm text-slate-500">
                    {order.date}
                  </td>

                  <td className="px-5 py-5 font-semibold text-slate-800">
                    {money(order.amount)}
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[order.status] ||
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        paymentColors[order.payment] ||
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.payment}
                    </span>
                  </td>

                  <td className="px-5 py-5 text-sm">
                    {order.dealId ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-1 font-medium text-purple-700">
                        <Link2 size={14} />
                        {order.dealId}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Not linked
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No orders found. Try another search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </section>

      {/* Add Order Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add New Order
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a deal or enter order details manually.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {/* Deal dropdown */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Link Deal (Optional)
                </label>

                <select
                  value={form.dealId}
                  onChange={(event) =>
                    handleDealChange(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option value="">Select a deal</option>

                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.id} — {deal.customer} — {deal.name}
                    </option>
                  ))}
                </select>

                {deals.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No deals found. You can enter order details manually.
                  </p>
                )}
              </div>

              {/* Customer */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Customer Name
                </label>

                <input
                  required
                  value={form.customer}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      customer: event.target.value,
                    })
                  }
                  placeholder="Enter customer name"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-purple-400"
                />
              </div>

              {/* Product or service */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Product / Service
                </label>

                <input
                  required
                  value={form.product}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      product: event.target.value,
                    })
                  }
                  placeholder="Enter product or service"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-purple-400"
                />
              </div>

              {/* Order date */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Order Date
                </label>

                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      date: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-purple-400"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Order Amount (₹)
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount: event.target.value,
                    })
                  }
                  placeholder="Enter amount"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-purple-400"
                />
              </div>

              {/* Order status */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Order Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment status */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Payment Status
                </label>

                <select
                  value={form.payment}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      payment: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {/* Buttons */}
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
                  Save Order
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
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {subtitle}
      </p>
    </div>
  )
}