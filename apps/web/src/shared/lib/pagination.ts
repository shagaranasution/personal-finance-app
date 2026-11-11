export const DEFAULT_PAGE_SIZE = 10

export interface PaginationResult<Item> {
  items: Item[]
  page: number
  pageCount: number
  firstItem: number
  lastItem: number
  totalItems: number
}

/** Slice an already filtered and sorted collection into a safe, one-based page. */
export function paginateItems<Item>(
  source: readonly Item[],
  requestedPage: number,
  pageSize = DEFAULT_PAGE_SIZE,
): PaginationResult<Item> {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('Page size must be a positive integer')
  }

  const pageCount = Math.ceil(source.length / pageSize)
  const validRequestedPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const page = Math.min(validRequestedPage, Math.max(pageCount, 1))
  const startIndex = (page - 1) * pageSize
  const items = source.slice(startIndex, startIndex + pageSize)

  return {
    items,
    page,
    pageCount,
    firstItem: source.length === 0 ? 0 : startIndex + 1,
    lastItem: Math.min(startIndex + pageSize, source.length),
    totalItems: source.length,
  }
}

/** Return the first, last, and neighboring page numbers for a compact control. */
export function getPaginationPageNumbers(currentPage: number, pageCount: number): number[] {
  const safePageCount = Math.max(1, Math.floor(pageCount))
  const safeCurrentPage = Math.min(Math.max(1, Math.floor(currentPage)), safePageCount)
  const visiblePages = new Set([
    1,
    safePageCount,
    safeCurrentPage - 1,
    safeCurrentPage,
    safeCurrentPage + 1,
  ])

  return [...visiblePages]
    .filter((page) => page >= 1 && page <= safePageCount)
    .sort((a, b) => a - b)
}
