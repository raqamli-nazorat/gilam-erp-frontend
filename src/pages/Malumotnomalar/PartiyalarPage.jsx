import { formatNumber } from '@/lib/format'
import { productPartyApi } from '@/services/productPartyService'
import { buildProductPartyPayload, mapProductParty } from '@/features/partiyalar/partiyalarData'
import { designOptions, qualityOptions } from '@/services/optionSources'
import ReferenceListPage from './components/ReferenceListPage'
import PartiyaModal from './components/PartiyaModal'

const COLUMNS = [
  { key: 'name', label: 'Nomi', className: 'max-w-[320px]' },
  { key: 'filial', label: 'Filial', className: 'max-w-[220px]' },
  { key: 'sifat', label: 'Sifat', className: 'max-w-[180px]' },
  { key: 'dizayn', label: 'Dizayn', className: 'max-w-[180px]' },
  { key: 'rang', label: 'Rang', className: 'max-w-[180px]' },
  { key: 'birlik', label: 'Birlik' },
  { key: 'narx', label: 'Narx, m²', render: (r) => (r.narx !== '' ? formatNumber(r.narx, 0) : '') },
]

// Backend filtrlari: catalog/product-parties/?quality=<id>&design=<id>.
// Dizayn ro'yxati tanlangan sifat bo'yicha toraytiriladi (catalog/designs/?quality=).
const EXTRA_FILTERS = [
  { key: 'quality', label: 'Sifat', fetchPage: qualityOptions },
  { key: 'design', label: 'Dizayn', fetchPage: designOptions, dependsOn: 'quality' },
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
      extraFilters={EXTRA_FILTERS}
    />
  )
}
