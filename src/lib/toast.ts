import { toast } from 'sonner'

export const notify = {
  success: (message: string) => toast.success(message),
  error:   (message: string) => toast.error(message),
  warning: (message: string) => toast.warning(message),
  info:    (message: string) => toast.info(message),

  created:   (entity: string) => toast.success(`${entity} creado`),
  updated:   (entity: string) => toast.info(`${entity} actualizado`),
  deleted:   (entity: string) => toast.error(`${entity} eliminado`),
  saveError: ()               => toast.error('Ocurrió un error al guardar. Intenta de nuevo.'),
}
