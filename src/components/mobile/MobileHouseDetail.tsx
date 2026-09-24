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

const ctaButtonClassName = cn(
  'relative z-[1] inline-flex shrink-0 items-center justify-center rounded-full bg-brand-500 px-6 py-3.5',
  'text-[15px] font-semibold text-white',
  'shadow-[0_8px_20px_rgba(63,92,72,0.32)]',
  'transition-all duration-150 hover:bg-brand-600 active:scale-[0.98]'
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
  const [canSubmitHouse, setCanSubmitHouse] = useState(true)
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

  function renderCtaBar() {
    if (house.houseStatus === 'MAINTENANCE') return null

    let action: ReactNode = null

    if (house.houseStatus === 'RENTED' && house.contractId) {
      action = (
        <a
          href={`/contracts/${house.contractId}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className={ctaButtonClassName}
        >
          Ver contrato
        </a>
      )
    } else if (house.houseStatus === 'AVAILABLE') {
      action = (
        <button
          type="button"
          onClick={() => setContractSheet('create')}
          className={ctaButtonClassName}
        >
          Crear contrato
        </button>
      )
    }

    if (!action && house.rentMxn == null) return null

    return (
      <div className="property-detail-cta-bar">
        <div className="relative z-[1] min-w-0 flex-1">
          {house.rentMxn != null ? (
            <p className="tabular text-[22px] font-semibold leading-none tracking-tight text-brand-600">
              {formatRent(house.rentMxn)}
              <span className="ml-1 text-[12px] font-medium text-text-muted">
                / mes
              </span>
            </p>
          ) : (
            <p className="text-[13px] font-medium text-text-muted">
              Sin renta activa
            </p>
          )}
        </div>
        {action}
      </div>
    )
  }

  const tenantLabel = contractTenantName ?? house.contractTenantName ?? 'inquilino'
  const showCtaBar =
    house.houseStatus !== 'MAINTENANCE' &&
    (house.rentMxn != null ||
      house.houseStatus === 'AVAILABLE' ||
      (house.houseStatus === 'RENTED' && Boolean(house.contractId)))

  return (
    <>
      <div className="relative -mx-4 -mt-4 flex flex-col">
      <div className="property-detail-media relative">
        <HouseImageCarousel
          images={house.images?.length ? house.images : [house.image]}
          alt={house.title}
          badgeStatus={house.badgeStatus}
          expiresInDays={house.expiresInDays}
          fullBleed
          priority
        />

        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-4',
            'pt-[calc(0.75rem+env(safe-area-inset-top,0px))]'
          )}
        >
          <button
            type="button"
            onClick={handleBack}
            className="pointer-events-auto liquid-glass flex size-11 items-center justify-center rounded-full text-text-primary transition-transform active:scale-[0.96]"
            aria-label="Volver"
          >
            <ArrowLeft className="size-5" strokeWidth={2} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="pointer-events-auto liquid-glass flex size-11 items-center justify-center rounded-full text-text-primary transition-transform outline-none active:scale-[0.96]"
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
        </div>
      </div>
      </div>

      <ViewTransition
        name={`house-body-${house.id}`}
        share="morph"
        enter={{
          'nav-forward': 'sheet-up',
          'nav-back': 'none',
          default: 'none',
        }}
        exit={{
          'nav-forward': 'none',
          'nav-back': 'sheet-down',
          default: 'none',
        }}
        default="none"
      >
        <div
          className={cn(
            'property-detail-sheet liquid-glass-tile relative z-10 -mx-4 -mt-10 flex min-h-0 flex-col',
            !showCtaBar && 'flex-1',
            'rounded-t-[32px] px-5 pt-6',
            showCtaBar
              ? 'pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))]'
              : 'pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]'
          )}
        >
          <h1 className="text-[24px] font-semibold tracking-tight text-text-primary text-balance">
            {house.title}
          </h1>
          <p className="mt-1.5 text-[13px] leading-snug text-text-muted">
            {house.address}, {house.city}
          </p>

          <div className="-mx-2.5 mt-5 grid grid-cols-3 gap-1.5">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="min-w-0 rounded-[24px] bg-black/[0.05] px-3 py-6 backdrop-blur-sm"
              >
                <Icon
                  className="size-5 text-text-primary"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <p className="mt-4 truncate text-[15px] font-normal leading-tight tracking-tight text-text-primary">
                  {value}
                </p>
                <p className="mt-1.5 text-[12px] font-normal leading-none text-text-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="text-[15px] font-medium text-text-primary">
              Descripción
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
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
        </div>
      </ViewTransition>

      {renderCtaBar()}

      <SlideSheet
        open={editHouseOpen}
        onClose={() => setEditHouseOpen(false)}
        title="Editar inmueble"
        width={480}
        footer={
          <button
            type="submit"
            form="mobile-house-edit-form"
            disabled={isSaving || !canSubmitHouse}
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
            onCanSubmitChange={setCanSubmitHouse}
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
    </>
  )
}
