import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, CheckSquare, Loader2, MinusSquare, Search, Square, X } from 'lucide-react'
import { fetchOrganizations } from '@/features/tashkilotlar/tashkilotlarSlice'
import { getAllPermissions, getRole } from '@/services/roleService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const fieldCls =
  'h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-medium leading-4 text-[#525252] dark:text-muted-foreground'

const EMPTY = { name: '', tashkilot: '', holat: 'Faol' }

const MODEL_TRANSLATIONS = {
  installmentagreement: "Bo'lib to'lash shartnomasi",
  installment_agreement: "Bo'lib to'lash shartnomasi",
  installmentschedule: "To'lov grafigi (Bo'lib to'lash)",
  installment_schedule: "To'lov grafigi (Bo'lib to'lash)",
  orderitem: 'Buyurtma mahsulotlari',
  order_item: 'Buyurtma mahsulotlari',
  order: 'Buyurtma',
  orders: 'Buyurtmalar',
  accrualretention: 'Hisoblash / ushlab qolish',
  accrual_retention: 'Hisoblash / ushlab qolish',
  branch: 'Filial',
  user: 'Foydalanuvchi',
  customuser: 'Foydalanuvchi',
  role: 'Rol',
  roles: 'Rollar',
  group: 'Guruh (Rol)',
  permission: 'Ruxsat',
  organization: 'Tashkilot',
  organizations: 'Tashkilotlar',
  employee: 'Xodim',
  employees: 'Xodimlar',
  product: 'Mahsulot',
  products: 'Mahsulotlar',
  carpet: 'Gilam',
  carpets: 'Gilamlar',
  category: 'Kategoriya',
  customer: 'Mijoz',
  customers: 'Mijozlar',
  client: 'Mijoz',
  salary: 'Ish haqi',
  workschedule: 'Ish grafigi',
  work_schedule: 'Ish grafigi',
  cashflow: 'Pul oqimi (Kassa)',
  cash_flow: 'Pul oqimi (Kassa)',
  cashbox: 'Kassa',
  transaction: 'Tranzaksiya',
  transactions: 'Tranzaksiyalar',
  payment: "To'lov",
  payments: "To'lovlar",
  expense: 'Xarajat',
  expenses: 'Xarajatlar',
  expenseitem: 'Xarajat turi',
  warehouse: 'Ombor',
  warehouses: 'Omborlar',
  stock: 'Ombor qoldig‘i',
  stockitem: 'Ombor mahsuloti',
  stock_item: 'Ombor mahsuloti',
  stocktransfer: 'Omborlararo ko‘chirish',
  stock_transfer: 'Omborlararo ko‘chirish',
  stocktransaction: 'Ombor harakati (Tranzaksiya)',
  stock_transaction: 'Ombor harakati (Tranzaksiya)',
  supplierpurchase: 'Ta’minotchidan xarid',
  supplier_purchase: 'Ta’minotchidan xarid',
  supplierpurchaseitem: 'Ta’minotchi xaridi mahsulotlari',
  supplier_purchase_item: 'Ta’minotchi xaridi mahsulotlari',
  returnitem: 'Qaytarilgan mahsulot',
  return_item: 'Qaytarilgan mahsulot',
  returnorder: 'Qaytarish buyurtmasi',
  return_order: 'Qaytarish buyurtmasi',
  debtledger: 'Qarzdorlik daftari',
  debt_ledger: 'Qarzdorlik daftari',
  productstock: 'Mahsulot qoldig‘i (Ombor)',
  product_stock: 'Mahsulot qoldig‘i (Ombor)',
  productparty: 'Mahsulot partiyasi',
  product_party: 'Mahsulot partiyasi',
  productpartyitem: 'Mahsulot partiyasi tarkibi',
  product_party_item: 'Mahsulot partiyasi tarkibi',
  booking: 'Band qilish (Bron)',
  bookingitem: 'Band qilingan mahsulot',
  booking_item: 'Band qilingan mahsulot',
  salesorder: 'Savdo buyurtmasi',
  sales_order: 'Savdo buyurtmasi',
  salesitem: 'Savdo mahsuloti',
  sales_item: 'Savdo mahsuloti',
  pricehistory: 'Narxlar tarixi',
  price_history: 'Narxlar tarixi',
  customerdebt: 'Mijoz qarzdorligi',
  customer_debt: 'Mijoz qarzdorligi',
  supplierdebt: 'Ta’minotchi qarzdorligi',
  supplier_debt: 'Ta’minotchi qarzdorligi',
  inventory: 'Inventarizatsiya',
  inventorycheck: 'Inventarizatsiya',
  inventory_check: 'Inventarizatsiya',
  paymenttype: 'To‘lov turi',
  payment_type: 'To‘lov turi',
  bankaccount: 'Bank hisob raqami',
  bank_account: 'Bank hisob raqami',
  blockrecord: 'Bloklash yozuvi',
  block_record: 'Bloklash yozuvi',
  supplier: 'Yetkazib beruvchi (Ta’minotchi)',
  notification: 'Bildirishnoma',
  notificationsetting: 'Bildirishnoma sozlamasi',
  notification_setting: 'Bildirishnoma sozlamasi',
  blockeduser: 'Bloklangan foydalanuvchi (Qora ro‘yxat)',
  blocked_user: 'Bloklangan foydalanuvchi (Qora ro‘yxat)',
  blockedface: 'Bloklangan yuz',
  blocked_face: 'Bloklangan yuz',
  chatroom: 'Chat xonasi',
  chat_room: 'Chat xonasi',
  userresponse: 'Foydalanuvchi javobi',
  user_response: 'Foydalanuvchi javobi',
  auditlog: 'Audit jurnali',
  logentry: 'Tizim jurnali (Log)',
  attachment: 'Biriktirilgan fayl',
  file: 'Fayl',
  discount: 'Chegirma',
  currency: 'Valyuta',
  exchangerate: 'Valyuta kursi',
  service: 'Xizmat',
  device: 'Qurilma',
  terminal: 'Terminal',
  report: 'Hisobot',
  setting: 'Sozlama',
  systemsetting: 'Tizim sozlamasi',
}

function getCategoryTitle(key, items) {
  const cleanKey = (key || '').toLowerCase().replace(/[^a-z0-9_]/g, '')
  if (MODEL_TRANSLATIONS[cleanKey]) {
    return MODEL_TRANSLATIONS[cleanKey]
  }

  const suffixes = [
    /\s+qo['‘`]?shish$/i,
    /\s+tahrirlash$/i,
    /\s+o['‘`]?chirish$/i,
    /\s+ko['‘`]?rish$/i,
    /\s+yaratish$/i,
    /\s+o['‘`]?zgartirish$/i,
    /\s+yopish$/i,
    /\s+ochish$/i,
    /\s+bloklash$/i,
    /\s+faollashtirish$/i,
  ]

  for (const item of (items || [])) {
    if (item?.name) {
      // Check if item name is English "Can add ..." etc.
      const engMatch = item.name.match(/^can\s+(?:add|change|delete|view)\s+(.+)$/i)
      if (engMatch) {
        const engModelKey = engMatch[1].trim().toLowerCase().replace(/[\s_-]+/g, '')
        if (MODEL_TRANSLATIONS[engModelKey]) return MODEL_TRANSLATIONS[engModelKey]
      }

      for (const regex of suffixes) {
        if (regex.test(item.name)) {
          const derived = item.name.replace(regex, '').trim()
          if (derived.length > 1) {
            const derivedClean = derived.toLowerCase().replace(/[^a-z0-9_]/g, '')
            if (MODEL_TRANSLATIONS[derivedClean]) return MODEL_TRANSLATIONS[derivedClean]
            return derived
          }
        }
      }
    }
  }

  // Format PascalCase or camelCase like "installmentAgreement" -> "Installment Agreement"
  const formatted = (key || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim()

  const formattedClean = formatted.toLowerCase().replace(/[\s_-]+/g, '')
  if (MODEL_TRANSLATIONS[formattedClean]) {
    return MODEL_TRANSLATIONS[formattedClean]
  }

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}


function getActionLabel(perm, categoryTitle) {
  if (!perm?.name) return ''
  const name = perm.name.trim()
  const code = (perm.codename || '').toLowerCase()
  const lower = name.toLowerCase()

  // English Django format
  if (/^can\s+add\b/i.test(name)) return "Qo'shish"
  if (/^can\s+change\b/i.test(name)) return "Tahrirlash"
  if (/^can\s+delete\b/i.test(name)) return "O'chirish"
  if (/^can\s+view\b/i.test(name)) return "Ko'rish"

  // Standard codename matches
  if (code.startsWith('view_') || code.endsWith('_view')) return "Ko'rish"
  if (code.startsWith('add_') || code.endsWith('_add')) return "Qo'shish"
  if (code.startsWith('change_') || code.endsWith('_change')) return 'Tahrirlash'
  if (code.startsWith('delete_') || code.endsWith('_delete')) return "O'chirish"
  if (code.startsWith('close_') || code.endsWith('_close')) return 'Yopish'
  if (code.startsWith('open_') || code.endsWith('_open')) return 'Ochish'
  if (code.includes('unblock') || lower.includes('blokdan chiqarish') || lower.includes('blokdan yechish')) return 'Blokdan chiqarish'
  if (code.includes('block') || lower.includes('bloklash')) return 'Bloklash'


  // Standard suffix matches in name
  if (lower.endsWith("ko'rish") || lower.endsWith("ko‘rish")) return "Ko'rish"
  if (lower.endsWith("qo'shish") || lower.endsWith("qo‘shish") || lower.endsWith("yaratish")) return "Qo'shish"
  if (lower.endsWith("tahrirlash") || lower.endsWith("o'zgartirish") || lower.endsWith("o‘zgartirish")) return "Tahrirlash"
  if (lower.endsWith("o'chirish") || lower.endsWith("o‘chirish")) return "O'chirish"
  if (lower.endsWith("yopish")) return "Yopish"
  if (lower.endsWith("ochish")) return "Ochish"

  // Strip category prefix and Uzbek case suffixes (e.g. "ni", "ning", "ga", "da", "dan", "ini")
  if (categoryTitle && lower.startsWith(categoryTitle.toLowerCase())) {
    let rest = name.slice(categoryTitle.length).replace(/^[\s/\\(:-]+/, '').trim()
    rest = rest.replace(/^(?:ni|ning|ga|ka|qa|da|dan|i|si|ini|dagi)\s+/i, '').trim()
    rest = rest.replace(/[)]+$/, '').trim()
    if (rest) return rest.charAt(0).toUpperCase() + rest.slice(1)
  }

  return name
}


function getPermSortOrder(perm) {
  const code = (perm.codename || '').toLowerCase()
  const name = (perm.name || '').toLowerCase()
  if (code.startsWith('view_') || code.endsWith('_view') || name.endsWith("ko'rish") || name.endsWith("ko‘rish")) return 1
  if (code.startsWith('add_') || code.endsWith('_add') || name.endsWith("qo'shish") || name.endsWith("qo‘shish") || name.endsWith("yaratish")) return 2
  if (code.startsWith('change_') || code.endsWith('_change') || name.endsWith("tahrirlash") || name.endsWith("o'zgartirish") || name.endsWith("o‘zgartirish")) return 3
  if (code.startsWith('delete_') || code.endsWith('_delete') || name.endsWith("o'chirish") || name.endsWith("o‘chirish")) return 4
  if (code.startsWith('open_') || code.endsWith('_open') || name.endsWith("ochish")) return 5
  if (code.startsWith('close_') || code.endsWith('_close') || name.endsWith("yopish")) return 6
  if (code.includes('unblock') || name.includes('blokdan chiqarish') || name.includes('blokdan yechish')) return 7
  if (code.includes('block') || name.includes('bloklash')) return 8
  return 10
}


export default function RoleModal({ open, onOpenChange, role, onSave }) {
  const isEdit = !!role
  const [draft, setDraft] = useState(EMPTY)
  const [allPermissionsRaw, setAllPermissionsRaw] = useState(null)
  const [selectedPermissions, setSelectedPermissions] = useState(() => new Set())
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [permSearch, setPermSearch] = useState('')

  const dispatch = useDispatch()
  const orgs = useSelector((s) => s.tashkilotlar.list)
  const orgsStatus = useSelector((s) => s.tashkilotlar.listStatus)

  useEffect(() => {
    if (!open) return
    if (orgsStatus === 'idle') dispatch(fetchOrganizations())

    let isMounted = true

    setLoadingPerms(true)
    getAllPermissions()
      .then((data) => {
        if (isMounted) {
          setAllPermissionsRaw(data)
        }
      })
      .catch((err) => {
        console.error('Ruxsatlarni yuklab bo‘lmadi:', err)
      })
      .finally(() => {
        if (isMounted) setLoadingPerms(false)
      })

    if (role) {
      setDraft({
        name: role.name ?? '',
        tashkilot: role.tashkilotId ?? '',
        holat: role.holat === 'blocked' ? 'Nofaol' : 'Faol',
      })
      setLoadingDetail(true)
      getRole(role.id)
        .then((detail) => {
          if (!isMounted) return
          if (detail) {
            setDraft((d) => ({
              ...d,
              name: detail.name ?? d.name,
              tashkilot: detail.organization_info?.id ?? d.tashkilot,
            }))
            const info = detail.permissions_info || detail.permissions || []
            const ids = info
              .map((p) => (typeof p === 'object' && p !== null ? p.id : p))
              .filter((id) => id != null)
            setSelectedPermissions(new Set(ids))
          }
        })
        .catch((err) => {
          console.error('Rol tafsilotlarini yuklab bo‘lmadi:', err)
        })
        .finally(() => {
          if (isMounted) setLoadingDetail(false)
        })
    } else {
      setDraft(EMPTY)
      setSelectedPermissions(new Set())
      setLoadingDetail(false)
    }

    setPermSearch('')

    return () => {
      isMounted = false
    }
  }, [open, role, dispatch, orgsStatus])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const canSave = draft.name.trim().length > 1 && !loadingDetail

  // Guruhlangan va saralangan ruxsatlar ro'yxati
  const groupedCategories = useMemo(() => {
    if (!allPermissionsRaw) return []

    let entries = []
    if (Array.isArray(allPermissionsRaw)) {
      const map = {}
      allPermissionsRaw.forEach((p) => {
        const k = p.model_name || p.content_type || 'boshqa'
        if (!map[k]) map[k] = []
        map[k].push(p)
      })
      entries = Object.entries(map)
    } else if (typeof allPermissionsRaw === 'object') {
      entries = Object.entries(allPermissionsRaw)
    }

    return entries.map(([key, items]) => {
      const list = Array.isArray(items) ? items : []
      const title = getCategoryTitle(key, list)
      const sortedItems = [...list].sort((a, b) => {
        const pA = getPermSortOrder(a)
        const pB = getPermSortOrder(b)
        if (pA !== pB) return pA - pB
        return (a.name || '').localeCompare(b.name || '')
      })
      return {
        key,
        title,
        items: sortedItems,
      }
    })
  }, [allPermissionsRaw])

  // Barcha permission obyektlari (tekis massiv)
  const allFlatPermissions = useMemo(() => {
    return groupedCategories.flatMap((g) => g.items)
  }, [groupedCategories])

  // Qidiruv bo'yicha filtrlash
  const filteredCategories = useMemo(() => {
    const q = permSearch.trim().toLowerCase()
    if (!q) return groupedCategories

    return groupedCategories
      .map((cat) => {
        const matchesCategory = cat.title.toLowerCase().includes(q)
        if (matchesCategory) return cat

        const matchingItems = cat.items.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.codename?.toLowerCase().includes(q) ||
            getActionLabel(p, cat.title).toLowerCase().includes(q)
        )

        if (matchingItems.length > 0) {
          return { ...cat, items: matchingItems }
        }
        return null
      })
      .filter(Boolean)
  }, [groupedCategories, permSearch])

  const totalCount = allFlatPermissions.length
  const selectedCount = useMemo(() => {
    let cnt = 0
    allFlatPermissions.forEach((p) => {
      if (selectedPermissions.has(p.id)) cnt += 1
    })
    return cnt
  }, [allFlatPermissions, selectedPermissions])

  function togglePermission(id) {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleGroup(items) {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      const itemIds = items.map((i) => i.id)
      const allSelected = itemIds.length > 0 && itemIds.every((id) => next.has(id))
      if (allSelected) {
        itemIds.forEach((id) => next.delete(id))
      } else {
        itemIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  function toggleAll() {
    setSelectedPermissions((prev) => {
      const allIds = allFlatPermissions.map((p) => p.id)
      const isAllSelected = allIds.length > 0 && allIds.every((id) => prev.has(id))
      if (isAllSelected) {
        return new Set()
      } else {
        return new Set(allIds)
      }
    })
  }

  function handleSave() {
    onSave({
      name: draft.name.trim(),
      tashkilot: draft.tashkilot,
      permissions: Array.from(selectedPermissions),
    })
    onOpenChange(false)
  }

  const isAllSelected = totalCount > 0 && selectedCount === totalCount
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden rounded-[12px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] ring-0 sm:max-w-[720px] dark:bg-card"
      >
        {/* Header */}
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-2 border-b border-[#E5E5E5] pl-6 pr-4 dark:border-white/10">
          <DialogTitle className="text-[18px] font-semibold leading-6 text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Rolni tahrirlash' : 'Yangi rol'}
          </DialogTitle>
          <DialogClose
            render={
              <button
                type="button"
                aria-label="Yopish"
                className="flex size-8 items-center justify-center rounded-md text-[#525252] transition-colors hover:bg-[#F5F5F5] hover:text-[#0A0A0A] dark:text-white/70 dark:hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            }
          />
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto px-6 pb-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className={labelCls}>Rol nomi</Label>
              <Input
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Masalan: Katta kassir"
                className={fieldCls}
              />
            </div>

            <div>
              <Label className={labelCls}>Tashkilot</Label>
              <Select value={draft.tashkilot || '__none'} onValueChange={(v) => set('tashkilot', v === '__none' ? '' : v)}>
                <SelectTrigger className={fieldCls}>
                  <SelectValue>
                    {(v) => {
                      if (v === '__none') return 'Barcha tashkilotlar'
                      return orgs.find((o) => o.id === v)?.name ?? ''
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Barcha tashkilotlar</SelectItem>
                  {orgsStatus === 'loading' ? (
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#737373]">
                      <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda…
                    </div>
                  ) : (
                    orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={labelCls}>Holat</Label>
              <Select value={draft.holat} onValueChange={(v) => set('holat', v)}>
                <SelectTrigger className={fieldCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faol">Faol</SelectItem>
                  <SelectItem value="Nofaol">Nofaol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ruxsatlar qismi */}
            <div className="col-span-2 mt-2 flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-[#0A0A0A] dark:text-white">Ruxsatlar</span>
                  <span className="rounded-full bg-[#EBF2FE] px-2 py-0.5 text-[12px] font-medium text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
                    {selectedCount} / {totalCount} tanlangan
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-[200px]">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#737373]" />
                    <Input
                      value={permSearch}
                      onChange={(e) => setPermSearch(e.target.value)}
                      placeholder="Qidirish..."
                      className="h-8 w-full rounded-[6px] border-[#E5E5E5] bg-white pl-8 pr-2.5 text-[12px] text-[#0A0A0A] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleAll}
                    disabled={totalCount === 0 || loadingPerms}
                    className="h-8 px-2.5 text-[12px] font-medium text-[#0052D2] hover:bg-[#EBF2FE] hover:text-[#0047B8] dark:text-[#60A5FA] dark:hover:bg-white/10"
                  >
                    {isAllSelected ? 'Barchasini bekor qilish' : 'Barchasini tanlash'}
                  </Button>
                </div>
              </div>

              {/* Ruxsatlar jadvali */}
              <div className="overflow-hidden rounded-[8px] border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
                {/* Table Header */}
                <div className="flex h-10 items-center justify-between border-b border-[#E5E5E5] bg-[#F9FAFB] px-4 text-[13px] font-semibold text-[#525252] dark:border-white/10 dark:bg-white/5 dark:text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleAll}
                      className="flex items-center text-[#525252] hover:text-[#0052D2] dark:text-muted-foreground dark:hover:text-[#60A5FA]"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="size-4 text-[#0052D2] dark:text-[#60A5FA]" />
                      ) : isPartiallySelected ? (
                        <MinusSquare className="size-4 text-[#0052D2] dark:text-[#60A5FA]" />
                      ) : (
                        <Square className="size-4" />
                      )}
                    </button>
                    <span>Modul / Bo‘lim</span>
                  </div>
                  <span className="text-[12px] font-medium text-[#737373] dark:text-muted-foreground">
                    Harakatlar va ruxsatlar
                  </span>
                </div>

                {/* Table Body */}
                <div className="max-h-[300px] overflow-y-auto divide-y divide-[#F0F0F0] dark:divide-white/5">
                  {loadingPerms || loadingDetail ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-[#737373]">
                      <Loader2 className="h-5 w-5 animate-spin text-[#0052D2]" />
                      <span className="text-[13px]">Ruxsatlar yuklanmoqda…</span>
                    </div>
                  ) : filteredCategories.length === 0 ? (
                    <div className="py-10 text-center text-[13px] text-[#737373] dark:text-muted-foreground">
                      {permSearch ? 'Qidiruv bo‘yicha ruxsatlar topilmadi' : 'Ruxsatlar mavjud emas'}
                    </div>
                  ) : (
                    filteredCategories.map((cat) => {
                      const groupIds = cat.items.map((i) => i.id)
                      const isGroupAllSelected =
                        groupIds.length > 0 && groupIds.every((id) => selectedPermissions.has(id))
                      const isGroupPartial =
                        groupIds.some((id) => selectedPermissions.has(id)) && !isGroupAllSelected

                      return (
                        <div
                          key={cat.key}
                          className="flex flex-col gap-2 p-3 transition-colors hover:bg-[#FAFAFA] sm:flex-row sm:items-center sm:justify-between dark:hover:bg-white/[0.02]"
                        >
                          {/* Modul nomi va qatordagi barchasini tanlash */}
                          <div
                            onClick={() => toggleGroup(cat.items)}
                            className="flex cursor-pointer select-none items-center gap-2 sm:w-[220px] sm:shrink-0"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleGroup(cat.items)
                              }}
                              className="flex size-5 items-center justify-center rounded text-[#737373] hover:text-[#0052D2] dark:text-muted-foreground dark:hover:text-[#60A5FA]"
                            >
                              {isGroupAllSelected ? (
                                <CheckSquare className="size-4 text-[#0052D2] dark:text-[#60A5FA]" />
                              ) : isGroupPartial ? (
                                <MinusSquare className="size-4 text-[#0052D2] dark:text-[#60A5FA]" />
                              ) : (
                                <Square className="size-4" />
                              )}
                            </button>
                            <span className="text-[13px] font-medium text-[#0A0A0A] hover:text-[#0052D2] dark:text-white dark:hover:text-[#60A5FA]">
                              {cat.title}
                            </span>
                          </div>

                          {/* Har bir ruxsat uchun checkboxlar */}
                          <div className="flex flex-1 flex-wrap items-center justify-start gap-x-4 gap-y-2 pl-7 sm:justify-end sm:pl-0">
                            {cat.items.map((perm) => {
                              const isChecked = selectedPermissions.has(perm.id)
                              const label = getActionLabel(perm, cat.title)

                              return (
                                <label
                                  key={perm.id}
                                  title={perm.name}
                                  className="group flex cursor-pointer select-none items-center gap-1.5 rounded px-1.5 py-1 transition-colors hover:bg-[#F5F5F5] dark:hover:bg-white/10"
                                >
                                  <div
                                    onClick={(e) => {
                                      e.preventDefault()
                                      togglePermission(perm.id)
                                    }}
                                    className={`flex size-4 items-center justify-center rounded-[4px] border transition-colors ${
                                      isChecked
                                        ? 'border-[#0052D2] bg-[#0052D2] text-white'
                                        : 'border-[#D4D4D4] bg-white group-hover:border-[#A3A3A3] dark:border-white/20 dark:bg-card'
                                    }`}
                                  >
                                    {isChecked && <Check className="size-3 stroke-[3]" />}
                                  </div>
                                  <span
                                    className={`text-[12.5px] transition-colors ${
                                      isChecked
                                        ? 'font-medium text-[#0A0A0A] dark:text-white'
                                        : 'text-[#525252] dark:text-muted-foreground'
                                    }`}
                                  >
                                    {label}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex h-[72px] shrink-0 items-center justify-end gap-2 border-t border-[#E5E5E5] bg-[#F5F5F5] px-6 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 gap-2 rounded-[8px] border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="size-4" /> Bekor qilish
            </Button>
            <Button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className="h-9 gap-2 rounded-[8px] bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
            >
              {loadingDetail ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Saqlash
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
