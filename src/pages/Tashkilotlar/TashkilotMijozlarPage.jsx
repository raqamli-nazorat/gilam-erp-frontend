import { useOrg } from './useOrg'
import TashkilotSubShell from './components/TashkilotSubShell'

// Backendda tashkilot kesimidagi mijozlar uchun hali endpoint yo'q — sahifa tayyor, API
// ulanganda qatorlar shu jadvalga qo'shiladi.
export default function TashkilotMijozlarPage() {
  const org = useOrg()
  if (!org) return null

  return (
    <TashkilotSubShell
      org={org}
      active="mijozlar"
      crumbTail="Mijozlar"
      state="empty"
      emptyText="Bu ma’lumot hali mavjud emas"
      head={[
        { label: '#' },
        { label: 'F.I.SH. / TASHKILOT' },
        { label: 'TELEFON' },
        { label: 'FILIAL' },
        { label: 'BUYURTMA', align: 'right' },
        { label: 'JAMI XARID', align: 'right' },
        { label: 'QARZ', align: 'right' },
        { label: 'OXIRGI SAVDO' },
      ]}
    />
  )
}
