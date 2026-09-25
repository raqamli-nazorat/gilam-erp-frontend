import { formatNumber } from '@/lib/format'
import { productPartyApi } from '@/services/productPartyService'
import { buildProductPartyPayload, mapProductParty } from '@/features/partiyalar/partiyalarData'
import ReferenceListPage from './components/ReferenceListPage'
import PartiyaModal from './components/PartiyaModal'

const COLUMNS = [
  { key: 'name', label: 'Nomi', className: 'max-w-[320px]' },
  { key: 'filial', label: 'Filial', className: 'max-w-[220px]' },
  { key: 'sifat', label: 'Sifat', className: 'max-w-[180px]' },
  { key: 'rang', label: 'Rang', className: 'max-w-[180px]' },
  { key: 'birlik', label: 'Birlik' },
  { key: 'narx', label: 'Narx, m²', render: (r) => (r.narx !== '' ? formatNumber(r.narx, 0) : '') },
]

const deleteSummary = (r) => ({ label: r.name, value: r.filial })

// Ma'lumotnomalar > Partiyalar — backend "catalog/product-parties/".
export default function PartiyalarPage() {
  return (
    <ReferenceListPage
      title="Partiyalar"
      addLabel="Yangi partiya"
      api={productPartyApi}
      mapRow={mapProductParty}
      buildPayload={buildProductPartyPayload}
      columns={COLUMNS}
      FormModal={PartiyaModal}
      deleteTitle="Partiyani o‘chirish?"
      deleteSummary={deleteSummary}
    />
  )
}
