import { Button } from './button'
import { IconCaretLeft, IconCaretRight } from '../components/icons'
import { getPaginationPageNumbers } from '../lib/pagination'

interface PaginationProps {
  page: number
  pageCount: number
  label: string
  onPageChange: (page: number) => void
}

/** Shared responsive page controls. The parent owns page state and URL policy. */
export function Pagination({ page, pageCount, label, onPageChange }: PaginationProps) {
  const pages = getPaginationPageNumbers(page, pageCount)

  return (
    <nav
      aria-label={`${label} pages`}
      className="mt-300 flex items-center justify-between gap-100 pt-250 tablet:border-t tablet:border-grey-100"
    >
      <Button
        aria-label="Previous page"
        className="flex items-center gap-100 px-150 py-150 tablet:px-200"
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        variant="secondary"
      >
        <IconCaretLeft aria-hidden="true" />
        <span className="hidden tablet:inline">Prev</span>
      </Button>

      <ol className="flex list-none items-center gap-50 p-0">
        {pages.map((pageNumber, index) => (
          <li className="flex items-center gap-50" key={pageNumber}>
            {index > 0 && pages[index - 1] < pageNumber - 1 && (
              <span aria-hidden="true" className="px-50 text-grey-500">
                …
              </span>
            )}
            <button
              aria-current={pageNumber === page ? 'page' : undefined}
              aria-label={`Page ${pageNumber}`}
              className={[
                'size-9 rounded-100 text-preset-5-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900',
                pageNumber === page ? 'bg-grey-900 text-white' : 'text-grey-900 hover:bg-beige-100',
              ].join(' ')}
              onClick={() => onPageChange(pageNumber)}
              type="button"
            >
              {pageNumber}
            </button>
          </li>
        ))}
      </ol>

      <Button
        aria-label="Next page"
        className="flex items-center gap-100 px-150 py-150 tablet:px-200"
        disabled={page === pageCount}
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        variant="secondary"
      >
        <span className="hidden tablet:inline">Next</span>
        <IconCaretRight aria-hidden="true" />
      </Button>
    </nav>
  )
}
