import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { PLATFORM_REPORTS } from '@/features/hisobotlar/platformReportsData'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import DashboardStatCard from './components/DashboardStatCard'
import DateRangeControl from './components/DateRangeControl'
import DashboardExportButton from './components/DashboardExportButton'
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
          <DateRangeControl />
          <div className="flex items-center gap-2.5">
            <DashboardExportButton onExport={() => setToast('Backend hali ulanmagan')} />
            <Button
              onClick={() => navigate('/tashkilotlar')}
              className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Plus className="h-4 w-4" /> Qo‘shish
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            title="Tashkilotlar"
            value={orgs.length}
            suffix=" ta"
            tone="violet"
            sub={`${activeOrgs} faol, ${suspendedOrgs} to‘xtatilgan`}
            delta={2}
            to="/tashkilotlar"
          />
          <DashboardStatCard
            title="Filiallar"
            value={branches.length}
            suffix=" ta"
            tone="blue"
            sub="8 ta viloyatda"
            delta={5}
            to="/filiallar"
          />
          <DashboardStatCard
            title="Foydalanuvchilar"
            value={users.length}
            suffix=" ta"
            tone="peach"
            sub="Oxirgi 30 kunda"
            delta={18}
            to="/foydalanuvchilar"
          />
          <DashboardStatCard
            title="Umumiy savdo"
            // Figma kartochkada aynan shu (qisqartirilgan) raqam ko'rsatilgan — bir qatorga sig'ishi uchun.
            // Sahifadagi haqiqiy JAMI (grafiklar, gauge) `jamiSavdo` = 9 552 440 000 bo'lib qoladi.
            value={9552000}
            suffix=" UZS"
            digits={2}
            tone="green"
            sub="12 oy"
            delta={27.2}
            deltaSuffix=" %"
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
