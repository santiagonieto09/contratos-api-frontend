import ExcelJS from 'exceljs'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { Cuota } from '@/types'

export interface DownloadPayload {
  title: string
  filename: string
  infoRows: { label: string; value: string }[]
  summaryRows: { label: string; value: string; color?: string }[]
  cuotas: Cuota[]
}

const PRIMARY = '1A56DB'
const PRIMARY_LIGHT = 'E1EFFE'
const INTEREST = 'D92D20'
const FEE = 'B42318'
const TOTAL = '039855'
const BG_ALT = 'F9FAFB'
const BORDER = 'D1D5DB'
const WHITE = 'FFFFFF'
const DARK = '111827'

function excelCell(cell: ExcelJS.Cell, value: string | number, opts?: {
  bold?: boolean
  color?: string
  bg?: string
  align?: 'left' | 'center' | 'right'
  format?: string
  size?: number
}) {
  cell.value = value
  cell.font = {
    name: 'Calibri',
    size: opts?.size ?? 10,
    bold: opts?.bold ?? false,
    color: opts?.color ? { argb: opts.color } : { argb: DARK },
  }
  if (opts?.bg) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: opts.bg },
    }
  }
  cell.alignment = {
    horizontal: opts?.align ?? 'left',
    vertical: 'middle',
  }
  cell.border = {
    top: { style: 'thin', color: { argb: BORDER } },
    left: { style: 'thin', color: { argb: BORDER } },
    bottom: { style: 'thin', color: { argb: BORDER } },
    right: { style: 'thin', color: { argb: BORDER } },
  }
  if (opts?.format) cell.numFmt = opts.format
}

async function buildExcel(payload: DownloadPayload): Promise<Blob> {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Datos')

  ws.columns = [
    { width: 4 },
    { width: 28 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 4 },
  ]

  excelCell(ws.getCell('B1'), payload.title, { bold: true, size: 14, color: PRIMARY })
  ws.mergeCells('B1:F1')
  ws.getCell('B1').alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(1).height = 32

  const rowInfoStart = 3
  payload.infoRows.forEach((r, i) => {
    const rowNum = rowInfoStart + i
    excelCell(ws.getCell(`B${rowNum}`), r.label, { bold: true, bg: BG_ALT })
    excelCell(ws.getCell(`C${rowNum}`), r.value, { color: DARK })
    ws.mergeCells(`C${rowNum}:F${rowNum}`)
  })

  const summaryStart = rowInfoStart + payload.infoRows.length + 1
  const summaryEnd = summaryStart + payload.summaryRows.length - 1

  excelCell(ws.getCell(`B${summaryStart - 1}`), 'RESUMEN', { bold: true, size: 11, color: PRIMARY })
  ws.mergeCells(`B${summaryStart - 1}:F${summaryStart - 1}`)

  payload.summaryRows.forEach((r, i) => {
    const rowNum = summaryStart + i
    excelCell(ws.getCell(`B${rowNum}`), r.label, { bold: true, bg: BG_ALT })
    excelCell(ws.getCell(`C${rowNum}`), r.value, {
      bold: true,
      color: r.color ?? DARK,
      format: '$#,##0.00',
    })
    ws.mergeCells(`C${rowNum}:F${rowNum}`)
  })

  const tableHeaderRow = summaryEnd + 2
  const headerLabels = ['#', 'Valor Base', 'Interés', 'Tarifa', 'Total', 'Fecha Pago']

  excelCell(ws.getCell(`B${tableHeaderRow}`), headerLabels[0]!, { bold: true, bg: PRIMARY, color: WHITE, align: 'center' })
  excelCell(ws.getCell(`C${tableHeaderRow}`), headerLabels[1]!, { bold: true, bg: PRIMARY, color: WHITE, align: 'center' })
  excelCell(ws.getCell(`D${tableHeaderRow}`), headerLabels[2]!, { bold: true, bg: PRIMARY, color: WHITE, align: 'center' })
  excelCell(ws.getCell(`E${tableHeaderRow}`), headerLabels[3]!, { bold: true, bg: PRIMARY, color: WHITE, align: 'center' })
  excelCell(ws.getCell(`F${tableHeaderRow}`), headerLabels[4]!, { bold: true, bg: PRIMARY, color: WHITE, align: 'center' })
  excelCell(ws.getCell(`G${tableHeaderRow}`), headerLabels[5]!, { bold: true, bg: PRIMARY, color: WHITE, align: 'center' })

  payload.cuotas.forEach((c, i) => {
    const rowNum = tableHeaderRow + 1 + i
    const bg = i % 2 === 0 ? BG_ALT : WHITE
    excelCell(ws.getCell(`B${rowNum}`), c.numeroCuota, { align: 'center', bg })
    excelCell(ws.getCell(`C${rowNum}`), c.valorBase, { format: '$#,##0.00', bg })
    excelCell(ws.getCell(`D${rowNum}`), c.interes, { format: '$#,##0.00', color: INTEREST, bg })
    excelCell(ws.getCell(`E${rowNum}`), c.tarifaPago, { format: '$#,##0.00', color: FEE, bg })
    excelCell(ws.getCell(`F${rowNum}`), c.total, { format: '$#,##0.00', color: TOTAL, bold: true, bg })
    excelCell(ws.getCell(`G${rowNum}`), c.fechaPago, { bg })
  })

  const buf = await wb.xlsx.writeBuffer()
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

function buildPDF(payload: DownloadPayload): Blob {
  const doc = new jsPDF('landscape', 'mm', 'a4')
  const pageW = doc.internal.pageSize.getWidth()

  doc.setFontSize(16)
  doc.setTextColor(26, 86, 219)
  doc.text(payload.title, pageW / 2, 18, { align: 'center' })

  let y = 28

  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text('Información general', 14, y)
  y += 5

  payload.infoRows.forEach((r) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(17, 24, 39)
    doc.text(`${r.label}:`, 14, y)
    doc.setFont('helvetica', 'normal')
    doc.text(r.value, 50, y)
    y += 5
  })

  y += 3
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(26, 86, 219)
  doc.text('Resumen', 14, y)
  y += 6

  payload.summaryRows.forEach((r) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    if (r.color) {
      const rgb = hexToRgb(r.color)
      doc.setTextColor(rgb[0]!, rgb[1]!, rgb[2]!)
    }
    doc.text(`${r.label}: `, 14, y)
    doc.text(r.value, 80, y)
    y += 5
  })

  y += 4

  autoTable(doc, {
    startY: y,
    head: [['#', 'Valor Base', 'Interés', 'Tarifa', 'Total', 'Fecha Pago']],
    body: payload.cuotas.map((c) => [
      c.numeroCuota,
      { content: `$${c.valorBase.toFixed(2)}`, styles: { halign: 'right' } },
      { content: `$${c.interes.toFixed(2)}`, styles: { halign: 'right', textColor: [217, 45, 32] } },
      { content: `$${c.tarifaPago.toFixed(2)}`, styles: { halign: 'right', textColor: [180, 35, 24] } },
      { content: `$${c.total.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [3, 152, 85] } },
      c.fechaPago,
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [209, 213, 219],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [26, 86, 219],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [17, 24, 39],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  })

  return doc.output('blob')
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

export type Format = 'pdf' | 'excel'

export async function downloadFile(payload: DownloadPayload, format: Format) {
  const blob = format === 'excel' ? await buildExcel(payload) : buildPDF(payload)
  const ext = format === 'excel' ? 'xlsx' : 'pdf'
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${payload.filename}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
