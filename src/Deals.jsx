import { useEffect, useState } from 'react'
import { loadData, saveData } from './storage'
import {
  Handshake,
  Plus,
  Search,
  Download,
  X,
  IndianRupee,
  Trophy,
  Target,
  FileText,
} from 'lucide-react'

const initialDeals = [
  {
    id: 'DEAL-1001',
    name: 'Website Redesign',
    customer: 'Aarav Sharma',
    value: 85000,
    stage: 'Won',
    date: '2026-10-10',
    quotationId: '',
  },
  {
    id: 'DEAL-1002',
    name: 'CRM Implementation',
    customer: 'Priya Verma',
    value: 120000,
    stage: 'Negotiation',
    date: '2026-10-11',
    quotationId: '',
  },
  {
    id: 'DEAL-1003',
    name: 'Marketing Campaign',
    customer: 'Rahul Kumar',
    value: 65000,
    stage: 'Proposal',
    date: '2026-10-12',
    quotationId: '',
  },
  {
    id: 'DEAL-1004',
    name: 'Mobile App Development',
    customer: 'Ananya Singh',
    value: 180000,
    stage: 'Won',
    date: '2026-10-13',
    quotationId: '',
  },
  {
    id: 'DEAL-1005',
    name: 'SEO Services',
    customer: 'Vikram Patel',
    value: 45000,
    stage: 'Lost',
    date: '2026-10-14',
    quotationId: '',
  },
  {
    id: 'DEAL-1006',
    name: 'E-commerce Website',
    customer: 'Meera Gupta',
    value: 95000,
    stage: 'Qualified',
    date: '2026-10-15',
    quotationId: '',
  },
]

const stageColors = {
  Won: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',
  Negotiation: 'bg-amber-100 text-amber-700',
  Proposal: 'bg-blue-100 text-blue-700',
  Qualified: 'bg-purple-100 text-purple-700',
}

function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
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
    name: '',
    customer: '',
    value: '',
    stage: 'Qualified',
    date: getToday(),
    quotationId: '',
  }
}

export default function Deals() {
  const [deals, setDeals] = useState(() =>
    loadData('deals', initialDeals),
  )

  const [quotations] = useState(() =>
    loadData('quotations', []),
  )

  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [form, setForm] = useState(createEmptyForm)

  useEffect(() => {
    saveData('deals', deals)
  }, [deals])

  const totalValue = deals.reduce(
    (sum, deal) => sum + Number(deal.value || 0),
    0,
  )

  const wonDeals = deals.filter(
    (deal) => deal.stage === 'Won',
  )

  const openDeals = deals.filter(
    (deal) => !['Won', 'Lost'].includes(deal.stage),
  )

  const lostDeals = deals.filter(
    (deal) => deal.stage === 'Lost',
  )

  const filteredDeals = deals.filter((deal) => {
    const term = search.toLowerCase()

    const matchesSearch =
      String(deal.name || '').toLowerCase().includes(term) ||
      String(deal.customer || '').toLowerCase().includes(term) ||
      String(deal.id || '').toLowerCase().includes(term) ||
      String(deal.quotationId || '').toLowerCase().includes(term)

    const matchesStage =
      stageFilter === 'All' || deal.stage === stageFilter

    return matchesSearch && matchesStage
  })

  function handleQuotationChange(quotationId) {
    const selectedQuotation = quotations.find(
      (quotation) => quotation.id === quotationId,
    )

    if (!selectedQuotation) {
      setForm((previous) => ({
        ...previous,
        quotationId: '',
        customer: '',
        value: '',
        name: '',
      }))
      return
    }

    setForm((previous) => ({
      ...previous,
      quotationId: selectedQuotation.id,
      customer: selectedQuotation.customer || '',
      value: String(selectedQuotation.amount || ''),
      name: selectedQuotation.service || '',
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim() || !form.customer.trim()) {
      alert('Please enter the deal name and customer name.')
      return
    }

    const dealValue = Number(form.value)

    if (!Number.isFinite(dealValue) || dealValue <= 0) {
      alert('Please enter a valid deal value.')
      return
    }

    const nextNumber =
      1001 +
      Math.max(
        0,
        ...deals.map(
          (deal) =>
            Number(String(deal.id).replace('DEAL-', '')) - 1001,
        ),
      ) +
      1

    const newDeal = {
      id: `DEAL-${nextNumber}`,
      name: form.name.trim(),
      customer: form.customer.trim(),
      value: dealValue,
      stage: form.stage,
      date: form.date,
      quotationId: form.quotationId,
    }

    setDeals((previous) => [newDeal, ...previous])
    setForm(createEmptyForm())
    setShowForm(false)
  }

  function exportCSV() {
    const header = [
      'Deal ID',
      'Deal Name',
      'Customer',
      'Value',
      'Stage',
      'Date',
      'Quotation ID',
    ]

    const rows = filteredDeals.map((deal) => [
      deal.id,
      deal.name,
      deal.customer,
      deal.value,
      deal.stage,
      deal.date,
      deal.quotationId || '',
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
    link.download = 'deals.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
            Sales Performance
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Deals Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track sales opportunities and connect deals with quotations.
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
          Add New Deal
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Deals"
          value={deals.length}
          subtitle="All sales opportunities"
          icon={<Handshake size={21} />}
        />

        <StatCard
          title="Total Deal Value"
          value={money(totalValue)}
          subtitle="Combined deal value"
          icon={<IndianRupee size={21} />}
        />

        <StatCard
          title="Won Deals"
          value={wonDeals.length}
          subtitle="Successfully closed"
          icon={<Trophy size={21} />}
        />

        <StatCard
          title="Open Deals"
          value={openDeals.length}
          subtitle={`${lostDeals.length} lost deals`}
          icon={<Target size={21} />}
        />
      </div>

      {/* Deals table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              All Deals
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and filter your sales opportunities.
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
              placeholder="Search deal, customer or ID..."
              className="w-full py-3 text-sm outline-none"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-purple-400"
          >
            <option value="All">All stages</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Deal ID</th>
                <th className="px-5 py-4 font-semibold">Deal Name</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Value</th>
                <th className="px-5 py-4 font-semibold">Stage</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Quotation</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredDeals.map((deal) => (
                <tr
                  key={deal.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-5 font-semibold text-purple-700">
                    {deal.id}
                  </td>

                  <td className="px-5 py-5 font-medium text-slate-800">
                    {deal.name}
                  </td>

                  <td className="px-5 py-5 text-sm text-slate-600">
                    {deal.customer}
                  </td>

                  <td className="px-5 py-5 font-semibold text-slate-800">
                    {money(Number(deal.value || 0))}
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        stageColors[deal.stage] ||
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {deal.stage}
                    </span>
                  </td>

                  <td className="px-5 py-5 text-sm text-slate-500">
                    {deal.date}
                  </td>

                  <td className="px-5 py-5 text-sm text-slate-600">
                    {deal.quotationId ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-1 font-medium text-purple-700">
                        <FileText size={14} />
                        {deal.quotationId}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Not linked
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredDeals.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No deals found. Try another search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filteredDeals.length} of {deals.length} deals
        </div>
      </section>

      {/* Add Deal Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add New Deal
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Link a quotation or enter deal details manually.
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
              {/* Quotation dropdown */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Link Quotation (Optional)
                </label>

                <select
                  value={form.quotationId}
                  onChange={(event) =>
                    handleQuotationChange(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option value="">Select a quotation</option>

                  {quotations.map((quotation) => (
                    <option
                      key={quotation.id}
                      value={quotation.id}
                    >
                      {quotation.id} — {quotation.customer} —{' '}
                      {quotation.service}
                    </option>
                  ))}
                </select>

                {quotations.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No quotations found. You can still enter the details manually.
                  </p>
                )}
              </div>

              {/* Deal name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Deal Name
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter deal name"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-purple-400"
                />
              </div>

              {/* Customer name */}
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

              {/* Deal value */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Deal Value (₹)
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.value}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      value: event.target.value,
                    })
                  }
                  placeholder="Enter deal value"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-purple-400"
                />
              </div>

              {/* Expected close date */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Expected Close Date
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

              {/* Deal stage */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Deal Stage
                </label>

                <select
                  value={form.stage}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      stage: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-purple-400"
                >
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              {/* Form buttons */}
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
                  Save Deal
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