import { currencyApi } from '@/services/financeReferenceService'
import { buildCurrencyPayload, mapCurrency } from '@/features/malumotnomalar/financeReferenceData'
import ReferenceListPage from './components/ReferenceListPage'
import ValyutaModal from './components/ValyutaModal'

// Figma: Nomi ≈39%, Qisqa nomi — qolgan joy (oxirgi ustunga kenglik berilmaydi, aks holda
// brauzer ortiqcha joyni barcha ustunlarga taqsimlab, joylashuv Figma'dan siljiydi).
const COLUMNS = [
  { key: 'name', label: 'Nomi', className: 'max-w-[480px]', headClassName: 'w-[39%]' },
  { key: 'shortName', label: 'Qisqa nomi' },
]

const deleteSummary = (r) => ({ label: 'Nomi', value: r.name })

// Ma'lumotnomalar > Valyutalar — backend "finance/currencies/".
export default function ValyutalarPage() {
  return (
    <ReferenceListPage
      title="Valyutalar"
      addLabel="Yangi valyuta"
      api={currencyApi}
      mapRow={mapCurrency}
      buildPayload={buildCurrencyPayload}
      columns={COLUMNS}
      FormModal={ValyutaModal}
      deleteTitle="Valyutani o‘chirish?"
      deleteSummary={deleteSummary}
    />
  )
}
