'use client'

import MobileHome, {
  type MobileOwnerOption,
} from '@/components/mobile/MobileHome'
import type { MobileHouseDto } from '@/components/mobile/types'

type MobileDashboardClientProps = {
  houses: MobileHouseDto[]
  owners: MobileOwnerOption[]
}

export default function MobileDashboardClient({
  houses,
  owners,
}: MobileDashboardClientProps) {
  return (
    <div className="md:hidden">
      <MobileHome houses={houses} owners={owners} />
    </div>
  )
}
