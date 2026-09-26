import { useOrg } from './useOrg'
import TashkilotSubShell from './components/TashkilotSubShell'

// Backendda tashkilot kesimidagi savdo uchun hali endpoint yo'q — sahifa tayyor, API
// ulanganda qatorlar shu jadvalga qo'shiladi.
export default function TashkilotSavdoPage() {
  const org = useOrg()
  if (!org) return null

  return (
    <TashkilotSubShell
      org={org}
      active="savdo"
      crumbTail="Savdo"
      state="empty"
      emptyText="Bu ma’lumot hali mavjud emas"
      head={[
        { label: '#' },
        { label: 'SANA' },
        { label: 'CHEK №' },
        { label: 'FILIAL' },
        { label: 'MIJOZ' },
        { label: 'SOTUVCHI' },
        { label: 'SUMMA', align: 'right' },
        { label: 'HOLAT' },
      ]}
    />
  )
}
