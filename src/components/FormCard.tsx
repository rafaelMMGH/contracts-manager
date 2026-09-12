interface Props {
  title: string
  description?: string
  children: React.ReactNode
}

export default function FormCard({ title, description, children }: Props) {
  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h3 className="text-xl font-semibold tracking-tight text-text-primary text-balance">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 max-w-[65ch] text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-card">
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
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-600">
        {label}
        {!required ? (
          <span className="ml-1.5 font-normal text-slate-400">(opcional)</span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-slate-400">{hint}</p> : null}
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
