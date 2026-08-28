import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { usePageHeader } from '@/hooks/usePageHeader'
import { buildSampleReadyRows, EXCEL_TEMPLATE, WAREHOUSES } from '@/features/receipts/mockData'
import {
  draftCreated,
  excelCleared,
  excelImported,
  partiyaCreated,
  receiptConfirmed,
  receiptDeleted,
  receiptHeaderUpdated,
  rowAdded,
  rowUpdated,
} from '@/features/receipts/receiptsSlice'
import ReceiptHeaderForm from './components/ReceiptHeaderForm'
import RowsStep from './components/RowsStep'
import RowEditModal from './components/RowEditModal'
import BatchCreateModal from './components/BatchCreateModal'
import LabelsModal from './components/LabelsModal'
import ConfirmSubmitModal from './components/ConfirmSubmitModal'
import ConfirmDeleteModal from './components/ConfirmDeleteModal'
import ExcelUploadModal from './components/ExcelUploadModal'
import Toast from '@/components/Toast'

export default function ReceiptDetailPage({ isNew }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const hasCreated = useRef(false)

  // Yangi hujjat: darhol qoralama sifatida yaratamiz va shu hujjatning
  // o'zi sahifasiga o'tamiz — "Yangi" va mavjud hujjat bitta komponentda ishlaydi.
  useEffect(() => {
    if (isNew && !hasCreated.current) {
      hasCreated.current = true
      const action = dispatch(draftCreated({ warehouse: WAREHOUSES[0] }))
      navigate(`/tovarlar-kirimi/${action.payload.id}`, { replace: true })
    }
  }, [isNew, dispatch, navigate])

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
  const [excelOpen, setExcelOpen] = useState(false)
  const [toast, setToast] = useState('')

  const isConfirmed = receipt?.status === 'confirmed'

  usePageHeader(
    'Tovarlar kirimi',
    receipt
      ? isConfirmed
        ? { label: 'Tasdiqlangan', variant: 'confirmed' }
        : receipt.status === 'new'
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

  const doc = {
    number: receipt.number,
    date: receipt.date,
    warehouse: receipt.warehouse,
    agentName: user?.fullName ?? '—',
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
          readOnly={isConfirmed}
          onChange={(patch) => dispatch(receiptHeaderUpdated({ id: receipt.id, patch }))}
        />

        <RowsStep
          doc={doc}
          rows={receipt.rows}
          readOnly={isConfirmed}
          excelInfo={excelInfo}
          onClearExcelInfo={() => dispatch(excelCleared({ id: receipt.id }))}
          onOpenExcelUpload={() => setExcelOpen(true)}
          onRevert={() => dispatch(receiptHeaderUpdated({ id: receipt.id, patch: { status: 'draft' } }))}
          onAddRow={() => setRowModal({ open: true, row: null })}
          onRowClick={(row) => setRowModal({ open: true, row })}
          onCreatePartiya={(selectedRows) => setBatchRows(selectedRows)}
          onOpenLabels={(targetRows) => setLabelRows(targetRows)}
          onConfirm={() => setConfirmOpen(true)}
          onCancel={() => navigate('/tovarlar-kirimi')}
        />
      </div>

      <RowEditModal
        open={rowModal.open}
        onOpenChange={(open) => setRowModal((m) => ({ ...m, open }))}
        row={rowModal.row}
        onSave={(data) => {
          if (rowModal.row) {
            dispatch(rowUpdated({ id: receipt.id, rowId: rowModal.row.id, patch: data }))
          } else {
            dispatch(rowAdded({ id: receipt.id, row: data }))
          }
        }}
      />

      <BatchCreateModal
        open={!!batchRows}
        onOpenChange={(open) => !open && setBatchRows(null)}
        rows={batchRows ?? []}
        warehouse={receipt.warehouse}
        onConfirm={() => {
          dispatch(partiyaCreated({ id: receipt.id, rowIds: batchRows.map((r) => r.id) }))
          setBatchRows(null)
        }}
      />

      <LabelsModal
        open={!!labelRows}
        onOpenChange={(open) => !open && setLabelRows(null)}
        rows={labelRows ?? []}
        agentName={user?.fullName ?? '—'}
        onPrinted={() => setLabelRows(null)}
      />

      <ExcelUploadModal
        open={excelOpen}
        onOpenChange={setExcelOpen}
        warehouse={receipt.warehouse}
        onUploaded={() => {
          dispatch(
            excelImported({
              id: receipt.id,
              rows: buildSampleReadyRows(),
              meta: EXCEL_TEMPLATE,
            })
          )
          setExcelOpen(false)
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

      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        receipt={receipt}
        onConfirm={() => {
          dispatch(receiptDeleted(receipt.id))
          navigate('/tovarlar-kirimi')
        }}
      />

      <Toast message={toast} />
    </>
  )
}
