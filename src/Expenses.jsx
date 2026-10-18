import { useEffect, useState } from 'react'
import { loadData, saveData } from './storage'
import {
  Wallet,
  TrendingDown,
  Clock,
  CheckCircle,
  Plus,
  Download,
  Search,
  X,
} from 'lucide-react'

const initialExpenses = [
  {
    id: 1,
    title: 'Office Rent',
    category: 'Office',
    amount: 25000,
    date: '2026-10-05',
    status: 'Paid',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 2,
    title: 'Marketing Campaign',
    category: 'Marketing',
    amount: 12000,
    date: '2026-10-08',
    status: 'Pending',
    paymentMethod: 'UPI',
  },
  {
    id: 3,
    title: 'Internet Bill',
    category: 'Utilities',
    amount: 1500,
    date: '2026-10-10',
    status: 'Paid',
    paymentMethod: 'UPI',
  },
  {
    id: 4,
    title: 'Software Subscription',
    category: 'Software',
    amount: 3500,
    date: '2026-10-12',
    status: 'Pending',
    paymentMethod: 'Card',
  },
  {
    id: 5,
    title: 'Travel Expenses',
    category: 'Travel',
    amount: 4500,
    date: '2026-10-14',
    status: 'Paid',
    paymentMethod: 'Cash',
  },
]

const money = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export default function Expenses() {
const [expenses, setExpenses] = useState(() => loadData('expenses', initialExpenses))
useEffect(() => {
  saveData('expenses', expenses)
}, [expenses])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    title: '',
    category: 'Office',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Pending',
    paymentMethod: 'Bank Transfer',
  })

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  )

  const paidExpenses = expenses
    .filter((expense) => expense.status === 'Paid')
    .reduce((total, expense) => total + expense.amount, 0)

  const pendingExpenses = expenses
    .filter((expense) => expense.status === 'Pending')
    .reduce((total, expense) => total + expense.amount, 0)

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(search.toLowerCase()) ||
      expense.category.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || expense.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddExpense = (event) => {
    event.preventDefault()

    const newExpense = {
      ...form,
      id: Date.now(),
      amount: Number(form.amount),
    }

    setExpenses((previous) => [newExpense, ...previous])
    setShowForm(false)

    setForm({
      title: '',
      category: 'Office',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      paymentMethod: 'Bank Transfer',
    })
  }

  const exportCSV = () => {
    const headers = [
      'Expense',
      'Category',
      'Amount',
      'Date',
      'Status',
      'Payment Method',
    ]

    const rows = filteredExpenses.map((expense) => [
      expense.title,
      expense.category,
      expense.amount,
      expense.date,
      expense.status,
      expense.paymentMethod,
    ])

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','),
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'expenses.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  const stats = [
    {
      title: 'Total Expenses',
      value: money(totalExpenses),
      icon: Wallet,
      color: 'bg-violet-100 text-violet-600',
    },
    {
      title: 'Paid Expenses',
      value: money(paidExpenses),
      icon: CheckCircle,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Pending Expenses',
      value: money(pendingExpenses),
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Total Records',
      value: expenses.length,
      icon: TrendingDown,
      color: 'bg-blue-100 text-blue-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-violet-600">
            BUSINESS FINANCE
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Expenses
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage your business expenses.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus size={17} />
            Add Expense
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{stat.title}</p>
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {stat.value}
              </h2>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search expenses or categories..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                <th className="px-4 py-3 font-semibold">Expense</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Payment Method</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {expense.title}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {expense.category}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {expense.date}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {expense.paymentMethod}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {money(expense.amount)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        expense.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {expense.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Add New Expense
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Expense Name
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Office Supplies"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none"
                  >
                    <option>Office</option>
                    <option>Marketing</option>
                    <option>Utilities</option>
                    <option>Software</option>
                    <option>Travel</option>
                    <option>Salary</option>
                    <option>Other</option>
                  </select>
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
                    placeholder="5000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Date
                </label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none"
                  >
                    <option>Pending</option>
                    <option>Paid</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Payment Method
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(event) =>
                      setForm({ ...form, paymentMethod: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none"
                  >
                    <option>Bank Transfer</option>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Cash</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}