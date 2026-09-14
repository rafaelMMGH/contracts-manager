import type { SVGProps } from 'react'

/** Lucide `building-complex-plus` (not yet in project lucide-react 1.14). */
export default function BuildingComplexPlus({
  className,
  strokeWidth = 2,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M10 12h4" />
      <path d="M10 21v-3a2 2 0 013.05-1.702" />
      <path d="M10 8h4" />
      <path d="M16 19h6" />
      <path d="M18 7h2a2 2 0 012 2v4.355" />
      <path d="M19 16v6" />
      <path d="M6 10H4a2 2 0 00-2 2v7a2 2 0 002 2h8.535" />
      <path d="M6 21V5a2 2 0 012-2h8a2 2 0 012 2v7.126" />
    </svg>
  )
}
