import { useEffect, useMemo, useState } from 'react'
import Overview from './Overview'
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
  Menu,
  TrendingUp,
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

export default function App() {
  const [activePage, setActivePage] = useState(() => {
    try {
      const saved = localStorage.getItem('secureRegent_activePage')
      return navigation.some((item) => item.name === saved) ? saved : 'Overview'
    } catch {
      return 'Overview'
    }
  })
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('secureRegent_activePage', activePage)
    } catch (error) {
      console.error('Unable to save page:', error)
    }
  }, [activePage])

  const leadCount = useMemo(() => {
    const value = loadData('leads', [])
    return Array.isArray(value) ? value.length : 0
  }, [activePage])

  function navigate(page) {
    setActivePage(page)
    setMobileMenu(false)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/60 via-slate-50 to-slate-100 text-slate-800">
      {mobileMenu && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          mobileMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-violet-200">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">SecureRegent</h1>
            <p className="text-xs text-slate-500">Business Analytics</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Workspace</p>
          <nav className="space-y-1">
            {navigation.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => navigate(name)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  activePage === name
                    ? 'bg-gradient-to-r from-violet-100 to-indigo-50 text-violet-800 ring-1 ring-violet-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={19} />
                {name}
                {name === 'Leads' && (
                  <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{leadCount}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-violet-50 p-4">
            <TrendingUp size={20} className="mb-2 text-violet-700" />
            <p className="text-sm font-semibold">Business insights</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Track performance and discover growth opportunities.</p>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <button
            onClick={() => setMobileMenu(true)}
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div>
            <p className="text-xs text-slate-400">Workspace / Analytics</p>
            <h2 className="text-base font-bold text-slate-900">{activePage}</h2>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] p-4 sm:p-7 lg:p-8">
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
            <Overview onNavigate={navigate} />
          )}
        </div>
      </main>
    </div>
  )
}