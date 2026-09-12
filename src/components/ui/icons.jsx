import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon as Add01Raw,
  BalanceScaleIcon as BalanceScaleRaw,
  Book01Icon as Book01Raw,
  Briefcase01Icon as Briefcase01Raw,
  Building03Icon as Building03Raw,
  Calendar03Icon as Calendar03Raw,
  CashierIcon as CashierRaw,
  Chart01Icon as Chart01Raw,
  DashboardSquare01Icon as DashboardSquare01Raw,
  Download01Icon as Download01Raw,
  FileTextIcon as FileTextRaw,
  FilterIcon as FilterRaw,
  FilterResetIcon as FilterResetRaw,
  Invoice01Icon as Invoice01Raw,
  Logout01Icon as Logout01Raw,
  PackageReceive01Icon as PackageReceive01Raw,
  Search01Icon as Search01Raw,
  Settings01Icon as Settings01Raw,
  ShoppingCartCheckIn01Icon as ShoppingCartCheckIn01Raw,
  ShoppingCartCheckOut01Icon as ShoppingCartCheckOut01Raw,
  ShoppingCartRemove01Icon as ShoppingCartRemove01Raw,
  SidebarLeft01Icon as SidebarLeft01Raw,
  Tag01Icon as Tag01Raw,
  UserGroupIcon as UserGroupRaw,
  UserMultipleIcon as UserMultipleRaw,
} from '@hugeicons/core-free-icons'

export function FilterResetIcon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={FilterResetRaw} size={size} className={className} strokeWidth={2} {...props} />
}

export function Calendar03Icon({ className, size = 16, ...props }) {
  return <HugeiconsIcon icon={Calendar03Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function Search01Icon({ className, size = 16, ...props }) {
  return <HugeiconsIcon icon={Search01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function Add01Icon({ className, size = 16, ...props }) {
  return <HugeiconsIcon icon={Add01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function Download01Icon({ className, size = 16, ...props }) {
  return <HugeiconsIcon icon={Download01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function FilterIcon({ className, size = 16, ...props }) {
  return <HugeiconsIcon icon={FilterRaw} size={size} className={className} strokeWidth={2} {...props} />
}

// Sidebar navigatsiyasi uchun ikonalar (Figma bilan bir xil ikonalar oilasi)
export function ShoppingCartCheckIn01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={ShoppingCartCheckIn01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function Tag01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={Tag01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function ShoppingCartCheckOut01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={ShoppingCartCheckOut01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function ShoppingCartRemove01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={ShoppingCartRemove01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function PackageReceive01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={PackageReceive01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function Invoice01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={Invoice01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function UserGroupIcon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={UserGroupRaw} size={size} className={className} strokeWidth={2} {...props} />
}

export function UserMultipleIcon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={UserMultipleRaw} size={size} className={className} strokeWidth={2} {...props} />
}

export function CashierIcon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={CashierRaw} size={size} className={className} strokeWidth={2} {...props} />
}

export function Chart01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={Chart01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function DashboardSquare01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={DashboardSquare01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function FileTextIcon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={FileTextRaw} size={size} className={className} strokeWidth={2} {...props} />
}

// Figma'dan berilgan aniq "Audit jurnali" ikonkasi (hujjat + tasdiq + lupa)
export function Audit01Icon({ className, size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className} {...props}>
      <path
        d="M11.25 5.25C11.25 5.25 11.625 5.625 12 6.375C12 6.375 13.1911 4.5 14.25 4.125"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.51079 1.50434C5.63693 1.425 4.18924 1.64086 4.18924 1.64086C3.2751 1.70622 1.52324 2.21872 1.52326 5.21173C1.52327 8.17932 1.50388 11.8378 1.52326 13.2963C1.52326 14.1873 2.07497 16.2658 3.98459 16.3772C6.30572 16.5126 10.4867 16.5414 12.405 16.3772C12.9185 16.3482 14.6281 15.9451 14.8445 14.085C15.0686 12.158 15.024 10.8188 15.024 10.5001"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5145 5.25C16.5145 7.32107 14.834 9 12.7609 9C10.6879 9 9.00732 7.32107 9.00732 5.25C9.00732 3.17893 10.6879 1.5 12.7609 1.5C14.834 1.5 16.5145 3.17893 16.5145 5.25Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M5.25 9.75H8.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M5.25 12.75H11.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function BalanceScaleIcon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={BalanceScaleRaw} size={size} className={className} strokeWidth={2} {...props} />
}

export function Book01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={Book01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

// Figma'dan berilgan aniq "Ma'lumotnomalar" ikonkasi (public/malumotnomalar.svg bilan bir xil)
export function MalumotnomalarIcon({ className, size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className} {...props}>
      <path
        d="M12.1971 7.875H5.80298C3.86682 7.875 2.89874 7.875 2.45361 8.51445C2.00848 9.15391 2.33932 10.0693 3.00099 11.9002L3.81412 14.1502C4.15913 15.1049 4.33163 15.5822 4.71671 15.8536C5.1018 16.125 5.60657 16.125 6.61611 16.125H11.384C12.3935 16.125 12.8983 16.125 13.2834 15.8536C13.6684 15.5822 13.8409 15.1049 14.186 14.1502L14.9991 11.9002C15.6608 10.0693 15.9916 9.15391 15.5465 8.51445C15.1013 7.875 14.1333 7.875 12.1971 7.875Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
      <path
        d="M14.25 6C14.25 5.65054 14.25 5.47582 14.1929 5.33799C14.1168 5.15422 13.9708 5.00821 13.787 4.93209C13.6492 4.875 13.4745 4.875 13.125 4.875H4.875C4.52554 4.875 4.35082 4.875 4.21299 4.93209C4.02922 5.00821 3.88321 5.15422 3.80709 5.33799C3.75 5.47582 3.75 5.65054 3.75 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.375 3C12.375 2.65054 12.375 2.47582 12.3179 2.33799C12.2418 2.15422 12.0958 2.00821 11.912 1.93209C11.7742 1.875 11.5995 1.875 11.25 1.875H6.75C6.40054 1.875 6.22582 1.875 6.08799 1.93209C5.90422 2.00821 5.75821 2.15422 5.68209 2.33799C5.625 2.47582 5.625 2.65054 5.625 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Building03Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={Building03Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function Briefcase01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={Briefcase01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function Settings01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={Settings01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function SidebarLeft01Icon({ className, size = 16, ...props }) {
  return <HugeiconsIcon icon={SidebarLeft01Raw} size={size} className={className} strokeWidth={2} {...props} />
}

export function Logout01Icon({ className, size = 18, ...props }) {
  return <HugeiconsIcon icon={Logout01Raw} size={size} className={className} strokeWidth={2} {...props} />
}
