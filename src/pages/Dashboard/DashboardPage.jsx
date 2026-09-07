import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { AS_OF } from '@/features/dashboard/dashboardData'
import { PLATFORM_REPORTS } from '@/features/hisobotlar/platformReportsData'
import { Button } from '@/components/ui/button'
import { Download01Icon } from '@/components/ui/icons'
import Toast from '@/components/Toast'
import DashboardStatCard from './components/DashboardStatCard'
import SavdoDinamikasiChart from './components/SavdoDinamikasiChart'
import SavdoKesimiDonut from './components/SavdoKesimiDonut'
import TopTashkilotlarCard from './components/TopTashkilotlarCard'
import PulQandayKeladiCard from './components/PulQandayKeladiCard'

export default function DashboardPage() {
  const navigate = useNavigate()
  const orgs = useSelector((s) => s.tashkilotlar.list)
  const branches = useSelector((s) => s.filiallar.list)
  const users = useSelector((s) => s.foydalanuvchilar.list)
  const [toast, setToast] = useState('')

  usePageHeader('Platforma › Boshqaruv paneli')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const activeOrgs = orgs.filter((o) => o.status === 'active').length
  const suspendedOrgs = orgs.length - activeOrgs
  const jamiSavdo = PLATFORM_REPORTS['savdo-boyicha'].stats.aylanma

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-[#737373] dark:text-muted-foreground">
            Barcha tashkilotlar bo‘yicha, {AS_OF} holatiga
          </p>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => setToast('Backend hali ulanmagan')}
              className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <Download01Icon className="h-4 w-4" /> Yuklash
            </Button>
            <Button
              onClick={() => navigate('/tashkilotlar')}
              className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Plus className="h-4 w-4" /> Yangi tashkilot
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            title="Tashkilotlar"
            value={orgs.length}
            suffix=" ta"
            chart="bars"
            sub={`${activeOrgs} faol, ${suspendedOrgs} to‘xtatilgan`}
            delta={2}
            to="/tashkilotlar"
          />
          <DashboardStatCard
            title="Filiallar"
            value={branches.length}
            suffix=" ta"
            chart="step"
            sub="8 ta hududda"
            delta={5}
            to="/filiallar"
          />
          <DashboardStatCard
            title="Foydalanuvchilar"
            value={users.length}
            suffix=" ta"
            chart="line"
            sub="Oxirgi 30 kunda"
            delta={18}
            to="/foydalanuvchilar"
          />
          <DashboardStatCard
            title="Umumiy savdo"
            value={jamiSavdo}
            suffix=" UZS"
            digits={2}
            chart="dots"
            sub="12 oy"
            delta={27.2}
            deltaSuffix="%"
            to="/hisobotlar/savdo-boyicha"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[744fr_396fr]">
          <SavdoDinamikasiChart />
          <SavdoKesimiDonut jamiUzs={jamiSavdo} />
        </div>

        <div className="grid gap-3 lg:grid-cols-[744fr_396fr]">
          <TopTashkilotlarCard totalCount={orgs.length} />
          <PulQandayKeladiCard jamiUzs={jamiSavdo} />
        </div>
      </div>
      <Toast message={toast} />
    </>
  )
}
