import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PageHeader from '@/components/PageHeader'
import HouseForm from '../../HouseForm'
import { updateHouse } from '../../actions'

export default async function EditHousePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const [house, owners] = await Promise.all([
    prisma.house.findFirst({ where: { id: params.id, userId: session!.user.id } }),
    prisma.owner.findMany({ where: { userId: session!.user.id }, orderBy: { name: 'asc' } }),
  ])

  if (!house) notFound()

  const action = updateHouse.bind(null, house.id)

  return (
    <div>
      <PageHeader title="Editar inmueble" />
      <HouseForm
        action={action}
        owners={owners}
        defaultValues={{
          ownerId: house.ownerId,
          street: house.street,
          number: house.number,
          colony: house.colony,
          city: house.city,
          state: house.state,
          zipCode: house.zipCode,
          propertyType: house.propertyType,
          status: house.status,
          notes: house.notes ?? '',
        }}
      />
    </div>
  )
}
