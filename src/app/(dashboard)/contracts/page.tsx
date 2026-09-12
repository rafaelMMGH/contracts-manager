import { redirect } from 'next/navigation'

/** Contratos list removed — house detail owns contract mutations. PDF stays at /contracts/[id]/pdf. */
export default function ContractsPage() {
  redirect('/')
}
