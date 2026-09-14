'use client'

import MobileHome, {
  type MobileOwnerOption,
} from '@/components/mobile/MobileHome'
import type { MobileHouseDto } from '@/components/mobile/types'

type MobileDashboardClientProps = {
  userId: string
  houses: MobileHouseDto[]
  owners: MobileOwnerOption[]
}

export default function MobileDashboardClient({
  userId,
  houses,
  owners,
}: MobileDashboardClientProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col md:hidden">
      <MobileHome userId={userId} houses={houses} owners={owners} />
    </div>
  )
}
