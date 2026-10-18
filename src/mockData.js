// Shared dummy data for the whole dashboard.
// Relationships: Lead -> Quotations -> Deals -> Orders -> Payments
// Dates are generated relative to today so "Today / Last 7 / Last 30 days" filters always have data.

function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(2026)
const between = (min, max) => min + Math.floor(rand() * (max - min + 1))
const pick = (items) => items[Math.floor(rand() * items.length)]

function weighted(pairs) {
  const total = pairs.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = rand() * total
  for (const [value, weight] of pairs) {
    roll -= weight
    if (roll <= 0) return value
  }
  return pairs[0][0]
}

function dateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const todayStr = dateString(new Date())

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return dateString(d)
}

// Move a date forward by n days, but never past today.
function shift(str, n) {
  const [y, m, d] = str.split('-').map(Number)
  const next = dateString(new Date(y, m - 1, d + n))
  return next > todayStr ? todayStr : next
}

const SERVICES = [
  { name: 'Private Limited Company', category: 'Company Registration', price: 12000 },
  { name: 'LLP Registration', category: 'Company Registration', price: 8500 },
  { name: 'Trademark', category: 'Intellectual Property', price: 5500 },
  { name: 'Startup India Registration', category: 'Registration', price: 4500 },
  { name: 'ISO Certification', category: 'Certification', price: 7500 },
  { name: 'GST Registration', category: 'Tax', price: 3000 },
  { name: 'FSSAI License', category: 'License', price: 4000 },
  { name: 'Annual Compliance', category: 'Compliance', price: 9000 },
]

const FIRST = ['Aarav', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Meera', 'Rohan', 'Kavya', 'Neha', 'Arjun', 'Sneha', 'Karan', 'Pooja', 'Amit', 'Isha', 'Dev']
const LAST = ['Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Gupta', 'Das', 'Mishra', 'Jain', 'Reddy', 'Nair', 'Khan']
const OWNERS = ['Nancy Singh', 'Sneha Choudhary', 'Tannu Kumari']
const METHODS = ['UPI', 'Bank Transfer', 'Credit Card', 'Cash']

function build() {
  const leads = []
  const quotations = []
  const deals = []
  const orders = []
  const payments = []
  const expenses = []

  let leadNo = 1000
  let quoteNo = 1000
  let dealNo = 1000
  let orderNo = 1000
  let payNo = 1000

  for (let age = 59; age >= 0; age -= 1) {
    const date = daysAgo(age)
    const count = between(0, 2) + (age < 30 ? 1 : 0) + (age < 10 ? 1 : 0)

    for (let i = 0; i < count; i += 1) {
      leadNo += 1
      const first = pick(FIRST)
      const last = pick(LAST)
      const name = `${first} ${last}`
      const status = weighted([
        ['New', 25],
        ['Qualified', 22],
        ['Converted', 18],
        ['Unqualified', 35],
      ])

      const lead = {
        id: `LD-${leadNo}`,
        name,
        email: `${first}.${last}${leadNo}@example.com`.toLowerCase(),
        company: `${last} ${pick(['Traders', 'Enterprises', 'Solutions', 'Industries', 'Foods'])}`,
        source: weighted([
          ['Google Ads', 65],
          ['Website', 24],
          ['Just Dial', 6],
          ['Other', 5],
        ]),
        status,
        value: between(10, 90) * 1000,
        date,
        owner: pick(OWNERS),
      }
      leads.push(lead)

      if (status !== 'Qualified' && status !== 'Converted') continue

      const quoteCount = between(1, 2)

      for (let q = 0; q < quoteCount; q += 1) {
        quoteNo += 1
        const service = pick(SERVICES)
        const amount = Math.round((service.price * (0.8 + rand() * 0.6)) / 100) * 100
        const quoteStatus =
          status === 'Converted' && q === 0
            ? 'Accepted'
            : weighted([
                ['Pending', 40],
                ['Sent', 25],
                ['Rejected', 20],
                ['Accepted', 15],
              ])

        const quotation = {
          id: `QT-${quoteNo}`,
          customer: name,
          leadId: lead.id,
          service: service.name,
          category: service.category,
          date: shift(date, between(0, 3)),
          amount,
          status: quoteStatus,
          dealId: '',
        }
        quotations.push(quotation)

        if (quoteStatus !== 'Accepted') continue

        dealNo += 1
        const stage = weighted([
          ['Won', 60],
          ['Negotiation', 15],
          ['Proposal', 15],
          ['Lost', 10],
        ])
        const deal = {
          id: `DEAL-${dealNo}`,
          name: service.name,
          customer: name,
          leadId: lead.id,
          quotationId: quotation.id,
          service: service.name,
          category: service.category,
          value: amount,
          stage,
          priority: weighted([
            ['High', 40],
            ['Medium', 45],
            ['Low', 15],
          ]),
          progress: stage === 'Won' ? 100 : stage === 'Lost' ? 0 : between(20, 80),
          date: shift(quotation.date, between(0, 3)),
        }
        deals.push(deal)
        quotation.dealId = deal.id

        if (stage !== 'Won') continue

        orderNo += 1
        const orderStatus = weighted([
          ['Delivered', 35],
          ['Processing', 30],
          ['Shipped', 15],
          ['Pending', 15],
          ['Cancelled', 5],
        ])
        const order = {
          id: `ORD-${orderNo}`,
          customer: name,
          leadId: lead.id,
          dealId: deal.id,
          product: service.name,
          service: service.name,
          category: service.category,
          date: shift(deal.date, between(0, 2)),
          amount,
          status: orderStatus,
          progress: orderStatus === 'Delivered' ? 100 : orderStatus === 'Pending' ? 0 : between(25, 85),
          payment: 'Unpaid',
        }
        orders.push(order)

        const installments = between(1, 3)
        let allPaid = true
        for (let p = 0; p < installments; p += 1) {
          payNo += 1
          const payStatus = p === 0 ? 'Completed' : weighted([['Completed', 60], ['Pending', 30], ['Failed', 10]])
          if (payStatus !== 'Completed') allPaid = false
          payments.push({
            id: `PAY-${payNo}`,
            orderId: order.id,
            dealId: deal.id,
            leadId: lead.id,
            customer: name,
            invoice: `INV-${payNo}`,
            date: shift(order.date, between(0, 5)),
            amount: Math.round(amount / installments),
            method: pick(METHODS),
            status: payStatus,
          })
        }
        order.payment = allPaid ? 'Paid' : 'Unpaid'
      }
    }
  }

  const expenseItems = [
    ['Office Rent', 'Office', 25000],
    ['Google Ads Budget', 'Marketing', 18000],
    ['Internet Bill', 'Utilities', 1500],
    ['Software Subscription', 'Software', 3500],
    ['Travel Expenses', 'Travel', 4500],
    ['Staff Salary', 'Salary', 40000],
  ]
  expenseItems.forEach(([title, category, amount], index) => {
    expenses.push({
      id: index + 1,
      title,
      category,
      amount,
      date: daysAgo(between(0, 45)),
      status: index % 3 === 1 ? 'Pending' : 'Paid',
      paymentMethod: pick(['Bank Transfer', 'UPI', 'Card']),
    })
  })

  return { leads, quotations, deals, orders, payments, expenses }
}

let cache = null

export function seedFor(key) {
  if (!cache) cache = build()
  return cache[key]
}