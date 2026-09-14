'use client'

import {
  useEffect,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
} from 'react'
import { formatPhoneXxxXxxXxxx } from '@/lib/phone'
import { cn } from '@/lib/utils'

type PhoneInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> & {
  defaultValue?: string | null
  value?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

/**
 * Tel input that keeps `xxx-xxx-xxxx` formatting while typing.
 * Works uncontrolled (name + defaultValue) or controlled (value + onChange).
 */
export default function PhoneInput({
  className,
  defaultValue = '',
  value: controlledValue,
  onChange,
  placeholder = '961-000-0000',
  inputMode = 'numeric',
  autoComplete = 'tel',
  ...props
}: PhoneInputProps) {
  const isControlled = controlledValue !== undefined
  const [uncontrolled, setUncontrolled] = useState(() =>
    formatPhoneXxxXxxXxxx(defaultValue ?? '')
  )

  useEffect(() => {
    if (isControlled) return
    setUncontrolled(formatPhoneXxxXxxXxxx(defaultValue ?? ''))
  }, [defaultValue, isControlled])

  const display = isControlled
    ? formatPhoneXxxXxxXxxx(controlledValue)
    : uncontrolled

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhoneXxxXxxXxxx(e.target.value)
    if (!isControlled) setUncontrolled(formatted)
    if (onChange) {
      const next = {
        ...e,
        target: { ...e.target, value: formatted },
        currentTarget: { ...e.currentTarget, value: formatted },
      } as ChangeEvent<HTMLInputElement>
      onChange(next)
    }
  }

  return (
    <input
      {...props}
      type="tel"
      inputMode={inputMode}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className={cn(className)}
      value={display}
      onChange={handleChange}
      maxLength={12}
    />
  )
}
