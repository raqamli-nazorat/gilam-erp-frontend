import { useState } from 'react'
import { Printer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import RollLabel from './RollLabel'

const SIZE_LABELS = {
  '58x40': '58 × 40 mm',
  '40x30': '40 × 30 mm',
}

export default function LabelsModal({ open, onOpenChange, rows, agentName, onPrinted }) {
  const [size, setSize] = useState('58x40')
  const [copies, setCopies] = useState(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="p-5 sm:max-w-[720px]">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DialogTitle className="shrink-0 whitespace-nowrap text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
              Yorliqlar · {rows.length} ta
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="h-9 w-[120px] rounded-md border-[#E5E5E5] bg-white text-[14px] font-normal text-[#0A0A0A] dark:border-white/10 dark:bg-card dark:text-white">
                  <SelectValue>{(v) => SIZE_LABELS[v] ?? v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="58x40">58 × 40 mm</SelectItem>
                  <SelectItem value="40x30">40 × 30 mm</SelectItem>
                </SelectContent>
              </Select>
              <NumberInput
                decimals={false}
                value={copies}
                onChange={(e) => setCopies(Number(e.target.value) || 1)}
                className="h-9 w-16 rounded-md border-[#E5E5E5] bg-white text-center text-[14px] dark:border-white/10 dark:bg-card"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
              >
                <X className="h-4 w-4" /> Yopish
              </Button>
              <Button
                type="button"
                onClick={onPrinted}
                className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
              >
                <Printer className="h-4 w-4" /> Chop etish
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid max-h-[60vh] grid-cols-2 gap-4 overflow-y-auto rounded-xl bg-[#F5F5F5] p-4 dark:bg-white/5">
          {rows.map((row) => (
            <RollLabel key={row.id} row={row} agentName={agentName} className="bg-white dark:bg-card" />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
