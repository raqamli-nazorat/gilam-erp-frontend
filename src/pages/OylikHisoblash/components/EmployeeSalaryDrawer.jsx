import { useState, useEffect, useMemo } from 'react'
import { X, Check, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function EmployeeSalaryDrawer({
  open,
  onClose,
  employee,
  onSave,
  readOnly = false,
}) {
  // O'ngdan chapga qarab tekis surilib ochilishi uchun holat (kattalashmasdan - translate-x)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  // Asosiy maosh
  const [baseSalary, setBaseSalary] = useState(4200000)

  // Qo'shimchalar ro'yxati
  const [additionsList, setAdditionsList] = useState([])
  const [isAddingAddition, setIsAddingAddition] = useState(false)
  const [newAddition, setNewAddition] = useState({
    type: 'Ovqat puli',
    kind: 'summa', // 'summa' | 'foiz'
    value: '150000',
  })

  // Ushlanmalar ro'yxati
  const [deductionsList, setDeductionsList] = useState([])
  const [isAddingDeduction, setIsAddingDeduction] = useState(false)
  const [newDeduction, setNewDeduction] = useState({
    type: 'Daromad solig‘i',
    kind: 'foiz', // 'summa' | 'foiz'
    value: '12',
  })

  // Drawer ochilishi / yopilishi animatsiyasi
  useEffect(() => {
    if (open) {
      setMounted(true)
      const timer = setTimeout(() => setVisible(true), 20)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
      const timer = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  // ESC tugmasi bosilganda yopish
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  // Xodim ma'lumotlarini yuklash
  useEffect(() => {
    if (employee) {
      const salary = Number(employee.salary || 4200000)
      setBaseSalary(salary)

      // Qo'shimchalar ro'yxati
      if (Array.isArray(employee.additionsList) && employee.additionsList.length > 0) {
        setAdditionsList(employee.additionsList)
      } else if (employee.details?.mukofot || employee.details?.bonus) {
        const list = []
        if (employee.details?.mukofot) {
          list.push({
            id: 'add-mukofot',
            name: 'Mukofot',
            info: employee.details.mukofot.info || 'Foiz, 5,00 %',
            amount: Number(employee.details.mukofot.amount || salary * 0.05),
          })
        }
        if (employee.details?.bonus) {
          list.push({
            id: 'add-bonus',
            name: 'Bonus',
            info: employee.details.bonus.info || 'Foiz, 5,00 %',
            amount: Number(employee.details.bonus.amount || salary * 0.05),
          })
        }
        setAdditionsList(list)
      } else {
        // Rasmdagi ko'rinish bilan bir xil defaultlar
        setAdditionsList([
          {
            id: 'add-1',
            name: 'Mukofot',
            info: 'Foiz, 5,00 %',
            amount: 210000,
          },
          {
            id: 'add-2',
            name: 'Bonus',
            info: 'Foiz, 5,00 %',
            amount: 210000,
          },
        ])
      }

      // Ushlanmalar ro'yxati
      if (Array.isArray(employee.deductionsList) && employee.deductionsList.length > 0) {
        setDeductionsList(employee.deductionsList)
      } else {
        // Rasmdagi ko'rinish bilan bir xil defaultlar
        setDeductionsList([
          {
            id: 'ded-1',
            name: 'Daromad solig‘i',
            info: 'Foiz, 12,00 %',
            amount: 529200,
          },
          {
            id: 'ded-2',
            name: 'Daromad solig‘i',
            info: 'Foiz, 12,00 %',
            amount: 529200,
          },
        ])
      }

      setIsAddingAddition(false)
      setIsAddingDeduction(false)
    }
  }, [employee])

  // Yangi qo'shimcha summasini hisoblash
  const additionCalculatedAmount = useMemo(() => {
    const val = Number(newAddition.value) || 0
    if (newAddition.kind === 'foiz') {
      return (baseSalary * val) / 100
    }
    return val
  }, [baseSalary, newAddition])

  // Yangi ushlanma summasini hisoblash
  const deductionCalculatedAmount = useMemo(() => {
    const val = Number(newDeduction.value) || 0
    if (newDeduction.kind === 'foiz') {
      return (baseSalary * val) / 100
    }
    return val
  }, [baseSalary, newDeduction])

  // Jami qo'shimchalar
  const totalAdditions = useMemo(() => {
    return additionsList.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [additionsList])

  // Jami ushlanmalar
  const totalDeductions = useMemo(() => {
    return deductionsList.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }, [deductionsList])

  // Jami to'lanadigan summa
  const finalTotal = useMemo(() => {
    return baseSalary + totalAdditions - totalDeductions
  }, [baseSalary, totalAdditions, totalDeductions])

  // Saqlash tugmasi bosilganda
  const handleSave = () => {
    if (onSave && employee) {
      onSave({
        ...employee,
        salary: baseSalary,
        additions: totalAdditions,
        deductions: totalDeductions,
        totalUzs: finalTotal,
        additionsList,
        deductionsList,
      })
    }
    onClose?.()
  }

  // Yangi qo'shimcha qo'shish
  const handleAddAdditionSubmit = () => {
    if (!newAddition.type) return
    const amount = additionCalculatedAmount
    const info =
      newAddition.kind === 'foiz'
        ? `Foiz, ${formatNumber(Number(newAddition.value) || 0, 2)} %`
        : 'Summa'

    const updated = [
      ...additionsList,
      {
        id: `add-${Date.now()}`,
        name: newAddition.type,
        info,
        amount,
      },
    ]
    setAdditionsList(updated)
    setIsAddingAddition(false)
    setNewAddition({ type: 'Ovqat puli', kind: 'summa', value: '150000' })

    if (onSave && employee) {
      const sumAdd = updated.reduce((s, i) => s + i.amount, 0)
      onSave({
        ...employee,
        salary: baseSalary,
        additions: sumAdd,
        deductions: totalDeductions,
        totalUzs: baseSalary + sumAdd - totalDeductions,
        additionsList: updated,
        deductionsList,
      })
    }
  }

  // Qo'shimchani o'chirish
  const handleDeleteAddition = (id) => {
    const updated = additionsList.filter((x) => x.id !== id)
    setAdditionsList(updated)
    if (onSave && employee) {
      const sumAdd = updated.reduce((s, i) => s + i.amount, 0)
      onSave({
        ...employee,
        salary: baseSalary,
        additions: sumAdd,
        deductions: totalDeductions,
        totalUzs: baseSalary + sumAdd - totalDeductions,
        additionsList: updated,
        deductionsList,
      })
    }
  }

  // Yangi ushlanma qo'shish
  const handleAddDeductionSubmit = () => {
    if (!newDeduction.type) return
    const amount = deductionCalculatedAmount
    const info =
      newDeduction.kind === 'foiz'
        ? `Foiz, ${formatNumber(Number(newDeduction.value) || 0, 2)} %`
        : 'Summa'

    const updated = [
      ...deductionsList,
      {
        id: `ded-${Date.now()}`,
        name: newDeduction.type,
        info,
        amount,
      },
    ]
    setDeductionsList(updated)
    setIsAddingDeduction(false)
    setNewDeduction({ type: 'Daromad solig‘i', kind: 'foiz', value: '12' })

    if (onSave && employee) {
      const sumDed = updated.reduce((s, i) => s + i.amount, 0)
      onSave({
        ...employee,
        salary: baseSalary,
        additions: totalAdditions,
        deductions: sumDed,
        totalUzs: baseSalary + totalAdditions - sumDed,
        additionsList,
        deductionsList: updated,
      })
    }
  }

  // Ushlanmani o'chirish
  const handleDeleteDeduction = (id) => {
    const updated = deductionsList.filter((x) => x.id !== id)
    setDeductionsList(updated)
    if (onSave && employee) {
      const sumDed = updated.reduce((s, i) => s + i.amount, 0)
      onSave({
        ...employee,
        salary: baseSalary,
        additions: totalAdditions,
        deductions: sumDed,
        totalUzs: baseSalary + totalAdditions - sumDed,
        additionsList,
        deductionsList: updated,
      })
    }
  }

  if (!mounted || !employee) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Orqa qoraytirilgan fon (Backdrop fade) */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* O'ngdan chapga suriluvchi panel (Kattalashmaydi, sof translate-x horizontal slide) */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#18181B]',
          visible ? 'translate-x-0' : 'translate-x-full'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header (shrink-0) */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#F0F0F0] px-6 dark:border-white/10">
          <h2 className="text-[18px] font-bold text-[#0A0A0A] dark:text-white">
            Xodim hisobi
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 2. Ichki skroll bo'ladigan qism (flex-1 min-h-0 overflow-y-auto) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {/* Xodim ma'lumotlari */}
          <div>
            <h3 className="text-[18px] font-bold text-[#0A0A0A] dark:text-white">
              {employee.name || 'Yusupova Malika'}
            </h3>
            <p className="mt-0.5 text-[13px] text-[#737373] dark:text-gray-400">
              Tab. raqami {employee.tabNum || '0127'}, {employee.shift || 'Asosiy smena'}
            </p>
          </div>

          {/* Oylik turi kartasi (Rasmdagidek) */}
          <div className="rounded-2xl bg-[#F5F5F7] p-4 dark:bg-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#525252] dark:text-gray-400">
                Oylik turi
              </span>
              <span className="text-[14px] font-semibold text-[#0A0A0A] dark:text-white">
                Belgilangan qiymat
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#525252] dark:text-gray-400">
                Belgilangan qiymat
              </span>
              <span className="text-[15px] font-bold text-[#0A0A0A] dark:text-white">
                {formatNumber(baseSalary, 2)}
              </span>
            </div>
          </div>

          {/* Qo'shimchalar bo'limi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white">
                Qo‘shimchalar
              </h4>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setIsAddingAddition((prev) => !prev)}
                  className="flex items-center gap-1 text-[13px] font-semibold text-[#0A0A0A] hover:text-[#0052D2] dark:text-white dark:hover:text-[#60A5FA] transition-colors"
                >
                  <Plus className="size-4" /> Qo‘shish
                </button>
              )}
            </div>

            {/* Qo'shimcha qo'shish formasi (5-rasm bilan bir xil, Custom Select) */}
            {isAddingAddition && (
              <div className="rounded-2xl bg-[#F5F5F7] p-4 dark:bg-white/5 space-y-3 border border-gray-100 dark:border-white/5 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[13px] text-[#525252] dark:text-gray-400 mb-1.5">
                    Qo‘shimcha turi
                  </label>
                  <Select
                    value={newAddition.type}
                    onValueChange={(val) =>
                      setNewAddition({ ...newAddition, type: val })
                    }
                  >
                    <SelectTrigger className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0052D2] dark:border-white/10 dark:bg-zinc-800 dark:text-white">
                      <SelectValue placeholder="Qo‘shimcha turini tanlang" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="Ovqat puli">Ovqat puli</SelectItem>
                      <SelectItem value="Mukofot">Mukofot</SelectItem>
                      <SelectItem value="Bonus">Bonus</SelectItem>
                      <SelectItem value="Ustama">Ustama</SelectItem>
                      <SelectItem value="Transport puli">Transport puli</SelectItem>
                      <SelectItem value="Boshqa">Boshqa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[13px] text-[#525252] dark:text-gray-400">Tur</span>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-200/60 p-0.5 dark:bg-zinc-800">
                    <button
                      type="button"
                      onClick={() => setNewAddition({ ...newAddition, kind: 'summa' })}
                      className={cn(
                        'px-3 py-1 rounded-md text-xs font-semibold transition-all',
                        newAddition.kind === 'summa'
                          ? 'bg-white shadow-xs text-[#0052D2] dark:bg-zinc-700 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      Summa
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAddition({ ...newAddition, kind: 'foiz' })}
                      className={cn(
                        'px-3 py-1 rounded-md text-xs font-semibold transition-all',
                        newAddition.kind === 'foiz'
                          ? 'bg-white shadow-xs text-[#0052D2] dark:bg-zinc-700 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      Foiz
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[13px] text-[#525252] dark:text-gray-400">Qiymat</span>
                  <div className="flex items-center gap-1.5 w-44">
                    <Input
                      type="number"
                      value={newAddition.value}
                      onChange={(e) =>
                        setNewAddition({ ...newAddition, value: e.target.value })
                      }
                      placeholder={newAddition.kind === 'foiz' ? '5' : '150000'}
                      className="h-9 text-right text-sm font-semibold rounded-lg bg-white dark:bg-zinc-800"
                    />
                    <span className="text-xs font-semibold text-gray-500">
                      {newAddition.kind === 'foiz' ? '%' : 'UZS'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-[13px] text-[#525252] dark:text-gray-400">
                    Hisobga qo‘shiladi
                  </span>
                  <span className="text-[15px] font-bold text-[#16A34A]">
                    +{formatNumber(additionCalculatedAmount, 2)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingAddition(false)}
                    className="h-9 px-4 rounded-xl border-gray-200 bg-white text-sm font-semibold text-[#0A0A0A] hover:bg-gray-50 dark:bg-zinc-800 dark:border-white/10 dark:text-white"
                  >
                    <X className="size-4 mr-1.5" /> Bekor qilish
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddAdditionSubmit}
                    className="h-9 px-5 rounded-xl bg-[#0052D2] hover:bg-[#0047B8] text-sm font-semibold text-white"
                  >
                    <Check className="size-4 mr-1.5" /> Qo‘shish
                  </Button>
                </div>
              </div>
            )}

            {/* Mavjud qo'shimchalar ro'yxati (4-rasm) */}
            <div className="space-y-2.5">
              {additionsList.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3.5 shadow-2xs dark:bg-white/5 dark:border-white/10"
                >
                  <div>
                    <div className="font-bold text-[14px] text-[#0A0A0A] dark:text-white">
                      {item.name}
                    </div>
                    <div className="mt-0.5 text-xs text-[#737373] dark:text-gray-400">
                      {item.info}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#16A34A]">
                      +{formatNumber(item.amount, 2)}
                    </span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAddition(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                        title="O‘chirish"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ushlanmalar bo'limi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white">
                Ushlanmalar
              </h4>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setIsAddingDeduction((prev) => !prev)}
                  className="flex items-center gap-1 text-[13px] font-semibold text-[#0A0A0A] hover:text-[#0052D2] dark:text-white dark:hover:text-[#60A5FA] transition-colors"
                >
                  <Plus className="size-4" /> Qo‘shish
                </button>
              )}
            </div>

            {/* Ushlanma qo'shish formasi (Custom Select) */}
            {isAddingDeduction && (
              <div className="rounded-2xl bg-[#F5F5F7] p-4 dark:bg-white/5 space-y-3 border border-gray-100 dark:border-white/5 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[13px] text-[#525252] dark:text-gray-400 mb-1.5">
                    Ushlanma turi
                  </label>
                  <Select
                    value={newDeduction.type}
                    onValueChange={(val) =>
                      setNewDeduction({ ...newDeduction, type: val })
                    }
                  >
                    <SelectTrigger className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0052D2] dark:border-white/10 dark:bg-zinc-800 dark:text-white">
                      <SelectValue placeholder="Ushlanma turini tanlang" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="Daromad solig‘i">Daromad solig‘i</SelectItem>
                      <SelectItem value="INPS">INPS</SelectItem>
                      <SelectItem value="Jarima">Jarima</SelectItem>
                      <SelectItem value="Avans">Avans</SelectItem>
                      <SelectItem value="Kechikish">Kechikish</SelectItem>
                      <SelectItem value="Boshqa">Boshqa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[13px] text-[#525252] dark:text-gray-400">Tur</span>
                  <div className="flex items-center gap-1 rounded-lg bg-gray-200/60 p-0.5 dark:bg-zinc-800">
                    <button
                      type="button"
                      onClick={() => setNewDeduction({ ...newDeduction, kind: 'summa' })}
                      className={cn(
                        'px-3 py-1 rounded-md text-xs font-semibold transition-all',
                        newDeduction.kind === 'summa'
                          ? 'bg-white shadow-xs text-[#0052D2] dark:bg-zinc-700 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      Summa
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDeduction({ ...newDeduction, kind: 'foiz' })}
                      className={cn(
                        'px-3 py-1 rounded-md text-xs font-semibold transition-all',
                        newDeduction.kind === 'foiz'
                          ? 'bg-white shadow-xs text-[#0052D2] dark:bg-zinc-700 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      Foiz
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[13px] text-[#525252] dark:text-gray-400">Qiymat</span>
                  <div className="flex items-center gap-1.5 w-44">
                    <Input
                      type="number"
                      value={newDeduction.value}
                      onChange={(e) =>
                        setNewDeduction({ ...newDeduction, value: e.target.value })
                      }
                      placeholder={newDeduction.kind === 'foiz' ? '12' : '100000'}
                      className="h-9 text-right text-sm font-semibold rounded-lg bg-white dark:bg-zinc-800"
                    />
                    <span className="text-xs font-semibold text-gray-500">
                      {newDeduction.kind === 'foiz' ? '%' : 'UZS'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-[13px] text-[#525252] dark:text-gray-400">
                    Hisobdan ushlab qolinadi
                  </span>
                  <span className="text-[15px] font-bold text-[#DC2626]">
                    -{formatNumber(deductionCalculatedAmount, 2)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingDeduction(false)}
                    className="h-9 px-4 rounded-xl border-gray-200 bg-white text-sm font-semibold text-[#0A0A0A] hover:bg-gray-50 dark:bg-zinc-800 dark:border-white/10 dark:text-white"
                  >
                    <X className="size-4 mr-1.5" /> Bekor qilish
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddDeductionSubmit}
                    className="h-9 px-5 rounded-xl bg-[#0052D2] hover:bg-[#0047B8] text-sm font-semibold text-white"
                  >
                    <Check className="size-4 mr-1.5" /> Qo‘shish
                  </Button>
                </div>
              </div>
            )}

            {/* Mavjud ushlanmalar ro'yxati (4-rasm) */}
            <div className="space-y-2.5">
              {deductionsList.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3.5 shadow-2xs dark:bg-white/5 dark:border-white/10"
                >
                  <div>
                    <div className="font-bold text-[14px] text-[#0A0A0A] dark:text-white">
                      {item.name}
                    </div>
                    <div className="mt-0.5 text-xs text-[#737373] dark:text-gray-400">
                      {item.info}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#DC2626]">
                      -{formatNumber(Math.abs(item.amount), 2)}
                    </span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDeduction(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                        title="O‘chirish"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jami blok (4 va 5-rasmlardagi ko'k karta) */}
          <div className="rounded-2xl bg-[#EAF2FF] p-4 flex items-center justify-between dark:bg-[#0052D2]/15">
            <div>
              <div className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
                Jami
              </div>
            </div>
            <div className="text-[20px] font-semibold text-[#0A0A0A] dark:text-white">
              {formatNumber(finalTotal, 2)} {employee.currency || 'UZS'}
            </div>
          </div>
        </div>

        {/* 3. Footer - panelning pastki qismida doimiy qotirilgan (pinned at bottom) */}
        <div className="flex h-[72px] shrink-0 items-center justify-end gap-3 border-t border-[#F0F0F0] bg-[#F9FAFB] px-6 dark:border-white/10 dark:bg-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-[10px] px-5 text-sm font-medium"
          >
            <X className="size-4 mr-1.5" /> Bekor qilish
          </Button>
          {!readOnly && (
            <Button
              type="button"
              onClick={handleSave}
              className="h-10 gap-2 rounded-[10px] bg-[#0052D2] px-6 text-sm font-medium text-white hover:bg-[#0047B8]"
            >
              <Check className="size-4" /> Saqlash
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
