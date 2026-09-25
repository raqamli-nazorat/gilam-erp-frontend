import { warehouseApi } from '@/services/catalogReferenceService'
import { buildWarehousePayload, mapWarehouse } from '@/features/malumotnomalar/catalogReferenceData'
import ReferenceListPage from './components/ReferenceListPage'
import OmborModal from './components/OmborModal'

// Figma: Nomi ≈39%, Filial ≈17%, Manzil — qolgan joy.
const COLUMNS = [
  { key: 'name', label: 'Nomi', className: 'max-w-[480px]', headClassName: 'w-[39%]' },
  { key: 'filial', label: 'Filial', className: 'max-w-[260px]', headClassName: 'w-[17%]' },
  { key: 'manzil', label: 'Manzil', className: 'max-w-[420px]' },
]

const deleteSummary = (r) => ({ label: 'Nomi', value: r.name })

// Ma'lumotnomalar > Omborlar — backend "warehouse/warehouses/".
export default function OmborlarPage() {
  return (
    <ReferenceListPage
      title="Omborlar"
      addLabel="Yangi ombor"
      api={warehouseApi}
      mapRow={mapWarehouse}
      buildPayload={buildWarehousePayload}
      columns={COLUMNS}
      FormModal={OmborModal}
      deleteTitle="Omborni o‘chirish?"
      deleteSummary={deleteSummary}
    />
  )
}
