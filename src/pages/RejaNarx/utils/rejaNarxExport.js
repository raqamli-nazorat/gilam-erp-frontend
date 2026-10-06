import XLSX from 'xlsx-js-style'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import dayjs from 'dayjs'
import { formatNumber } from '@/lib/format'
import { docStats } from '@/features/rejaNarx/rejaNarxData'

const STATUS_LABEL = { draft: 'Qoralama', confirmed: 'Tasdiqlangan', cancelled: 'Bekor qilingan' }
const HEADER = ['#', '№', 'Sana', 'Kurs, UZS', 'Sifatlar', "O'zgargan", 'Muallif', "O'rt. ustama, %", 'Holat']

function toRows(docs) {
  return docs.map((d, i) => {
    const s = docStats(d)
    return [
      i + 1,
      d.number,
      dayjs(d.createdAt).format('DD.MM.YYYY HH:mm'),
      d.rate,
      s.qualities,
      s.changed,
      d.author,
      Number(s.avgMarkup.toFixed(1)),
      STATUS_LABEL[d.status] ?? d.status,
    ]
  })
}

function fileName(ext) {
  return `Rejalashtirilgan narx ${dayjs().format('DD.MM.YYYY')}.${ext}`
}

// jsPDF standart shrifti o'zbekcha ‘ ’ belgilarini chiqarmaydi — oddiy apostrofga almashtiramiz
const pdfText = (v) => String(v ?? '').replace(/[‘’ʻʼ]/g, "'")

export function exportJournal(docs, format) {
  const rows = toRows(docs)
  if (format === 'xlsx') {
    const sheet = XLSX.utils.aoa_to_sheet([HEADER, ...rows])
    sheet['!cols'] = [4, 10, 16, 12, 10, 10, 18, 14, 14].map((wch) => ({ wch }))
    HEADER.forEach((_, c) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: 0, c })]
      if (cell) cell.s = { font: { bold: true }, fill: { fgColor: { rgb: 'EAF1FE' } } }
    })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, 'Jurnal')
    XLSX.writeFile(wb, fileName('xlsx'))
    return
  }
  if (format === 'csv') {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
    const csv = [HEADER, ...rows].map((r) => r.map(esc).join(';')).join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = fileName('csv')
    a.click()
    URL.revokeObjectURL(a.href)
    return
  }
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(14)
  doc.text('Rejalashtirilgan narx - hujjatlar jurnali', 14, 14)
  autoTable(doc, {
    startY: 20,
    head: [HEADER.map(pdfText)],
    body: rows.map((r) =>
      r.map((v, i) => (i === 3 ? formatNumber(v) : i === 7 ? `${formatNumber(v, 1)} %` : pdfText(v)))
    ),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 82, 210] },
  })
  doc.save(fileName('pdf'))
}
