'use client'

import MobileHome, {
  type MobileOwnerOption,
} from '@/components/mobile/MobileHome'
import type { MobileHouseDto } from '@/components/mobile/types'
import type { WorkspaceKpiData } from '@/components/WorkspaceGlassKpis'

type MobileDashboardClientProps = {
  userId: string
  userName?: string | null
  houses: MobileHouseDto[]
  owners: MobileOwnerOption[]
  kpis: WorkspaceKpiData
}

export default function MobileDashboardClient({
  userId,
  userName,
  houses,
  owners,
  kpis,
}: MobileDashboardClientProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col md:hidden">
      <MobileHome
        userId={userId}
        userName={userName}
        houses={houses}
        owners={owners}
        kpis={kpis}
      />
    </div>
  )
}
