interface Props {
  title: string
  description?: string
  children: React.ReactNode
}

export default function FormCard({ title, description, children }: Props) {
  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h3
          className="text-slate-900 font-medium"
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '1.25rem',
            fontWeight: 600,
            textWrap: 'balance',
          } as React.CSSProperties}
        >
          {title}
        </h3>
        {description && (
          <p className="text-slate-500 text-sm mt-1 font-light">{description}</p>
        )}
      </div>

      <div className="rounded-xl p-6 space-y-5 bg-white border border-slate-200 shadow-card">
        {children}
      </div>
    </div>
  )
}

export function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 tracking-[0.06em] uppercase mb-1.5">
        {label}
        {!required && (
          <span className="text-slate-400 font-normal normal-case tracking-normal ml-1.5">
            (opcional)
          </span>
        )}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1.5">{hint}</p>}
    </div>
  )
}

export const inputClass = [
  'w-full text-sm font-sans rounded-lg px-3 py-2.5',
  'bg-white border border-slate-200 text-slate-900',
  'placeholder-slate-300',
  'form-input',
  'transition-[border-color,box-shadow] duration-150',
].join(' ')

export const selectClass = [
  'w-full text-sm font-sans rounded-lg px-3 py-2.5',
  'bg-white border border-slate-200 text-slate-900',
  'form-select',
  'transition-[border-color,box-shadow] duration-150',
].join(' ')
