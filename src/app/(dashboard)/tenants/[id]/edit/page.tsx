import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PageHeader from '@/components/PageHeader'
import TenantForm from '../../TenantForm'
import { updateTenant } from '../../actions'

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const tenant = await prisma.tenant.findFirst({
    where: { id: id, userId: session!.user.id },
  })

  if (!tenant) notFound()

  const action = updateTenant.bind(null, tenant.id)

  return (
    <div>
      <PageHeader title="Editar inquilino" />
      <TenantForm action={action} defaultValues={tenant} />
    </div>
  )
}
