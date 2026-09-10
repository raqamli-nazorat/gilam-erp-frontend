import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [header, setHeader] = useState({ title: '', badge: null })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={header.title} badge={header.badge} />
        <main className="flex-1 overflow-y-auto px-3 py-2">
          <Outlet context={{ setHeader }} />
        </main>
      </div>
    </div>
  )
}
