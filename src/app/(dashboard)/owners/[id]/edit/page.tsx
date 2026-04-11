import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PageHeader from '@/components/PageHeader'
import FormCard, { FormField, inputClass } from '@/components/FormCard'
import { updateOwner } from '../../actions'
import Link from 'next/link'

export default async function EditOwnerPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const owner = await prisma.owner.findFirst({
    where: { id: params.id, userId: session!.user.id },
  })

  if (!owner) notFound()

  const action = updateOwner.bind(null, owner.id)

  return (
    <div>
      <PageHeader title="Editar propietario" />
      <FormCard title="Datos del propietario">
        <form action={action} className="space-y-5">
          <FormField label="Nombre completo" required>
            <input name="name" type="text" required defaultValue={owner.name} className={inputClass} />
          </FormField>

          <FormField label="Teléfono" required>
            <input name="phone" type="tel" required defaultValue={owner.phone} className={inputClass} />
          </FormField>

          <FormField label="Correo electrónico">
            <input name="email" type="email" defaultValue={owner.email ?? ''} className={inputClass} />
          </FormField>

          <FormField label="Domicilio del propietario" required hint="Aquí se entregará el pago de renta">
            <input name="address" type="text" required defaultValue={owner.address} className={inputClass} />
          </FormField>

          <div className="flex items-center gap-2 pt-2">
            <button type="submit" className="btn-primary">Guardar cambios</button>
            <Link href="/owners" className="btn-ghost">Cancelar</Link>
          </div>
        </form>
      </FormCard>
    </div>
  )
}
