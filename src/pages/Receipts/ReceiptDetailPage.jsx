import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { usePageHeader } from '@/hooks/usePageHeader'
import {
  cancelReceipt,
  deleteReceipt,
  draftCreated,
  excelCleared,
  excelImported,
  partiyaCreated,
  partiesDetached,
  receiptConfirmed,
  receiptHeaderUpdated,
  receiptReverted,
  rowAdded,
  rowUpdated,
} from '@/features/receipts/receiptsSlice'
import { warehouseOptions } from '@/services/optionSources'
import { extractErrorMessage } from '@/services/apiHelpers'
import { removeParties, updatePartyFromRow } from '@/services/receiptService'
import ReceiptHeaderForm from './components/ReceiptHeaderForm'
import RowsStep from './components/RowsStep'
import RowEditModal from './components/RowEditModal'
import BatchCreateModal from './components/BatchCreateModal'
import LabelsModal from './components/LabelsModal'
import ConfirmSubmitModal from './components/ConfirmSubmitModal'
import ConfirmDeleteModal from './components/ConfirmDeleteModal'
import CancelReceiptModal from './components/CancelReceiptModal'
import ExcelUploadModal from './components/ExcelUploadModal'
import Toast from '@/components/Toast'

export default function ReceiptDetailPage({ isNew }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const hasCreated = useRef(false)

  // Yangi hujjat: birinchi omborni (backenddan) standart qilib qoralama yaratamiz va
  // shu hujjatning o'zi sahifasiga o'tamiz — "Yangi" va mavjud hujjat bitta komponentda ishlaydi.
  useEffect(() => {
    if (!isNew || hasCreated.current) return
    hasCreated.current = true
    warehouseOptions({ page: 1 })
      .then((res) => res.results[0] ?? null)
      .catch(() => null)
      .then((warehouse) => {
        const action = dispatch(draftCreated({ warehouse, author: user?.fullName ?? '' }))
        navigate(`/tovarlar-kirimi/${action.payload.id}`, { replace: true })
      })
  }, [isNew, dispatch, navigate, user?.fullName])

  if (isNew) return null
  return <ReceiptWorkspace />
}

function ReceiptWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const exchangeRate = useSelector((state) => state.receipts.exchangeRate)
  const receipt = useSelector((state) => state.receipts.list.find((r) => r.id === id))

  const [rowModal, setRowModal] = useState({ open: false, row: null })
  const [batchRows, setBatchRows] = useState(null)
  const [labelRows, setLabelRows] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [excelOpen, setExcelOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)

  const status = receipt?.status
  const readOnly = status === 'confirmed' || status === 'cancelled'

  usePageHeader(
    'Tovarlar kirimi',
    receipt
      ? status === 'confirmed'
        ? { label: 'Tasdiqlangan', variant: 'confirmed' }
        : status === 'cancelled'
          ? { label: 'Bekor qilingan', variant: 'rejected' }
          : status === 'new'
            ? { label: 'Yangi', variant: 'new' }
            : { label: receipt.number, variant: 'new' }
      : null
  )

  useEffect(() => {
    if (!receipt) navigate('/tovarlar-kirimi', { replace: true })
  }, [receipt, navigate])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  if (!receipt) return null

  const showError = (message) => setToast({ variant: 'error', message })
  const partyCtx = { warehouseName: receipt.warehouse, receiptNumber: receipt.number }

  // Qatorni saqlash: partiyasi bor qator bo'lsa, avval backenddagi partiya yangilanadi (PATCH)
  async function saveRow(data) {
    if (!rowModal.row) {
      dispatch(rowAdded({ id: receipt.id, row: data }))
      return
    }
    const merged = { ...rowModal.row, ...data }
    if (merged.partyId) {
      merged.m2 = Number((merged.widthM * merged.heightM).toFixed(2))
      try {
        await updatePartyFromRow(merged, partyCtx)
      } catch (error) {
        showError(`Partiya yangilanmadi: ${extractErrorMessage(error)}`)
        return
      }
    }
    dispatch(rowUpdated({ id: receipt.id, rowId: rowModal.row.id, patch: data }))
  }

  // Qatorlarni tozalash: yaratilgan partiyalar backenddan ham o'chiriladi
  async function clearRows() {
    const partyIds = receipt.rows.map((r) => r.partyId).filter(Boolean)
    if (partyIds.length) {
      setBusy(true)
      const { removed, failed } = await removeParties(partyIds)
      setBusy(false)
      if (removed.length) dispatch(partiesDetached({ id: receipt.id, partyIds: removed }))
      if (failed) {
        showError(`Partiyani o'chirib bo'lmadi: ${extractErrorMessage(failed)}`)
        return
      }
    }
    dispatch(excelCleared({ id: receipt.id }))
  }

  // Batch modal ochiq turganda qatorlar yangilansa (partiya yaratildi) — eng so'nggi holatini ko'rsatamiz
  const batchRowsLive = batchRows
    ? batchRows.map((b) => receipt.rows.find((r) => r.id === b.id) ?? b)
    : []

  const doc = {
    number: receipt.number,
    date: receipt.date,
    warehouse: receipt.warehouse,
    agentName: user?.fullName ?? '',
    exchangeRate,
    counterparty: receipt.counterparty,
    supplierDoc: receipt.supplier?.doc,
  }

  const excelInfo = receipt.excelMeta
    ? {
        fileName: receipt.excelMeta.fileName,
        rowCount: receipt.excelMeta.rows,
        totalM2: receipt.excelMeta.m2,
      }
    : null

  return (
    <>
      <div className="flex flex-col gap-4">
        <ReceiptHeaderForm
          receipt={receipt}
          exchangeRate={exchangeRate}
          readOnly={readOnly}
          onChange={(patch) => dispatch(receiptHeaderUpdated({ id: receipt.id, patch }))}
        />

        <RowsStep
          doc={doc}
          rows={receipt.rows}
          status={status}
          cancelReason={receipt.cancelReason}
          readOnly={readOnly}
          excelInfo={excelInfo}
          onClearExcelInfo={busy ? undefined : clearRows}
          onOpenExcelUpload={() => setExcelOpen(true)}
          onRevert={() => dispatch(receiptReverted(receipt.id))}
          onCancelReceipt={() => setCancelOpen(true)}
          onAddRow={() => setRowModal({ open: true, row: null })}
          onRowClick={(row) => setRowModal({ open: true, row })}
          onCreatePartiya={(selectedRows) => setBatchRows(selectedRows)}
          onOpenLabels={(targetRows) => setLabelRows(targetRows)}
          onConfirm={() => setConfirmOpen(true)}
          onCancel={() => navigate('/tovarlar-kirimi')}
          onDelete={() => setDeleteOpen(true)}
        />
      </div>

      <RowEditModal
        open={rowModal.open}
        onOpenChange={(open) => setRowModal((m) => ({ ...m, open }))}
        row={rowModal.row}
        onSave={saveRow}
      />

      <BatchCreateModal
        open={!!batchRows}
        onOpenChange={(open) => !open && setBatchRows(null)}
        rows={batchRowsLive}
        receipt={receipt}
        onCreated={(created) => {
          dispatch(partiyaCreated({ id: receipt.id, created }))
          setToast(`${created.length} ta partiya yaratildi`)
        }}
      />

      <LabelsModal
        open={!!labelRows}
        onOpenChange={(open) => !open && setLabelRows(null)}
        rows={labelRows ?? []}
        agentName={user?.fullName ?? ''}
        onPrinted={() => setLabelRows(null)}
      />

      <ExcelUploadModal
        open={excelOpen}
        onOpenChange={setExcelOpen}
        receipt={receipt}
        onUploaded={({ rows, meta, warehouse }) => {
          dispatch(excelImported({ id: receipt.id, rows, meta, warehouse }))
          setExcelOpen(false)
          const unresolved = rows.filter((r) => !r.qualityId || !r.colorId).length
          setToast(
            unresolved
              ? `${rows.length} qator yuklandi · ${unresolved} tasida sifat/rang ma'lumotnomada topilmadi`
              : `${rows.length} qator yuklandi`
          )
        }}
      />

      <ConfirmSubmitModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        receipt={receipt}
        onConfirm={() => {
          dispatch(receiptConfirmed(receipt.id))
          setConfirmOpen(false)
          setToast(`Hujjat tasdiqlandi · ${receipt.number}`)
        }}
      />

      <CancelReceiptModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        receipt={receipt}
        onConfirm={async (reason) => {
          const result = await dispatch(cancelReceipt({ id: receipt.id, reason }))
          setCancelOpen(false)
          if (cancelReceipt.fulfilled.match(result)) setToast(`Kirim bekor qilindi · ${receipt.number}`)
          else showError(result.payload ?? 'Bekor qilib bo‘lmadi')
        }}
      />

      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        receipt={receipt}
        onConfirm={async () => {
          const result = await dispatch(deleteReceipt(receipt.id))
          setDeleteOpen(false)
          if (deleteReceipt.fulfilled.match(result)) navigate('/tovarlar-kirimi')
          else showError(result.payload ?? 'O‘chirib bo‘lmadi')
        }}
      />

      <Toast message={toast} />
    </>
  )
}
