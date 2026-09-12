import XLSX from 'xlsx-js-style'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatAuditDateTime, getActionInfo } from '@/features/audit/auditData'

const ACTION_COLORS = {
  CREATE: { text: '047A47', bg: 'E6FAF1', rgbText: [4, 122, 71], rgbBg: [230, 250, 241] },
  UPDATE: { text: '0052D2', bg: 'EAF1FE', rgbText: [0, 82, 210], rgbBg: [234, 241, 254] },
  DELETE: { text: 'DC2626', bg: 'FEECEC', rgbText: [220, 38, 38], rgbBg: [254, 236, 236] },
  ACCESS: { text: '7E22CE', bg: 'F3E8FF', rgbText: [126, 34, 206], rgbBg: [243, 232, 255] },
}

/**
 * Audit jurnali ma'lumotlarini Excel (.xlsx) formatida eksport qilish
 * Faqat state dagi (logs) mavjud qiymatlarni yuklaydi
 */
export function exportAuditToExcel(logs) {
  if (!logs || !logs.length) return false

  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  const formattedDate = `${day}.${month}.${year}`
  const formattedTime = `${hours}:${minutes}:${seconds}`

  const headers = [
    '#',
    'Sana',
    'Vaqt',
    'Foydalanuvchi',
    'Tashkilot',
    'Amal',
    'Jadval',
    'Yozuv ID',
    'IP manzil',
  ]

  // Qatorlar ma'lumotlarini shakllantirish
  const rows = logs.map((r, index) => {
    const dt = formatAuditDateTime(r.timestamp)
    const actionInfo = getActionInfo(r.action)
    const user = r.actor_name || r.actor || r.object_repr || '—'
    const org = r.organization_name || r.tashkilot || '—'
    const table = r.content_type_name || (r.content_type ? `ID: ${r.content_type}` : '—')
    const record = r.object_pk || r.object_id || '—'
    const ip = r.remote_addr || '—'

    return {
      index: index + 1,
      date: dt.date,
      time: dt.time,
      user,
      org,
      action: actionInfo.label,
      table,
      record: String(record),
      ip,
    }
  })

  // Worksheet ma'lumotlari massivi
  const wsData = []

  // 1-qator: Sarlavha
  wsData.push(['AUDIT JURNALI HISOBOTI'])
  // 2-qator: Ma'lumot
  wsData.push([`Eksport sanasi: ${formattedDate} ${formattedTime}  |  Jami yozuvlar soni: ${logs.length} ta`])
  // 3-qator: Bo'sh qator
  wsData.push([])
  // 4-qator: Ustun nomlari
  wsData.push(headers)

  // 5-qator va undan keyingilar: Data
  rows.forEach((r) => {
    wsData.push([
      r.index,
      r.date,
      r.time,
      r.user,
      r.org,
      r.action,
      r.table,
      r.record,
      r.ip,
    ])
  })

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Sarlavha birlashtirish (merge)
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
  ]

  // Ustun kengliklari
  ws['!cols'] = [
    { wch: 6 },  // #
    { wch: 13 }, // Sana
    { wch: 11 }, // Vaqt
    { wch: 26 }, // Foydalanuvchi
    { wch: 24 }, // Tashkilot
    { wch: 14 }, // Amal
    { wch: 20 }, // Jadval
    { wch: 38 }, // Yozuv ID
    { wch: 18 }, // IP manzil
  ]

  // Qator balandliklari
  ws['!rows'] = [
    { hpt: 28 }, // Sarlavha
    { hpt: 18 }, // Subtitle
    { hpt: 10 }, // Bo'sh
    { hpt: 24 }, // Headers
  ]

  const borderStyle = {
    top: { style: 'thin', color: { rgb: 'E2E8F0' } },
    bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
    left: { style: 'thin', color: { rgb: 'E2E8F0' } },
    right: { style: 'thin', color: { rgb: 'E2E8F0' } },
  }

  // 1-qator: Asosiy sarlavha stili
  const titleCell = ws[XLSX.utils.encode_cell({ r: 0, c: 0 })]
  if (titleCell) {
    titleCell.s = {
      font: { name: 'Segoe UI', sz: 14, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '0052D2' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    }
  }

  // 2-qator: Kichik sarlavha stili
  const subCell = ws[XLSX.utils.encode_cell({ r: 1, c: 0 })]
  if (subCell) {
    subCell.s = {
      font: { name: 'Segoe UI', sz: 10, italic: true, color: { rgb: '475569' } },
      fill: { fgColor: { rgb: 'F1F5F9' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    }
  }

  // 4-qator (index 3): Header stili
  for (let c = 0; c < headers.length; c++) {
    const cellKey = XLSX.utils.encode_cell({ r: 3, c })
    if (ws[cellKey]) {
      ws[cellKey].s = {
        font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '0052D2' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'medium', color: { rgb: '0047B8' } },
          bottom: { style: 'medium', color: { rgb: '0047B8' } },
          left: { style: 'thin', color: { rgb: '0047B8' } },
          right: { style: 'thin', color: { rgb: '0047B8' } },
        },
      }
    }
  }

  // Ma'lumot qatorlari stillari
  const startRow = 4
  rows.forEach((r, idx) => {
    const rowIdx = startRow + idx
    const isEven = idx % 2 === 1
    const bgRgb = isEven ? 'F8FAFC' : 'FFFFFF'

    for (let c = 0; c < headers.length; c++) {
      const cellKey = XLSX.utils.encode_cell({ r: rowIdx, c })
      if (!ws[cellKey]) continue

      // Standart qator stili
      let cellStyle = {
        font: { name: 'Segoe UI', sz: 9.5, color: { rgb: '0F172A' } },
        fill: { fgColor: { rgb: bgRgb } },
        border: borderStyle,
        alignment: {
          vertical: 'center',
          horizontal: c === 0 || c === 1 || c === 2 || c === 5 || c === 8 ? 'center' : 'left',
        },
      }

      // Amal ustuni (c === 5)
      if (c === 5) {
        const actionCfg = ACTION_COLORS[r.action] || { text: '0F172A', bg: bgRgb }
        cellStyle = {
          font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: actionCfg.text } },
          fill: { fgColor: { rgb: actionCfg.bg } },
          border: borderStyle,
          alignment: { horizontal: 'center', vertical: 'center' },
        }
      }

      ws[cellKey].s = cellStyle
    }
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Audit Jurnali')
  XLSX.writeFile(wb, `audit-jurnali-${formattedDate}.xlsx`)
  return true
}

/**
 * Audit jurnali ma'lumotlarini PDF (.pdf) formatida eksport qilish
 * Faqat state dagi (logs) mavjud qiymatlarni yuklaydi
 */
export function exportAuditToPdf(logs) {
  if (!logs || !logs.length) return false

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  const formattedDate = `${day}.${month}.${year}`
  const formattedTime = `${hours}:${minutes}:${seconds}`

  // Header dizayni (ko'k yuqori panel)
  doc.setFillColor(0, 82, 210)
  doc.rect(0, 0, 297, 20, 'F')

  // Oq rangdagi asosiy sarlavha
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('AUDIT JURNALI HISOBOTI', 14, 13)

  // O'ng tomondagi sana (DD.MM.YYYY HH:mm:ss formatida)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Sana: ${formattedDate} ${formattedTime}`, 283, 13, { align: 'right' })

  // Subtitle ma'lumot qatori
  doc.setTextColor(71, 85, 105)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`Jami yuklangan yozuvlar soni: ${logs.length} ta`, 14, 27)

  const headers = [
    ['#', 'Sana', 'Vaqt', 'Foydalanuvchi', 'Tashkilot', 'Amal', 'Jadval', 'Yozuv ID', 'IP manzil'],
  ]

  const body = logs.map((r, index) => {
    const dt = formatAuditDateTime(r.timestamp)
    const actionInfo = getActionInfo(r.action)
    const user = r.actor_name || r.actor || r.object_repr || '—'
    const org = r.organization_name || r.tashkilot || '—'
    const table = r.content_type_name || (r.content_type ? `ID: ${r.content_type}` : '—')
    const record = r.object_pk || r.object_id || '—'
    const ip = r.remote_addr || '—'

    return [
      index + 1,
      dt.date,
      dt.time,
      user,
      org,
      actionInfo.label,
      table,
      String(record),
      ip,
    ]
  })

  autoTable(doc, {
    startY: 31,
    head: headers,
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 82, 210],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      valign: 'middle',
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },  // #
      1: { halign: 'center', cellWidth: 18 },  // Sana
      2: { halign: 'center', cellWidth: 16 },  // Vaqt
      3: { halign: 'left', cellWidth: 42 },    // Foydalanuvchi
      4: { halign: 'left', cellWidth: 38 },    // Tashkilot
      5: { halign: 'center', cellWidth: 20 },  // Amal
      6: { halign: 'left', cellWidth: 32 },    // Jadval
      7: { halign: 'left', cellWidth: 68 },    // Yozuv ID
      8: { halign: 'center', cellWidth: 25 },  // IP manzil
    },
    didParseCell: (data) => {
      // Amal ustuniga (column index 5) badge ranglarini berish
      if (data.section === 'body' && data.column.index === 5) {
        const val = String(data.cell.raw).trim()
        const cfg = ACTION_COLORS[val]
        if (cfg) {
          data.cell.styles.textColor = cfg.rgbText
          data.cell.styles.fillColor = cfg.rgbBg
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
    didDrawPage: (data) => {
      // Sahifa raqami (Footer)
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(
        `Sahifa ${data.pageNumber} / ${pageCount}`,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 8,
        { align: 'right' }
      )
    },
  })

  doc.save(`audit-jurnali-${formattedDate}.pdf`)
  return true
}
