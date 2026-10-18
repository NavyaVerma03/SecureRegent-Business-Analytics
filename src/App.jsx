import { useEffect, useMemo, useState } from 'react'
import Quotations from './Quotations'
import Deals from './Deals'
import Orders from './Orders'
import Payments from './Payments'
import Expenses from './Expenses'
import Leads from './Leads'
import { loadData } from './storage'

import {
  LayoutDashboard,
  Users,
  FileText,
  BriefcaseBusiness,
  ShoppingCart,
  CreditCard,
  Wallet,
  Search,
  Menu,
  TrendingUp,
  IndianRupee,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Target,
} from 'lucide-react'

const navigation = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Leads', icon: Users },
  { name: 'Quotations', icon: FileText },
  { name: 'Deals', icon: BriefcaseBusiness },
  { name: 'Orders', icon: ShoppingCart },
  { name: 'Payments', icon: CreditCard },
  { name: 'Expenses', icon: Wallet },
]

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

function safeLoad(key) {
  try {
    const value = loadData(key, [])
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function dateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayString() {
  return dateString(new Date())
}

function parseDate(value) {
  if (!value) return null

  const text = String(value).trim()
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text)

  let date

  if (match) {
    date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
    )
  } else {
    date = new Date(text)
  }

  if (Number.isNaN(date.getTime())) return null

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )
}

function recordDate(record) {
  return parseDate(
    record.date ??
      record.paymentDate ??
      record.createdAt ??
      record.createdDate ??
      record.transactionDate,
  )
}

function withinRange(record, start, end) {
  const date = recordDate(record)

  return Boolean(
    date &&
      start &&
      end &&
      date >= start &&
      date <= end,
  )
}

function dateRange(period, today, customStart, customEnd) {
  const start = new Date(today)
  const end = new Date(today)

  if (period === 'Today') {
    return { start, end }
  }

  if (period === 'Last 7 days') {
    start.setDate(start.getDate() - 6)
    return { start, end }
  }

  if (period === 'Last 30 days') {
    start.setDate(start.getDate() - 29)
    return { start, end }
  }

  if (period === 'This year') {
    start.setMonth(0, 1)
    return { start, end }
  }

  if (period === 'Custom Range') {
    const customStartDate = parseDate(customStart)
    const customEndDate = parseDate(customEnd)

    return {
      start: customStartDate || start,
      end: customEndDate || end,
    }
  }

  return { start, end }
}

function previousRange(start, end) {
  const duration = Math.max(
    1,
    Math.round((end - start) / 86400000) + 1,
  )

  const previousEnd = new Date(start)
  previousEnd.setDate(previousEnd.getDate() - 1)

  const previousStart = new Date(previousEnd)
  previousStart.setDate(previousStart.getDate() - duration + 1)

  return {
    start: previousStart,
    end: previousEnd,
  }
}

function percentageChange(current, previous) {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%'
  }

  const change = ((current - previous) / previous) * 100

  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
}

function completedPayments(payments) {
  return payments.filter(
    (payment) =>
      String(payment.status || '').toLowerCase() === 'completed',
  )
}

function sumAmount(records) {
  return records.reduce(
    (sum, record) => sum + (Number(record.amount) || 0),
    0,
  )
}

function Panel({ title, subtitle, children, action }) {
  return (
    <section className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.22)] transition-all duration-300 hover:border-violet-100 hover:shadow-[0_16px_40px_-22px_rgba(109,40,217,0.22)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold tracking-tight text-slate-900">{title}</h3>

          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  )
}

function BarList({ items, valueKey = 'count', currency = false }) {
  const maximum = Math.max(
    1,
    ...items.map((item) => Number(item[valueKey]) || 0),
  )

  if (!items.length) {
    return (
      <p className="py-5 text-sm text-slate-400">
        No data available for this period.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0

        return (
          <div key={item.name}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-slate-600">
                {item.name}
              </span>

              <span className="font-semibold text-slate-800">
                {currency ? money(value) : value}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{ width: `${(value / maximum) * 100}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  change,
}) {
  const isNegative =
    typeof change === 'string' && change.startsWith('-')

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50 sm:p-6">

      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-50 opacity-70 transition-transform duration-300 group-hover:scale-150" />

      {/* Card content */}
      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${color}`}
        >
          <Icon size={23} strokeWidth={2} />
        </div>
      </div>

      {/* Description */}
      <div className="relative mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs leading-5 text-slate-500">
          {description}
        </p>

        {change !== undefined && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                isNegative
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {change}
            </span>

            <span className="text-xs text-slate-400">
              vs previous period
            </span>
          </div>
        )}
      </div>
    </article>
  )
}

export default function App() {
  const [activePage, setActivePage] = useState(() => {
    try {
      const saved = localStorage.getItem('secureRegent_activePage')
      return navigation.some((item) => item.name === saved)
        ? saved
        : 'Overview'
    } catch {
      return 'Overview'
    }
  })

  const [period, setPeriod] = useState('Last 7 days')

  const [customStart, setCustomStart] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 6)
    return dateString(date)
  })

  const [customEnd, setCustomEnd] = useState(todayString)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem('secureRegent_activePage', activePage)
    } catch (error) {
      console.error('Unable to save page:', error)
    }
  }, [activePage])

  const leads = useMemo(() => safeLoad('leads'), [activePage])
  const quotations = useMemo(() => safeLoad('quotations'), [activePage])
  const deals = useMemo(() => safeLoad('deals'), [activePage])
  const orders = useMemo(() => safeLoad('orders'), [activePage])
  const payments = useMemo(() => safeLoad('payments'), [activePage])
  const expenses = useMemo(() => safeLoad('expenses'), [activePage])

  const today = useMemo(() => parseDate(todayString()), [])

  const { start, end } = useMemo(
    () => dateRange(period, today, customStart, customEnd),
    [period, today, customStart, customEnd],
  )

  const previous = useMemo(
    () => previousRange(start, end),
    [start, end],
  )

  const validRange = start <= end

  const rangePayments = validRange
    ? payments.filter((item) => withinRange(item, start, end))
    : []

  const previousPayments = validRange
    ? payments.filter((item) =>
        withinRange(item, previous.start, previous.end),
      )
    : []

  // FIX: Purane leads mein date na ho, tab bhi unhe count karo.
  const rangeLeads = validRange
    ? leads.filter((item) => {
        const date = recordDate(item)
        return date ? withinRange(item, start, end) : true
      })
    : []

  // Previous period comparison mein bina date wale leads include nahi honge.
  const previousLeads = validRange
    ? leads.filter((item) => {
        const date = recordDate(item)
        return date
          ? withinRange(item, previous.start, previous.end)
          : false
      })
    : []

  const rangeQuotations = validRange
    ? quotations.filter((item) => withinRange(item, start, end))
    : []

  const rangeDeals = validRange
    ? deals.filter((item) => withinRange(item, start, end))
    : []

  const rangeOrders = validRange
    ? orders.filter((item) => withinRange(item, start, end))
    : []

  const rangeExpenses = validRange
    ? expenses.filter((item) => withinRange(item, start, end))
    : []

  const completed = completedPayments(rangePayments)
  const previousCompleted = completedPayments(previousPayments)

  const revenue = sumAmount(completed)
  const previousRevenue = sumAmount(previousCompleted)

  const pendingPayments = rangePayments.filter(
    (item) => String(item.status || '').toLowerCase() === 'pending',
  )

  const outstanding = sumAmount(pendingPayments)

  const qualifiedLeads = rangeLeads.filter(
    (item) => String(item.status || '').toLowerCase() === 'qualified',
  )

  const convertedLeads = rangeLeads.filter(
    (item) => String(item.status || '').toLowerCase() === 'converted',
  )

  const unqualifiedLeads = rangeLeads.filter(
    (item) => String(item.status || '').toLowerCase() === 'unqualified',
  )

  const conversionRate = rangeLeads.length
    ? Math.round((convertedLeads.length / rangeLeads.length) * 100)
    : 0

  const previousConversionRate = previousLeads.length
    ? Math.round(
        (previousLeads.filter(
          (item) => String(item.status || '').toLowerCase() === 'converted',
        ).length /
          previousLeads.length) *
          100,
      )
    : 0

  const activeDeals = rangeDeals.filter((item) => {
    const stage = String(item.stage || item.status || '').toLowerCase()
    return !['won', 'lost'].includes(stage)
  })

  const totalQuotationValue = sumAmount(rangeQuotations)

  const acceptedQuotations = rangeQuotations.filter(
    (item) => String(item.status || '').toLowerCase() === 'accepted',
  )

  const totalExpenses = sumAmount(
    rangeExpenses.filter(
      (item) => String(item.status || '').toLowerCase() === 'paid',
    ),
  )

  const collectionBase = rangePayments.filter((item) =>
    ['completed', 'pending', 'failed'].includes(
      String(item.status || '').toLowerCase(),
    ),
  )

  const collectionRate = sumAmount(collectionBase)
    ? Math.round((revenue / sumAmount(collectionBase)) * 100)
    : 0

  const stats = [
    {
      title: 'Total Revenue',
      value: money(revenue),
      description: 'Completed payments in selected period',
      icon: IndianRupee,
      color: 'bg-violet-100 text-violet-700',
      change: percentageChange(revenue, previousRevenue),
    },
    {
      title: 'Total Leads',
      value: rangeLeads.length,
      description: 'Leads in selected period; undated leads included',
      icon: Users,
      color: 'bg-blue-100 text-blue-700',
      change: percentageChange(rangeLeads.length, previousLeads.length),
    },
    {
      title: 'Active Deals',
      value: activeDeals.length,
      description: 'Deals excluding Won and Lost',
      icon: BriefcaseBusiness,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Outstanding',
      value: money(outstanding),
      description: 'Pending payments in selected period',
      icon: CreditCard,
      color: 'bg-orange-100 text-orange-700',
    },
  ]

  const leadStatuses = [
    {
      name: 'New',
      count: rangeLeads.filter(
        (item) => String(item.status || '').toLowerCase() === 'new',
      ).length,
    },
    { name: 'Qualified', count: qualifiedLeads.length },
    { name: 'Converted', count: convertedLeads.length },
    { name: 'Unqualified', count: unqualifiedLeads.length },
  ]

  const sourceMap = {}

  rangeLeads.forEach((lead) => {
    const source = lead.source || 'Other'
    sourceMap[source] = (sourceMap[source] || 0) + 1
  })

  const sourceItems = Object.entries(sourceMap).map(([name, count]) => ({
    name,
    count,
  }))

  const serviceMap = {}

  rangeQuotations.forEach((quotation) => {
    const service = quotation.service || 'Other'
    serviceMap[service] =
      (serviceMap[service] || 0) + (Number(quotation.amount) || 0)
  })

  const serviceItems = Object.entries(serviceMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)

  const revenueByDay = useMemo(() => {
    if (!validRange) return []

    const days = []
    const cursor = new Date(start)
    const limit = Math.min(
      31,
      Math.max(1, Math.round((end - start) / 86400000) + 1),
    )

    for (let i = 0; i < limit; i += 1) {
      const day = new Date(cursor)
      day.setDate(cursor.getDate() + i)

      const amount = completed
        .filter((payment) => {
          const paymentDay = recordDate(payment)
          return paymentDay && paymentDay.getTime() === day.getTime()
        })
        .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)

      days.push({
        name: day.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        }),
        amount,
      })
    }

    return days
  }, [start, end, completed, validRange])

  const maxDayRevenue = Math.max(
    1,
    ...revenueByDay.map((item) => item.amount),
  )

  const orderStatuses = {}

  rangeOrders.forEach((order) => {
    const status = order.status || 'Unknown'
    orderStatuses[status] = (orderStatuses[status] || 0) + 1
  })

  const orderStatusItems = Object.entries(orderStatuses).map(
    ([name, count]) => ({ name, count }),
  )

  const recentOrders = [...orders]
    .filter((order) => {
      const query = search.toLowerCase()

      return `${order.id || ''} ${order.customer || ''} ${order.product || ''}`
        .toLowerCase()
        .includes(query)
    })
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .slice(0, 6)

  function navigate(page) {
    setActivePage(page)
    setMobileMenu(false)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100/50 via-slate-50 to-slate-100/70 text-slate-800">
      {mobileMenu && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-white/95 shadow-[8px_0_30px_-24px_rgba(15,23,42,0.25)] backdrop-blur-xl transition-transform lg:translate-x-0 ${
          mobileMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-violet-50/70 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-violet-200">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              SecureRegent
            </h1>
            <p className="text-xs text-slate-500">Business Analytics</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => navigate(name)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                  activePage === name
                    ? 'bg-gradient-to-r from-violet-100 to-indigo-50 text-violet-800 shadow-sm ring-1 ring-violet-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={19} />
                {name}

                {name === 'Leads' && (
                  <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-xs text-slate-500">
                    {leads.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-violet-50 p-4">
            <TrendingUp size={20} className="mb-2 text-violet-700" />
            <p className="text-sm font-semibold">Business insights</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Track performance and discover growth opportunities.
            </p>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/70 bg-white/85 px-4 shadow-sm shadow-slate-200/40 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-xs text-slate-400">
                Workspace / Analytics
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {activePage}
              </h2>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
            <Search size={17} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders..."
              className="w-32 bg-transparent text-sm outline-none"
            />
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-7 lg:p-8">
          {activePage === 'Leads' ? (
            <Leads />
          ) : activePage === 'Quotations' ? (
            <Quotations />
          ) : activePage === 'Deals' ? (
            <Deals />
          ) : activePage === 'Orders' ? (
            <Orders />
          ) : activePage === 'Payments' ? (
            <Payments />
          ) : activePage === 'Expenses' ? (
            <Expenses />
          ) : (
            <>
              <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
                    Business Performance
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                    Business overview
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                    Revenue, leads, sales and collection analytics.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <CalendarDays size={18} className="text-slate-400" />

                  <select
                    value={period}
                    onChange={(event) => setPeriod(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                  >
                    <option>Today</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>This year</option>
                    <option>Custom Range</option>
                  </select>

                  {period === 'Custom Range' && (
                    <>
                      <input
                        aria-label="Start date"
                        type="date"
                        value={customStart}
                        max={customEnd}
                        onChange={(event) =>
                          setCustomStart(event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                      />

                      <input
                        aria-label="End date"
                        type="date"
                        value={customEnd}
                        min={customStart}
                        max={todayString()}
                        onChange={(event) =>
                          setCustomEnd(event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                      />
                    </>
                  )}
                </div>
              </section>

              {!validRange && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Please select a valid date range.
                </div>
              )}

              <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <MetricCard key={stat.title} {...stat} />
                ))}
              </section>

              <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <Panel
                    title="Revenue Overview"
                    subtitle="Completed payments by day"
                    action={
                      <span className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700">
                        {money(revenue)}
                      </span>
                    }
                  >
                    {revenueByDay.length > 0 ? (
                      <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-violet-50/70 to-white p-4 sm:p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Daily collection</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">Revenue trend</p>
                          </div>
                          <span className="rounded-full border border-violet-100 bg-white px-3 py-1 text-xs font-semibold text-violet-700">
                            {revenueByDay.length} days
                          </span>
                        </div>

                        <div className="flex h-56 items-end gap-2 overflow-x-auto border-b border-slate-200/80 pb-3 sm:h-64 sm:gap-3">
                          {revenueByDay.map((item) => {
                            const barHeight = item.amount > 0
                              ? Math.max(5, (item.amount / maxDayRevenue) * 100)
                              : 2

                            return (
                              <div
                                key={item.name}
                                className="group flex h-full min-w-[28px] flex-1 flex-col items-center justify-end gap-2 sm:min-w-0"
                              >
                                <div className="flex h-full w-full items-end justify-center">
                                  <div
                                    title={`${item.name}: ${money(item.amount)}`}
                                    aria-label={`${item.name}: ${money(item.amount)}`}
                                    className={`w-full max-w-10 rounded-t-lg transition-all duration-300 group-hover:brightness-110 ${item.amount > 0 ? 'bg-gradient-to-t from-violet-700 to-violet-400 shadow-sm shadow-violet-200' : 'bg-slate-200'}`}
                                    style={{ height: `${barHeight}%` }}
                                  />
                                </div>
                                <span className="whitespace-nowrap text-[10px] font-medium text-slate-500 sm:text-xs">
                                  {item.name}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                          <span>Hover over a bar to see its amount</span>
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-violet-500" />
                            Revenue
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                          <TrendingUp size={22} />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-700">No revenue data yet</p>
                        <p className="mt-1 text-xs text-slate-400">Completed payments will appear here for the selected period.</p>
                      </div>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-violet-50 p-4">
                        <p className="text-xs text-slate-500">Collected</p>
                        <p className="mt-2 text-lg font-bold text-violet-700">
                          {money(revenue)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-orange-50 p-4">
                        <p className="text-xs text-slate-500">
                          Outstanding
                        </p>
                        <p className="mt-2 text-lg font-bold text-orange-700">
                          {money(outstanding)}
                        </p>
                      </div>
                    </div>
                  </Panel>
                </div>

                <Panel
                  title="Lead Funnel"
                  subtitle="Track leads through your sales journey"
                >
                  {/* Conversion Rate Card */}
                  <div className="relative mb-3 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-3">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-100/60" />

                    <div className="relative flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Overall Conversion Rate
                        </p>
                        <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-emerald-700">
                          {conversionRate}%
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Previous period: {previousConversionRate}%
                        </p>
                      </div>

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                        <TrendingUp size={28} />
                      </div>
                    </div>

                    <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.max(0, Number(conversionRate) || 0))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Funnel Heading */}
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-slate-800">
                      Lead Status Breakdown
                    </h4>
                    <span className="shrink-0 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      {leadStatuses.reduce((total, item) => total + item.count, 0)} leads
                    </span>
                  </div>

                  {/* Funnel Status Cards */}
                  <div className="space-y-2">
                    {leadStatuses.map((item, index) => {
                      const colors = [
                        { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
                        { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
                        { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
                        { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
                      ]
                      const color = colors[index % colors.length]
                      const totalLeads = Math.max(
                        1,
                        leadStatuses.reduce((total, status) => total + status.count, 0),
                      )
                      const percentage = Math.round((item.count / totalLeads) * 100)

                      return (
                        <div
                          key={item.name}
                          className={`rounded-xl border ${color.border} ${color.light} p-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className={`h-3 w-3 shrink-0 rounded-full ${color.bg}`} />
                              <span className="truncate text-sm font-semibold text-slate-700">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className={`text-xs font-semibold ${color.text}`}>
                                {percentage}%
                              </span>
                              <span className="min-w-8 rounded-lg bg-white px-2 py-1 text-center text-sm font-bold text-slate-800 shadow-sm">
                                {item.count}
                              </span>
                            </div>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-white/80">
                            <div
                              className={`h-full rounded-full ${color.bg} transition-all duration-700`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs leading-5 text-slate-500">
                      <span className="font-semibold text-slate-700">Analytics tip:</span>{' '}
                      Track lead statuses regularly to understand your sales pipeline and identify opportunities for improvement.
                    </p>
                  </div>
                </Panel>
              </section>

              <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <Panel
                  title="Lead Sources"
                  subtitle="Where your leads come from"
                  action={
                    <button
                      onClick={() => navigate('Leads')}
                      className="flex items-center gap-1 text-sm font-semibold text-violet-700"
                    >
                      View leads <ArrowUpRight size={15} />
                    </button>
                  }
                >
                  {sourceItems.length > 0 ? (
                    <div className="space-y-4">
                      {sourceItems
                        .slice()
                        .sort((a, b) => b.count - a.count)
                        .map((item, index) => {
                          const totalSourceLeads = Math.max(
                            1,
                            sourceItems.reduce((total, source) => total + source.count, 0),
                          )
                          const percentage = Math.round((item.count / totalSourceLeads) * 100)
                          const sourceColors = [
                            { bar: 'from-violet-600 to-fuchsia-500', dot: 'bg-violet-500', pill: 'bg-violet-50 text-violet-700' },
                            { bar: 'from-blue-600 to-cyan-500', dot: 'bg-blue-500', pill: 'bg-blue-50 text-blue-700' },
                            { bar: 'from-emerald-600 to-teal-500', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700' },
                            { bar: 'from-orange-500 to-amber-400', dot: 'bg-orange-500', pill: 'bg-orange-50 text-orange-700' },
                            { bar: 'from-pink-600 to-rose-400', dot: 'bg-pink-500', pill: 'bg-pink-50 text-pink-700' },
                          ]
                          const color = sourceColors[index % sourceColors.length]

                          return (
                            <div key={item.name} className="rounded-xl border border-slate-100 bg-white p-4 transition-all duration-200 hover:border-violet-100 hover:shadow-md">
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <span className={`h-3 w-3 shrink-0 rounded-full ${color.dot}`} />
                                  <span className="truncate text-sm font-semibold text-slate-700">{item.name}</span>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${color.pill}`}>{percentage}%</span>
                                  <span className="min-w-8 text-right text-sm font-bold text-slate-900">{item.count}</span>
                                </div>
                              </div>
                              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full bg-gradient-to-r ${color.bar} transition-all duration-700`} style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      <div className="flex items-center justify-between rounded-xl bg-violet-50 px-4 py-3">
                        <span className="text-sm font-medium text-slate-600">Total leads by source</span>
                        <span className="text-lg font-bold text-violet-700">{sourceItems.reduce((total, source) => total + source.count, 0)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                        <Users size={22} />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-700">No lead sources yet</p>
                      <p className="mt-1 text-xs text-slate-500">Add a source to your leads to see the breakdown here.</p>
                      <button onClick={() => navigate('Leads')} className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700">Manage leads</button>
                    </div>
                  )}
                </Panel>

                <Panel
                  title="Quotation Value by Service"
                  subtitle="Estimated quotation amount by service"
                  action={
                    <span className="text-sm font-semibold text-violet-700">
                      {money(totalQuotationValue)}
                    </span>
                  }
                >
                  <BarList
                    items={serviceItems}
                    valueKey="amount"
                    currency
                  />
                </Panel>
              </section>

              <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <Panel
                  title="Order Status"
                  subtitle="Orders created in selected period"
                >
                  <BarList items={orderStatusItems} />
                </Panel>

                <Panel
                  title="Sales & Collections"
                  subtitle="Financial summary for selected period"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        Quotation value
                      </span>
                      <strong>{money(totalQuotationValue)}</strong>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        Accepted quotations
                      </span>
                      <strong>{acceptedQuotations.length}</strong>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        Completed orders
                      </span>
                      <strong>
                        {
                          rangeOrders.filter((item) =>
                            ['delivered', 'completed'].includes(
                              String(item.status || '').toLowerCase(),
                            ),
                          ).length
                        }
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        Paid expenses
                      </span>
                      <strong>{money(totalExpenses)}</strong>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">
                        Collection rate
                      </span>
                      <strong className="text-emerald-700">
                        {collectionRate}%
                      </strong>
                    </div>
                  </div>
                </Panel>

                <Panel
                  title="Business Snapshot"
                  subtitle="Quick performance indicators"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4">
                      <Target className="text-blue-700" size={21} />
                      <div>
                        <p className="text-xs text-slate-500">
                          Qualified leads
                        </p>
                        <p className="font-bold">{qualifiedLeads.length}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
                      <CheckCircle2 className="text-emerald-700" size={21} />
                      <div>
                        <p className="text-xs text-slate-500">
                          Converted leads
                        </p>
                        <p className="font-bold">{convertedLeads.length}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-violet-50 p-4">
                      <BriefcaseBusiness
                        className="text-violet-700"
                        size={21}
                      />
                      <div>
                        <p className="text-xs text-slate-500">Active deals</p>
                        <p className="font-bold">{activeDeals.length}</p>
                      </div>
                    </div>
                  </div>
                </Panel>
              </section>

              <Panel
                title="Recent Leads"
                subtitle="Latest leads saved in your dashboard"
                action={
                  <button
                    onClick={() => navigate('Leads')}
                    className="text-sm font-semibold text-violet-700 transition hover:text-violet-900"
                  >
                    View all leads
                  </button>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Lead</th>
                        <th className="px-4 py-3">Company</th>
                        <th className="px-4 py-3">Source</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...rangeLeads].slice().reverse().slice(0, 6).map((lead, index) => {
                        const status = String(lead.status || 'New')
                        const normalizedStatus = status.toLowerCase()
                        const statusStyle = normalizedStatus.includes('convert') || normalizedStatus === 'won'
                          ? 'bg-emerald-50 text-emerald-700'
                          : normalizedStatus.includes('qualif')
                            ? 'bg-gradient-to-r from-violet-100 to-indigo-50 text-violet-800 shadow-sm ring-1 ring-violet-100'
                            : normalizedStatus.includes('unqualif') || normalizedStatus === 'lost'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'

                        return (
                          <tr key={lead.id || lead.email || index} className="transition hover:bg-violet-50/40">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800">{lead.name || lead.fullName || lead.customer || 'Unnamed lead'}</p>
                              <p className="mt-1 text-xs text-slate-400">{lead.email || lead.phone || 'No contact details'}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{lead.company || lead.organization || '—'}</td>
                            <td className="px-4 py-3 text-slate-600">{lead.source || 'Other'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}>
                                {status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                      {rangeLeads.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-10 text-center">
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                              <Users size={22} />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-slate-700">No leads found</p>
                            <p className="mt-1 text-xs text-slate-400">Add a lead to see it here.</p>
                            <button onClick={() => navigate('Leads')} className="mt-3 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-700">Add or manage leads</button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel
                title="Recent Orders"
                subtitle="Latest saved order records"
                action={
                  <button
                    onClick={() => navigate('Orders')}
                    className="text-sm font-semibold text-violet-700"
                  >
                    View all
                  </button>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Product / Service</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map((order, index) => (
                        <tr key={order.id || index}>
                          <td className="px-4 py-3 font-semibold">
                            {order.id || '—'}
                          </td>
                          <td className="px-4 py-3">
                            {order.customer || '—'}
                          </td>
                          <td className="px-4 py-3">
                            {order.product || '—'}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {money(order.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                              {order.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {recentOrders.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-4 py-8 text-center text-slate-400"
                          >
                            No orders found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

