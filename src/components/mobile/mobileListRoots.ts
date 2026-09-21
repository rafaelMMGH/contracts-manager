/** Mobile list/home routes that show AppHeaderBar and hide PageHeader. */
const MOBILE_LIST_ROOTS = new Set(['/', '/tenants', '/owners', '/houses'])

export function isMobileListRoot(pathname: string): boolean {
  return MOBILE_LIST_ROOTS.has(pathname)
}
