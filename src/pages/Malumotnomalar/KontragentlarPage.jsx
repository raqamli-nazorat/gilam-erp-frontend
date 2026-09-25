import { counterpartyApi } from '@/services/financeReferenceService'
import { buildCounterpartyPayload, mapCounterparty } from '@/features/malumotnomalar/financeReferenceData'
import ReferenceListPage from './components/ReferenceListPage'
import KontragentModal from './components/KontragentModal'

// Figma: Nomi ≈39%, Telefon ≈17%, Turi — qolgan joy.
const COLUMNS = [
  { key: 'name', label: 'Nomi', className: 'max-w-[480px]', headClassName: 'w-[39%]' },
  { key: 'phone', label: 'Telefon', headClassName: 'w-[17%]' },
  { key: 'tur', label: 'Turi' },
]

const deleteSummary = (r) => ({ label: 'Nomi', value: r.name })

// Ma'lumotnomalar > Kontragentlar — backend "finance/counterparties/".
export default function KontragentlarPage() {
  return (
    <ReferenceListPage
      title="Kontragentlar"
      addLabel="Yangi kontragent"
      api={counterpartyApi}
      mapRow={mapCounterparty}
      buildPayload={buildCounterpartyPayload}
      columns={COLUMNS}
      FormModal={KontragentModal}
      deleteTitle="Kontragentni o‘chirish?"
      deleteSummary={deleteSummary}
    />
  )
}
