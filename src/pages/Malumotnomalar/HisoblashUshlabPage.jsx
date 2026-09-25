import { accrualRetentionApi } from '@/services/financeReferenceService'
import { buildAccrualRetentionPayload, mapAccrualRetention } from '@/features/malumotnomalar/financeReferenceData'
import ReferenceListPage from './components/ReferenceListPage'
import HisoblashUshlabModal from './components/HisoblashUshlabModal'

// Figma: Nomi ≈39%, Tur ≈17%, Qiymat — qolgan joy.
const COLUMNS = [
  { key: 'name', label: 'Nomi', className: 'max-w-[480px]', headClassName: 'w-[39%]' },
  { key: 'tur', label: 'Tur', headClassName: 'w-[17%]' },
  { key: 'qiymat', label: 'Qiymat' },
]

const deleteSummary = (r) => ({ label: r.name, value: r.tur })

// Ma'lumotnomalar > Hisoblash va ushlab qolish turlari — backend "finance/accrual-retentions/".
export default function HisoblashUshlabPage() {
  return (
    <ReferenceListPage
      title="Hisoblash va ushlab qolish"
      addLabel="Yangi tur"
      api={accrualRetentionApi}
      mapRow={mapAccrualRetention}
      buildPayload={buildAccrualRetentionPayload}
      columns={COLUMNS}
      FormModal={HisoblashUshlabModal}
      deleteTitle="Turni o‘chirish?"
      deleteSummary={deleteSummary}
    />
  )
}
