import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PageHeader from '@/components/PageHeader'
import ContractForm from '../../ContractForm'
import { updateContract } from '../../actions'

export default async function EditContractPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const [contract, houses, tenants] = await Promise.all([
    prisma.contract.findFirst({ where: { id: params.id, userId } }),
    prisma.house.findMany({ where: { userId }, orderBy: { street: 'asc' }, include: { owner: true } }),
    prisma.tenant.findMany({ where: { userId }, orderBy: { fullName: 'asc' } }),
  ])

  if (!contract) notFound()

  const action = updateContract.bind(null, contract.id)

  return (
    <div>
      <PageHeader title="Editar contrato" />
      <ContractForm
        action={action}
        houses={houses}
        tenants={tenants}
        isEdit
        defaultValues={{
          houseId: contract.houseId,
          tenantId: contract.tenantId,
          rentPrice: contract.rentPrice.toString(),
          depositPrice: contract.depositPrice.toString(),
          startDate: new Date(contract.startDate).toISOString().split('T')[0],
          startDateDay: contract.startDateDay.toString(),
          deadline: contract.deadline.toString(),
          witnessName: contract.witnessName,
          witness2Name: contract.witness2Name,
          status: contract.status,
        }}
      />
    </div>
  )
}
