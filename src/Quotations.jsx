import { useEffect, useMemo, useState } from 'react'
import { loadData, saveData } from './storage'
import {
  FileText,
  Plus,
  Search,
  Download,
  X,
  IndianRupee,
  CheckCircle2,
  TrendingUp,
  Link2,
} from 'lucide-react'

const initialQuotations = [
  {
    id: 'QT-1001',
    customer: 'Aarav Sharma',
    leadId: 'LD-1001',
    service: 'Website Development',
    date: '2026-10-10',
    amount: 45000,
    status: 'Accepted',
    dealId: '',
  },
  {
    id: 'QT-1002',
    customer: 'Priya Verma',
    leadId: 'LD-1002',
    service: 'CRM Implementation',
    date: '2026-10-11',
    amount: 72000,
    status: 'Sent',
    dealId: '',
  },
  {
    id: 'QT-1003',
    customer: 'Rahul Kumar',
    leadId: 'LD-1003',
    service: 'SEO Services',
    date: '2026-10-12',
    amount: 28000,
    status: 'Pending',
    dealId: '',
  },
  {
    id: 'QT-1004',
    customer: 'Ananya Singh',
    leadId: 'LD-1004',
    service: 'Mobile App Development',
    date: '2026-10-13',
    amount: 56000,
    status: 'Accepted',
    dealId: '',
  },
  {
    id: 'QT-1005',
    customer: 'Vikram Patel',
    leadId: 'LD-1005',
    service: 'Marketing Package',
    date: '2026-10-14',
    amount: 15000,
    status: 'Rejected',
    dealId: '',
  },
]

const statusColors = {
  Accepted: 'bg-green-100 text-green-700',
  Sent: 'bg-blue-100 text-blue-700',
  Pending: 'bg-amber-100 text-amber-700',
  Rejected: 'bg-red-100 text-red-700',
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)

const getToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getNextQuotationId(quotations) {
  const largestNumber = quotations.reduce((largest, quotation) => {
    const number = Number(
      String(quotation.id || '').replace('QT-', ''),
    )

    return Number.isFinite(number)
      ? Math.max(largest, number)
      : largest
  }, 1000)

  return `QT-${largestNumber + 1}`
}

export default function Quotations() {
  const [quotations, setQuotations] = useState(() =>
    loadData('quotations', initialQuotations),
  )

  const [deals] = useState(() => loadData('deals', []))

  const [leads] = useState(() => loadData('leads', []))

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const emptyForm = {
    customer: '',
    leadId: '',
    service: 'Website Development',
    date: getToday(),
    amount: '',
    status: 'Pending',
    dealId: '',
  }

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    saveData('quotations', quotations)
  }, [quotations])

  const totalValue = quotations.reduce(
    (sum, quotation) => sum + (Number(quotation.amount) || 0),
    0,
  )

  const accepted = quotations.filter(
    (quotation) => quotation.status === 'Accepted',
  )

  const rejected = quotations.filter(
    (quotation) => quotation.status === 'Rejected',
  )

  const acceptanceRate = quotations.length
    ? Math.round((accepted.length / quotations.length) * 100)
    : 0

  const filteredQuotations = useMemo(() => {
    const today = getToday()
    const todayDate = new Date(`${today}T00:00:00`)
    const startDate = new Date(todayDate)

    if (dateFilter === 'Last 7 Days') {
      startDate.setDate(startDate.getDate() - 6)
    }

    if (dateFilter === 'Last 30 Days') {
      startDate.setDate(startDate.getDate() - 29)
    }

    return quotations.filter((quotation) => {
      const query = search.trim().toLowerCase()

      const matchesSearch = [
        quotation.customer,
        quotation.id,
        quotation.service,
        quotation.leadId,
      ].some((value) =>
        String(value || '').toLowerCase().includes(query),
      )

      const matchesStatus =
        statusFilter === 'All' ||
        quotation.status === statusFilter

      let matchesDate = true

      if (dateFilter === 'Today') {
        matchesDate = quotation.date === today
      } else if (
        dateFilter === 'Last 7 Days' ||
        dateFilter === 'Last 30 Days'
      ) {
        const quotationDate = new Date(
          `${quotation.date}T00:00:00`,
        )

        matchesDate =
          !Number.isNaN(quotationDate.getTime()) &&
          quotationDate >= startDate &&
          quotationDate <= todayDate
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [quotations, search, statusFilter, dateFilter])

  function handleLeadChange(leadId) {
    const selectedLead = leads.find((lead) => lead.id === leadId)

    setForm((previous) => ({
      ...previous,
      leadId,
      customer: selectedLead?.name || '',
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const amount = Number(form.amount)

    if (
      !form.leadId ||
      !form.customer.trim() ||
      !form.service.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      alert('Please select a lead and enter a valid amount.')
      return
    }

    const newQuotation = {
      id: getNextQuotationId(quotations),
      customer: form.customer.trim(),
      leadId: form.leadId,
      service: form.service,
      date: form.date,
      amount,
      status: form.status,
      dealId: form.dealId,
    }

    setQuotations((previous) => [
      newQuotation,
      ...previous,
    ])

    setForm({
      ...emptyForm,
      date: getToday(),
    })

    setShowForm(false)
  }

  function exportCSV() {
    const headers = [
      'Quotation ID',
      'Customer',
      'Lead ID',
      'Service',
      'Date',
      'Amount',
      'Status',
      'Linked Deal ID',
    ]

    const rows = filteredQuotations.map((quotation) => [
      quotation.id,
      quotation.customer,
      quotation.leadId || '',
      quotation.service || 'Not specified',
      quotation.date,
      quotation.amount,
      quotation.status,
      quotation.dealId || '',
    ])

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? '').replace(/"/g, '""')}"`,
          )
          .join(','),
      )
      .join('\r\n')

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'quotations.csv'

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  const stats = [
    {
      title: 'Total Quotations',
      value: quotations.length,
      subtitle: 'All quotation records',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Total Quotation Value',
      value: formatCurrency(totalValue),
      subtitle: 'Combined estimated value',
      icon: IndianRupee,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Accepted Quotations',
      value: accepted.length,
      subtitle: `${rejected.length} rejected`,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Acceptance Rate',
      value: `${acceptanceRate}%`,
      subtitle: 'Accepted out of all quotations',
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  return (
    <div className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
            Sales Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Quotations
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create, track and manage customer quotations.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download size={18} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-purple-700"
          >
            <Plus size={18} />
            Add New Quotation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-4 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {stat.subtitle}
              </p>
            </div>
          )
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            All Quotations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Search and filter your quotation records.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, ID or service..."
              className="w-full py-3 text-sm outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-purple-400"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-purple-400"
          >
            <option value="All">All dates</option>
            <option value="Today">Today</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Quotation</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Lead ID</th>
                <th className="px-5 py-4 font-semibold">Service</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Linked Deal</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredQuotations.map((quotation) => {
                const linkedDeal = deals.find(
                  (deal) => deal.id === quotation.dealId,
                )

                return (
                  <tr
                    key={quotation.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-purple-700">
                      {quotation.id}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-800">
                      {quotation.customer}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {quotation.leadId || 'Not linked'}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {quotation.service || 'Not specified'}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {quotation.date}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {formatCurrency(quotation.amount)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColors[quotation.status] ||
                          'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {quotation.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {linkedDeal
                        ? `${linkedDeal.id} · ${linkedDeal.name}`
                        : quotation.dealId || 'Not linked'}
                    </td>
                  </tr>
                )
              })}

              {filteredQuotations.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No quotations found. Try changing your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filteredQuotations.length} of {quotations.length} quotations
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add New Quotation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a lead and enter quotation details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setForm({ ...emptyForm, date: getToday() })
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Select Lead
                </label>

                <select
                  required
                  value={form.leadId}
                  onChange={(event) =>
                    handleLeadChange(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option value="">Choose a lead</option>

                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} ({lead.id})
                    </option>
                  ))}
                </select>

                {leads.length === 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    No leads found. Please add a lead first.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Customer Name
                </label>

                <input
                  required
                  value={form.customer}
                  readOnly
                  placeholder="Select a lead first"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Service / Product
                </label>

                <select
                  value={form.service}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      service: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option>Website Development</option>
                  <option>CRM Implementation</option>
                  <option>SEO Services</option>
                  <option>Mobile App Development</option>
                  <option>Marketing Package</option>
                  <option>Software Subscription</option>
                  <option>Consulting</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Quotation Date
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
                  step="1"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({ ...form, amount: event.target.value })
                  }
                  placeholder="Enter amount"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option value="Pending">Pending</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Link to Existing Deal (optional)
                </label>

                <select
                  value={form.dealId}
                  onChange={(event) =>
                    setForm({ ...form, dealId: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option value="">No deal linked</option>

                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.id} — {deal.name} ({deal.customer})
                    </option>
                  ))}
                </select>

                <p className="mt-1 text-xs text-slate-500">
                  Only deals already saved in this browser appear here.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setForm({ ...emptyForm, date: getToday() })
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leads.length === 0}
                  className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}