import { designApi } from '@/services/catalogReferenceService'
import { buildDesignPayload, mapDesign } from '@/features/malumotnomalar/catalogReferenceData'
import ReferenceListPage from './components/ReferenceListPage'
import DizaynModal from './components/DizaynModal'

// Figma: Nomi ≈39%, Sifat — qolgan joy.
const COLUMNS = [
  { key: 'name', label: 'Nomi', className: 'max-w-[480px]', headClassName: 'w-[39%]' },
  { key: 'sifat', label: 'Sifat' },
]

const deleteSummary = (r) => ({ label: 'Nomi', value: r.name })

// Ma'lumotnomalar > Dizaynlar — backend "catalog/designs/".
export default function DizaynlarPage() {
  return (
    <ReferenceListPage
      title="Dizaynlar"
      addLabel="Yangi dizayn"
      api={designApi}
      mapRow={mapDesign}
      buildPayload={buildDesignPayload}
      columns={COLUMNS}
      FormModal={DizaynModal}
      deleteTitle="Dizaynni o‘chirish?"
      deleteSummary={deleteSummary}
    />
  )
}
