import { useMemo, useState } from 'react'
import { CheckCircle2, PackageSearch, Plus, RotateCcw, Tag, Upload, X } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import RollLabel from './RollLabel'

export default function RowsStep({
  doc,
  rows,
  readOnly,
  excelInfo,
  onClearExcelInfo,
  onOpenExcelUpload,
  onRevert,
  onAddRow,
  onRowClick,
  onCreatePartiya,
  onOpenLabels,
  onConfirm,
  onCancel,
}) {
  const [selected, setSelected] = useState(() =>
    rows.filter((r) => r.partiya).slice(0, 2).map((r) => r.id)
  )

  const totalM2 = rows.reduce((sum, r) => sum + r.m2, 0)
  const totalSale = rows.reduce((sum, r) => sum + r.m2 * r.priceSale, 0)

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.includes(r.id)),
    [rows, selected]
  )
  const previewRow =
    selectedRows.find((r) => r.partiya) ?? rows.find((r) => r.partiya) ?? null
  const labelCount = selectedRows.length

  function toggleRow(id) {
    if (readOnly) return
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  return (
    <div className="flex flex-col gap-4">
      {readOnly && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#0052D2]/25 bg-[#EAF1FE] px-4 py-3 text-[13px] font-medium text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Hujjat tasdiqlangan · faqat ko'rish. Tovar ombor qoldig'iga qo'shildi.
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRevert}
            className="h-8 gap-1.5 border-[#0052D2]/30 bg-white text-[13px] font-medium text-[#0052D2] hover:bg-white/70 dark:bg-transparent"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Qaytarish
          </Button>
        </div>
      )}

      {excelInfo && (
        <div className="flex h-11 items-center justify-between gap-3 rounded-xl border border-[#0052D2]/25 bg-[#EAF1FE] px-4 text-[13px] font-medium text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-[#0052D2] dark:text-[#60A5FA]" />
            <span className="font-semibold">Exceldan yuklandi:</span>
            <span className="font-normal text-[#0A0A0A] dark:text-white">
              {excelInfo.fileName} · {excelInfo.rowCount} qator · {formatNumber(excelInfo.totalM2)} m²
            </span>
          </div>
          <button
            type="button"
            onClick={onClearExcelInfo}
            disabled={readOnly}
            className="flex cursor-pointer items-center gap-1.5 font-medium text-[#0052D2] transition-colors hover:underline disabled:cursor-default disabled:opacity-40 disabled:hover:no-underline dark:text-[#60A5FA]"
          >
            <X className="h-4 w-4" /> Tozalash
          </button>
        </div>
      )}

      {!readOnly && !excelInfo && rows.length === 0 && (
        <div className="flex h-11 items-center justify-between gap-3 rounded-xl border border-[#0052D2] bg-[#F5F5F5] px-4 text-[13px] dark:border-[#0052D2]/50 dark:bg-card">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-[#0052D2]" />
            <span>
              <span className="font-medium text-[#0052D2]">Kirim qatorlari hali yoʻq.</span>{' '}
              <span className="font-normal text-[#525252] dark:text-muted-foreground">
                Exceldan yuklang yoki qatorlarni qoʻlda qoʻshing — har bir qator alohida rulon (partiya) boʻladi.
              </span>
            </span>
          </div>
          <Button
            type="button"
            onClick={onOpenExcelUpload}
            className="h-9 gap-2 rounded-md border border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#F9FAFB] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <Upload className="h-4 w-4" /> Exceldan yuklash
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Chap ustun: Kirim qatorlari jadvali */}
        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E5] p-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold leading-[20px] text-[#0A0A0A] dark:text-white">
                Kirim qatorlari
              </h2>
              <span className="text-[13px] font-normal leading-[18px] text-[#737373] dark:text-muted-foreground">
                {rows.length} ta rulon
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={readOnly || selectedRows.length === 0}
              onClick={() => onCreatePartiya(selectedRows)}
              className="h-9 gap-2 rounded-md border border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F5F5F5] disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-white"
            >
              <Tag className="h-4 w-4" /> Partiya yaratish
            </Button>
          </div>

          {rows.length === 0 ? (
            <>
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
                  <PackageSearch className="h-6 w-6 text-[#737373]" />
                </div>
                <p className="text-[14px] font-medium text-[#0A0A0A] dark:text-white">Qator yoʻq</p>
                <p className="text-[12px] font-normal text-[#737373] dark:text-muted-foreground">
                  Excel shabloni 84 qatorgacha qoʻllab-quvvatlaydi
                </p>
                <Button
                  type="button"
                  onClick={onAddRow}
                  className="h-9 gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
                >
                  <Plus className="h-4 w-4" /> Qator qoʻshish
                </Button>
              </div>
              <div className="flex h-10 items-center bg-[#F5F5F5] px-3 text-[13px] font-semibold dark:bg-white/5">
                <span className="text-[#737373]">#</span>
                <span className="ml-4 text-[#0A0A0A] dark:text-white">JAMI</span>
                <span className="ml-auto flex gap-24 pr-8 text-[#737373]">
                  <span>—</span>
                  <span>—</span>
                </span>
              </div>
            </>
          ) : (
            <div className="max-h-[calc(100dvh-460px)] overflow-auto [&>[data-slot=table-container]]:overflow-visible">
            <Table>
              <TableHeader className="[&>tr>th]:sticky [&>tr>th]:top-0 [&>tr>th]:z-20 [&>tr>th]:bg-[#F5F5F5] dark:[&>tr>th]:bg-[#171717]">
                <TableRow className="h-10 border-b border-[#E5E5E5] hover:bg-transparent dark:border-white/10">
                  <TableHead className="w-10 px-3 text-[11px] font-semibold uppercase text-[#737373]">#</TableHead>
                  <TableHead className="w-14 px-3 text-[11px] font-semibold uppercase text-[#737373]">CHOP</TableHead>
                  <TableHead className="px-3 text-[11px] font-semibold uppercase text-[#737373]">TOVAR</TableHead>
                  <TableHead className="px-3 text-[11px] font-semibold uppercase text-[#737373]">PARTIYA</TableHead>
                  <TableHead className="px-3 text-right text-[11px] font-semibold uppercase text-[#737373]">M²</TableHead>
                  <TableHead className="px-3 text-right text-[11px] font-semibold uppercase text-[#737373]">KIRIM, USD</TableHead>
                  <TableHead className="px-3 text-right text-[11px] font-semibold uppercase text-[#737373]">USTAMA</TableHead>
                  <TableHead className="px-3 text-right text-[11px] font-semibold uppercase text-[#737373]">SOTUV, USD</TableHead>
                  <TableHead className="px-3 text-right text-[11px] font-semibold uppercase text-[#737373]">SUMMA, USD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => {
                  const isChecked = selected.includes(row.id)
                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        'h-11 border-b border-[#E5E5E5] dark:border-white/5',
                        isChecked && 'bg-[#EFF5FF] hover:bg-[#EFF5FF] dark:bg-[#0052D2]/10',
                        !readOnly && 'cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5'
                      )}
                      onClick={() => !readOnly && onRowClick(row)}
                    >
                      <TableCell className="px-3 text-[13px] text-[#737373]">{i + 1}</TableCell>
                      <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleRow(row.id)}
                          disabled={readOnly}
                        />
                      </TableCell>
                      <TableCell className="px-3">
                        <p className="text-[13px] font-medium text-[#0A0A0A] dark:text-white">
                          {row.quality} {row.design}
                        </p>
                        <p className="text-[11px] text-[#737373] dark:text-muted-foreground">
                          {row.color} · {row.material} · {row.shape}
                        </p>
                      </TableCell>
                      <TableCell className="px-3">
                        {row.partiya ? (
                          <span className="text-[13px] font-normal text-[#0052D2] dark:text-[#60A5FA]">
                            {row.partiya}
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#737373]">belgilanmagan</span>
                        )}
                      </TableCell>
                      <TableCell className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">
                        {formatNumber(row.m2)}
                      </TableCell>
                      <TableCell className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">
                        {formatNumber(row.priceIn)}
                      </TableCell>
                      <TableCell className="px-3 text-right text-[13px] font-medium text-[#047A47] dark:text-[#34D399]">
                        {formatNumber(row.markupPct, 0)} %
                      </TableCell>
                      <TableCell className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">
                        {formatNumber(row.priceSale)}
                      </TableCell>
                      <TableCell className="px-3 text-right text-[13px] font-medium text-[#0A0A0A] dark:text-white">
                        {formatNumber(row.m2 * row.priceSale)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              <TableFooter className="border-t border-[#E5E5E5] [&>tr>td]:sticky [&>tr>td]:bottom-0 [&>tr>td]:z-20 [&>tr>td]:bg-[#F5F5F5] dark:border-white/10 dark:[&>tr>td]:bg-[#171717]">
                <TableRow className="h-10 border-0 hover:bg-transparent">
                  <TableCell className="px-3 text-[13px] font-semibold text-[#737373]">#</TableCell>
                  <TableCell className="px-3 text-[13px] font-semibold text-[#0A0A0A] dark:text-white" colSpan={3}>
                    JAMI
                  </TableCell>
                  <TableCell className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">
                    {formatNumber(totalM2)}
                  </TableCell>
                  <TableCell colSpan={3} />
                  <TableCell className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">
                    {formatNumber(totalSale)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            </div>
          )}
        </div>

        {/* O'ng ustun: Rulon yorlig'i kartochkasi */}
        <div className="flex min-h-[460px] flex-col self-start rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-card">
          <h3 className="text-[15px] font-semibold leading-[20px] text-[#0A0A0A] dark:text-white">
            Rulon yorligʻi
          </h3>
          <p className="mt-0.5 text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
            Har bir rulonga yopishtiriladi
          </p>

          <div className="flex flex-1 flex-col justify-center py-6">
            {previewRow ? (
              <RollLabel row={previewRow} agentName={doc.agentName} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
                  <Tag className="h-5 w-5 text-[#A3A3A3]" />
                </div>
                <p className="text-[13px] font-normal text-[#737373]">
                  Yorliq qator tanlangach koʻrinadi
                </p>
              </div>
            )}
          </div>

          <Button
            type="button"
            disabled={labelCount === 0}
            onClick={() => onOpenLabels(selectedRows.filter((r) => r.partiya))}
            className="h-9 w-full gap-2 rounded-md bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10 dark:disabled:text-muted-foreground"
          >
            <Upload className="h-4 w-4 rotate-180" />
            {labelCount || 2} ta yorliq chop etish
          </Button>
        </div>
      </div>

      {!readOnly && rows.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-normal text-[#737373]">
            Tasdiqlangach ombor qoldigʻi va yetkazib beruvchi qarzi yangilanadi.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="h-4 w-4" /> Bekor qilish
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <CheckCircle2 className="h-4 w-4" /> Qabulni tasdiqlash
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
