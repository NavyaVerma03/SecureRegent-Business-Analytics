import { useEffect, useMemo, useState } from 'react'
import { loadData, saveData } from './storage'
import {
  Users,
  UserCheck,
  UserRoundCheck,
  UserX,
  Search,
  Download,
  Filter,
} from 'lucide-react'
const initialLeads = [

  {
    id: 'LD-1001',
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    source: 'Website',
    status: 'Qualified',
    value: 45000,
  },
  {
    id: 'LD-1002',
    name: 'Priya Verma',
    email: 'priya@example.com',
    source: 'Referral',
    status: 'Converted',
    value: 72000,
  },
  {
    id: 'LD-1003',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    source: 'Social Media',
    status: 'New',
    value: 28000,
  },
  {
    id: 'LD-1004',
    name: 'Ananya Singh',
    email: 'ananya@example.com',
    source: 'Campaign',
    status: 'Qualified',
    value: 56000,
  },
  {
    id: 'LD-1005',
    name: 'Vikram Patel',
    email: 'vikram@example.com',
    source: 'Website',
    status: 'Unqualified',
    value: 15000,
  },
  {
    id: 'LD-1006',
    name: 'Meera Gupta',
    email: 'meera@example.com',
    source: 'Referral',
    status: 'New',
    value: 32000,
  },
  {
    id: 'LD-1007',
    name: 'Rohan Das',
    email: 'rohan@example.com',
    source: 'Social Media',
    status: 'Converted',
    value: 84000,
  },
  {
    id: 'LD-1008',
    name: 'Kavya Mishra',
    email: 'kavya@example.com',
    source: 'Website',
    status: 'Qualified',
    value: 39000,
  },
]

const statusStyles = {
  New: 'bg-blue-50 text-blue-700',
  Qualified: 'bg-violet-50 text-violet-700',
  Converted: 'bg-emerald-50 text-emerald-700',
  Unqualified: 'bg-rose-50 text-rose-700',
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export default function Leads() {
  const [leads, setLeads] = useState(() => loadData('leads', initialLeads))
  useEffect(() => {
    saveData('leads', leads)
    }, [leads])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    source: 'Website',
    value: '',
  })

  const stats = useMemo(() => {
    const total = leads.length
    const qualified = leads.filter((lead) => lead.status === 'Qualified').length
    const converted = leads.filter((lead) => lead.status === 'Converted').length
    const unqualified = leads.filter((lead) => lead.status === 'Unqualified').length

    return [
      {
        label: 'Total Leads',
        value: total,
        icon: Users,
        color: 'bg-blue-50 text-blue-700',
      },
      {
        label: 'Qualified Leads',
        value: qualified,
        icon: UserCheck,
        color: 'bg-violet-50 text-violet-700',
      },
      {
        label: 'Converted Leads',
        value: converted,
        icon: UserRoundCheck,
        color: 'bg-emerald-50 text-emerald-700',
      },
      {
        label: 'Unqualified Leads',
        value: unqualified,
        icon: UserX,
        color: 'bg-rose-50 text-rose-700',
      },
    ]
  }, [leads])

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      `${lead.id} ${lead.name} ${lead.email}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || lead.status === statusFilter

    const matchesSource =
      sourceFilter === 'All' || lead.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  function addLead(event) {
    event.preventDefault()

    if (!newLead.name.trim() || !newLead.email.trim()) return

    const lead = {
      id: `LD-${1001 + leads.length}`,
      name: newLead.name.trim(),
      email: newLead.email.trim(),
      source: newLead.source,
      status: 'New',
      value: Number(newLead.value) || 0,
    }

    setLeads((current) => [lead, ...current])
    setNewLead({
      name: '',
      email: '',
      source: 'Website',
      value: '',
    })
    setShowForm(false)
  }

  function exportLeads() {
    const headers = ['ID', 'Name', 'Email', 'Source', 'Status', 'Value']
    const rows = filteredLeads.map((lead) => [
      lead.id,
      lead.name,
      lead.email,
      lead.source,
      lead.status,
      lead.value,
    ])

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'leads.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-violet-600">CUSTOMER PIPELINE</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Lead Analytics
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Track, qualify and manage your business leads.
          </p>
        </div>

        <button
          onClick={() => setShowForm((current) => !current)}
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          + Add New Lead
        </button>
      </section>

      {showForm && (
        <form
          onSubmit={addLead}
          className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-5"
        >
          <label className="text-sm font-medium text-slate-600">
            Customer name
            <input
              required
              value={newLead.name}
              onChange={(event) =>
                setNewLead({ ...newLead, name: event.target.value })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
              placeholder="Enter name"
            />
          </label>

          <label className="text-sm font-medium text-slate-600">
            Email
            <input
              required
              type="email"
              value={newLead.email}
              onChange={(event) =>
                setNewLead({ ...newLead, email: event.target.value })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
              placeholder="name@example.com"
            />
          </label>

          <label className="text-sm font-medium text-slate-600">
            Lead source
            <select
              value={newLead.source}
              onChange={(event) =>
                setNewLead({ ...newLead, source: event.target.value })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none"
            >
              <option>Website</option>
              <option>Referral</option>
              <option>Social Media</option>
              <option>Campaign</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-600">
            Estimated value (₹)
            <input
              type="number"
              min="0"
              value={newLead.value}
              onChange={(event) =>
                setNewLead({ ...newLead, value: event.target.value })
              }
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
              placeholder="25000"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Save Lead
            </button>
          </div>
        </form>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon size={21} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
            <p className="mt-2 text-xs text-slate-400">
              Based on current sample records
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">All Leads</h3>
            <p className="mt-1 text-sm text-slate-500">
              Search records and filter by status or source.
            </p>
          </div>

          <button
            onClick={exportLeads}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Download size={17} /> Export CSV
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or ID..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3">
            <Filter size={17} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            >
              <option value="All">All statuses</option>
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Unqualified">Unqualified</option>
            </select>
          </label>

          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
          >
            <option value="All">All sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Campaign">Campaign</option>
          </select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                <th className="pb-4 font-medium">Lead</th>
                <th className="pb-4 font-medium">Source</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Estimated value</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 font-semibold text-violet-700">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{lead.name}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {lead.id} · {lead.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-slate-600">{lead.source}</td>
                  <td className="py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[lead.status]}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-4 font-semibold text-slate-800">
                    {formatCurrency(lead.value)}
                  </td>
                </tr>
              ))}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-slate-400">
                    No matching leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
          Showing {filteredLeads.length} of {leads.length} leads
        </div>
      </section>
    </div>
  )
}