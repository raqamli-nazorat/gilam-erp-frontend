import React from 'react'
import { ChevronDown, FileSpreadsheet, FileText, FileCode } from 'lucide-react'
import { Download01Icon } from '@/components/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

/**
 * ExportDropdown - Split yuklab olish tugmasi va formati dropdowni.
 *
 * @param {Object} props
 * @param {Function} [props.onExportExcel] - Excel (.xlsx) yuklash funksiyasi
 * @param {Function} [props.onExportPdf] - PDF (.pdf) yuklash funksiyasi
 * @param {Function} [props.onExportCsv] - CSV (.csv) yuklash funksiyasi
 * @param {Function} [props.onExport] - Asosiy "Yuklash" tugmasi bosilgandagi funksiya (agar berilmasa, birinchi mavjud funksiya chaqiriladi)
 * @param {string} [props.label='Yuklash'] - Asosiy tugma matni
 * @param {Array} [props.options] - Maxsus optionlar ro'yxati (agar standart 3 tadan tashqari kerak bo'lsa)
 * @param {string} [props.className] - Qo'shimcha CSS klasslari
 * @param {boolean} [props.disabled=false] - Tugmani nofaol qilish
 */
export default function ExportDropdown({
  onExportExcel,
  onExportPdf,
  onExportCsv,
  onExport,
  label = 'Yuklash',
  options,
  className,
  disabled = false,
}) {
  // Parent bergan funksiyalarga qarab dinamik ro'yxat tuzamiz
  const items = React.useMemo(() => {
    if (options && Array.isArray(options)) {
      return options
    }

    const list = []
    if (typeof onExportExcel === 'function') {
      list.push({
        id: 'excel',
        label: 'Excel (.xlsx)',
        icon: FileSpreadsheet,
        onClick: onExportExcel,
      })
    }
    if (typeof onExportPdf === 'function') {
      list.push({
        id: 'pdf',
        label: 'PDF hujjat (.pdf)',
        icon: FileText,
        onClick: onExportPdf,
      })
    }
    if (typeof onExportCsv === 'function') {
      list.push({
        id: 'csv',
        label: 'CSV fayl (.csv)',
        icon: FileCode,
        onClick: onExportCsv,
      })
    }
    return list
  }, [options, onExportExcel, onExportPdf, onExportCsv])

  const handleMainClick = (e) => {
    if (disabled) return
    if (typeof onExport === 'function') {
      onExport(e)
    } else if (items.length > 0 && typeof items[0].onClick === 'function') {
      items[0].onClick(e)
    }
  }

  const hasItems = items.length > 0

  return (
    <DropdownMenu>
      <div
        className={cn(
          'inline-flex h-9 items-stretch rounded-xl border border-[#E5E5E5] bg-white shadow-xs dark:border-white/10 dark:bg-card',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
      >
        {/* Asosiy "Yuklash" tugmasi */}
        <button
          type="button"
          onClick={handleMainClick}
          disabled={disabled}
          className="flex items-center gap-2 rounded-l-xl px-3.5 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5] focus-visible:outline-none dark:text-white dark:hover:bg-white/5 cursor-pointer"
        >
          <Download01Icon className="h-4 w-4 text-[#0A0A0A] dark:text-white" />
          <span>{label}</span>
        </button>

        {/* Vertikal ajratuvchi chiziq */}
        <div className="w-[1px] self-stretch bg-[#E5E5E5] dark:bg-white/10" />

        {/* ChevronDown - Dropdown ochuvchi tugma */}
        <DropdownMenuTrigger
          disabled={disabled || !hasItems}
          render={
            <button
              type="button"
              disabled={disabled || !hasItems}
              aria-label="Yuklab olish turlari"
              className="flex items-center justify-center rounded-r-xl px-2.5 text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5] focus-visible:outline-none dark:text-white dark:hover:bg-white/5 cursor-pointer"
            >
              <ChevronDown className="h-4 w-4 text-[#0A0A0A] dark:text-white" />
            </button>
          }
        />
      </div>

      {/* Dropdown menyu */}
      {hasItems && (
        <DropdownMenuContent
          align="end"
          className="w-[200px] space-y-0.5 rounded-xl border border-[#E5E5E5] bg-white p-1.5 shadow-[0px_8px_24px_rgba(1,9,28,0.12)] dark:border-white/10 dark:bg-card"
        >
          {items.map((item) => {
            const Icon = item.icon || Download01Icon
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={item.onClick}
                className="h-9 cursor-pointer gap-2.5 rounded-lg px-3 text-[14px] font-normal leading-[20px] text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5] focus:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/5 dark:focus:bg-white/5"
              >
                <Icon className="h-4 w-4 text-[#525252] dark:text-white/70" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}

export { ExportDropdown }
