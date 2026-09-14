'use client'

import { useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  ViewTransition,
  addTransitionType,
  startTransition,
} from 'react'
import {
  ArrowLeft,
  Building2,
  CircleDot,
  MapPinned,
  MoreHorizontal,
  Pencil,
  Trash2,
  FilePenLine,
  Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import HouseImageCarousel from './HouseImageCarousel'
import {
  formatRent,
  PROPERTY_TYPE_LABELS,
  HOUSE_STATUS_LABELS,
} from './housePlaceholders'
import type { MobileHouseDto } from './types'
import type { MobileHouseFormDefaults } from '@/lib/mobileHouses'
import type { ContractFormDefaults } from '@/app/(dashboard)/contracts/ContractFormFields'
import { deleteHouse, updateHouse } from '@/app/(dashboard)/houses/actions'
import {
  createContract,
  updateContract,
  deleteContract,
} from '@/app/(dashboard)/contracts/actions'
import ContractFormFields from '@/app/(dashboard)/contracts/ContractFormFields'
import { notify } from '@/lib/toast'
import SlideSheet from '@/components/SlideSheet'
import HouseFormFields from '@/app/(dashboard)/houses/HouseFormFields'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type OwnerOption = {
  id: string
  name: string
}

type TenantOption = {
  id: string
  fullName: string
}

type MobileHouseDetailProps = {
  house: MobileHouseDto
  owners: OwnerOption[]
  tenants: TenantOption[]
  formDefaults: MobileHouseFormDefaults
  contractDefaults: ContractFormDefaults | null
  contractTenantName: string | null
}

const ctaClassName = cn(
  'fixed inset-x-4 z-30 flex items-center justify-center rounded-full bg-brand-500 py-4',
  'bottom-[max(1rem,env(safe-area-inset-bottom,0px))]',
  'text-[16px] font-semibold text-white',
  'shadow-[0_10px_28px_rgba(15,23,42,0.22)]',
  'transition-all duration-150 hover:bg-brand-600 active:scale-[0.98]',
  'md:static md:left-auto md:right-auto md:bottom-auto md:z-auto md:mt-8 md:w-full'
)

export default function MobileHouseDetail({
  house,
  owners,
  tenants,
  formDefaults,
  contractDefaults,
  contractTenantName,
}: MobileHouseDetailProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [confirmDeleteHouse, setConfirmDeleteHouse] = useState(false)
  const [confirmCancelContract, setConfirmCancelContract] = useState(false)
  const [editHouseOpen, setEditHouseOpen] = useState(false)
  const [contractSheet, setContractSheet] = useState<'create' | 'edit' | null>(
    null
  )
  const [isPending, startDeleteTransition] = useTransition()
  const [isSaving, startSaveTransition] = useTransition()
  const [isContractPending, startContractTransition] = useTransition()

  const stats = [
    {
      label: 'Tipo',
      value: PROPERTY_TYPE_LABELS[house.propertyType],
      icon: Building2,
    },
    {
      label: 'Estado',
      value: HOUSE_STATUS_LABELS[house.houseStatus],
      icon: CircleDot,
    },
    {
      label: 'Ciudad',
      value: house.city,
      icon: MapPinned,
    },
  ]

  const canDeleteHouseAction = house.houseStatus !== 'RENTED' && !house.hasContract
  const canManageContract = Boolean(house.contractId)

  function handleBack() {
    startTransition(() => {
      addTransitionType('nav-back')
      router.push('/')
    })
  }

  function handleDeleteHouse() {
    startDeleteTransition(async () => {
      const result = await deleteHouse(house.id)
      if (!result.ok) {
        if (result.code === 'HAS_CONTRACTS' || result.code === 'RENTED') {
          notify.error(
            'No se puede eliminar un inmueble con contratos asociados'
          )
        } else {
          notify.saveError()
        }
        setConfirmDeleteHouse(false)
        return
      }
      setConfirmDeleteHouse(false)
      notify.deleted('Inmueble')
      startTransition(() => {
        addTransitionType('nav-back')
        router.push('/')
      })
    })
  }

  function handleCancelContract() {
    if (!house.contractId) return
    startContractTransition(async () => {
      try {
        await deleteContract(house.contractId!)
        notify.deleted('Contrato')
        setConfirmCancelContract(false)
        router.refresh()
      } catch {
        notify.saveError()
      }
    })
  }

  function handleHouseSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startSaveTransition(async () => {
      try {
        await updateHouse(house.id, fd)
        notify.updated('Inmueble')
        setEditHouseOpen(false)
        router.refresh()
      } catch {
        notify.saveError()
      }
    })
  }

  function handleContractSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startContractTransition(async () => {
      try {
        if (contractSheet === 'edit' && house.contractId) {
          await updateContract(house.contractId, fd)
          notify.updated('Contrato')
        } else {
          await createContract(fd)
          notify.created('Contrato')
        }
        setContractSheet(null)
        router.refresh()
      } catch {
        notify.saveError()
      }
    })
  }

  function renderCta() {
    if (house.houseStatus === 'MAINTENANCE') return null

    let cta: ReactNode = null

    if (house.houseStatus === 'RENTED' && house.contractId) {
      cta = (
        <a
          href={`/contracts/${house.contractId}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className={ctaClassName}
        >
          Ver contrato
        </a>
      )
    } else if (house.houseStatus === 'AVAILABLE') {
      cta = (
        <button
          type="button"
          onClick={() => setContractSheet('create')}
          className={ctaClassName}
        >
          Crear contrato
        </button>
      )
    }

    if (!cta) return null

    return (
      <ViewTransition
        name={`house-open-${house.id}`}
        share={{
          'nav-forward': 'morph',
          'nav-back': 'morph',
          default: 'morph',
        }}
        default="none"
      >
        {cta}
      </ViewTransition>
    )
  }

  const tenantLabel = contractTenantName ?? house.contractTenantName ?? 'inquilino'

  return (
    <div className="relative -mx-4 -mt-4 -mb-28 flex min-h-full flex-col bg-[#F7F7F7] md:mb-0">
      <header
        className={cn(
          'sticky top-0 z-20 flex items-center justify-between px-4 pb-3',
          'pt-[calc(0.75rem+env(safe-area-inset-top))]',
          'border-b border-white/55 bg-[#F7F7F7]/72 backdrop-blur-xl',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(15,23,42,0.06)]'
        )}
        style={{ viewTransitionName: 'house-detail-header' }}
      >
        <button
          type="button"
          onClick={handleBack}
          className="flex size-11 items-center justify-center rounded-full bg-[#EFEFEF] text-black transition-transform active:scale-[0.96]"
          aria-label="Volver"
        >
          <ArrowLeft className="size-5" strokeWidth={2} />
        </button>
        <h1 className="max-w-[55%] truncate text-center text-[16px] font-medium tracking-tight text-black">
          {house.title}
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-11 items-center justify-center rounded-full bg-[#EFEFEF] text-black transition-transform outline-none active:scale-[0.96]"
            aria-label="Acciones"
          >
            <MoreHorizontal className="size-5" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8}>
            <DropdownMenuItem onClick={() => setEditHouseOpen(true)}>
              <Pencil strokeWidth={1.75} />
              Editar inmueble
            </DropdownMenuItem>
            {canDeleteHouseAction ? (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmDeleteHouse(true)}
              >
                <Trash2 strokeWidth={1.75} />
                Eliminar inmueble
              </DropdownMenuItem>
            ) : null}
            {canManageContract ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setContractSheet('edit')}>
                  <FilePenLine strokeWidth={1.75} />
                  Editar contrato
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setConfirmCancelContract(true)}
                >
                  <Ban strokeWidth={1.75} />
                  Cancelar contrato
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="relative px-4 pb-6 pt-3">
        <ViewTransition
          name={`house-${house.id}`}
          share={{
            'nav-forward': 'morph',
            'nav-back': 'morph',
            default: 'morph',
          }}
          default="none"
        >
          <HouseImageCarousel
            images={house.images?.length ? house.images : [house.image]}
            alt={house.title}
            badgeStatus={house.badgeStatus}
            expiresInDays={house.expiresInDays}
            priority
          />
        </ViewTransition>
      </div>

      <div
        className={cn(
          'relative z-10 mx-4 mb-4 -mt-2 flex min-h-0 flex-1 flex-col',
          'rounded-[28px] bg-white px-5 pt-6',
          'pb-[calc(6rem+env(safe-area-inset-bottom,0px))]',
          'shadow-[0_-8px_32px_rgba(15,23,42,0.04)]',
          'md:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]'
        )}
      >
        <h3 className="text-[20px] font-normal tracking-tight text-black">
          Información del inmueble
        </h3>

        <div className="-mx-2.5 mt-5 grid grid-cols-3 gap-1.5">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="min-w-0 rounded-[24px] bg-[#F3F3F3] px-3 py-6"
            >
              <Icon
                className="size-5 text-black"
                strokeWidth={1.75}
                aria-hidden
              />
              <p className="mt-4 truncate text-[15px] font-normal leading-tight tracking-tight text-black">
                {value}
              </p>
              <p className="mt-1.5 text-[12px] font-normal leading-none text-[#8C8C8C]">
                {label}
              </p>
            </div>
          ))}
        </div>

        {house.rentMxn != null ? (
          <p className="mt-6 text-[28px] font-normal tabular-nums tracking-tight text-brand-600">
            {formatRent(house.rentMxn)}
            <span className="ml-1.5 text-[13px] font-medium text-[#8C8C8C]">
              / mes
            </span>
          </p>
        ) : (
          <p className="mt-6 text-[16px] font-normal text-[#8C8C8C]">
            Sin renta activa
          </p>
        )}

        <p className="mt-3 text-[13px] leading-snug text-[#8C8C8C]">
          {house.address}, {house.city}
        </p>

        <div className="mt-6">
          <h3 className="text-[15px] font-medium text-black">Descripción</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[#5C5C5C]">
            {expanded || house.description.length <= 110 ? (
              house.description
            ) : (
              <>
                {house.description.slice(0, 110).trimEnd()}…{' '}
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="inline font-medium text-brand-600"
                >
                  Leer más
                </button>
              </>
            )}
          </p>
          {expanded && house.description.length > 110 ? (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="mt-1 text-[14px] font-medium text-brand-600"
            >
              Leer menos
            </button>
          ) : null}
        </div>

        {renderCta()}
      </div>

      <SlideSheet
        open={editHouseOpen}
        onClose={() => setEditHouseOpen(false)}
        title="Editar inmueble"
        width={480}
        footer={
          <button
            type="submit"
            form="mobile-house-edit-form"
            disabled={isSaving}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? 'Guardando…' : 'Actualizar'}
          </button>
        }
      >
        <form
          id="mobile-house-edit-form"
          onSubmit={handleHouseSubmit}
          className="space-y-4"
        >
          <HouseFormFields
            owners={owners}
            defaults={formDefaults}
            showStatus
            hasContract={house.hasContract}
          />
        </form>
      </SlideSheet>

      <SlideSheet
        open={contractSheet !== null}
        onClose={() => setContractSheet(null)}
        title={
          contractSheet === 'edit' ? 'Editar contrato' : 'Nuevo contrato'
        }
        width={500}
        footer={
          <button
            type="submit"
            form="mobile-house-contract-form"
            disabled={isContractPending}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isContractPending
              ? 'Guardando…'
              : contractSheet === 'edit'
                ? 'Actualizar'
                : 'Crear contrato'}
          </button>
        }
      >
        <form
          key={contractSheet === 'edit' ? house.contractId ?? 'edit' : 'new'}
          id="mobile-house-contract-form"
          onSubmit={handleContractSubmit}
          className="space-y-4"
        >
          <ContractFormFields
            lockedHouseId={house.id}
            houses={[{ id: house.id, label: house.title }]}
            tenants={tenants}
            defaults={
              contractSheet === 'edit' && contractDefaults
                ? contractDefaults
                : undefined
            }
          />
        </form>
      </SlideSheet>

      <AlertDialog
        open={confirmDeleteHouse}
        onOpenChange={setConfirmDeleteHouse}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar “{house.title}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHouse}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmCancelContract}
        onOpenChange={setConfirmCancelContract}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Cancelar el contrato de “{tenantLabel}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              El inmueble quedará libre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isContractPending}>
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelContract}
              disabled={isContractPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isContractPending ? 'Cancelando…' : 'Cancelar contrato'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
