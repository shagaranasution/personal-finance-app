import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { transactions, TRANSACTIONS_PER_PAGE } from '@/features/transactions/data/transactions'
import { TransactionRow } from '@/features/transactions/components/transaction-row'
import { IconCaretDown, IconCaretLeft, IconCaretRight } from '@/shared/components/icons'
import { IconFilterMobile, IconSearch, IconSortMobile } from '@/shared/components/icons'
import {
  getVisibleTransactions,
  isTransactionCategory,
  isTransactionSort,
  transactionCategories,
  transactionSorts,
  type TransactionCategory,
  type TransactionSort,
} from '@/features/transactions/transaction-query'

const pageButtons = (currentPage: number, pageCount: number) => {
  const visiblePages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1])
  return [...visiblePages].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b)
}

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobilePanel, setMobilePanel] = useState<'sort' | 'category' | null>(null)
  const search = searchParams.get('search') ?? ''
  const categoryValue = searchParams.get('category')
  const category: TransactionCategory | null = isTransactionCategory(categoryValue)
    ? categoryValue
    : null
  const sortValue = searchParams.get('sort')
  const sort: TransactionSort = isTransactionSort(sortValue) ? sortValue : 'latest'
  const requestedPage = Number(searchParams.get('page') ?? '1')
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const filteredTransactions = useMemo(
    () => getVisibleTransactions(transactions, search, category, sort),
    [search, category, sort],
  )
  const pageCount = Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE)
  const safePage = Math.min(page, Math.max(pageCount, 1))
  const firstIndex = (safePage - 1) * TRANSACTIONS_PER_PAGE
  const pageTransactions = filteredTransactions.slice(
    firstIndex,
    firstIndex + TRANSACTIONS_PER_PAGE,
  )
  const firstRecord = filteredTransactions.length === 0 ? 0 : firstIndex + 1
  const lastRecord = Math.min(firstIndex + TRANSACTIONS_PER_PAGE, filteredTransactions.length)

  useEffect(() => {
    if (
      page !== safePage ||
      (categoryValue !== null && category === null) ||
      (sortValue !== null && sort !== sortValue)
    ) {
      const nextParams = new URLSearchParams(searchParams)
      if (safePage === 1) nextParams.delete('page')
      else nextParams.set('page', String(safePage))
      if (categoryValue !== null && category === null) nextParams.delete('category')
      if (sortValue !== null && sort !== sortValue) nextParams.delete('sort')
      setSearchParams(nextParams, { replace: true })
    }
  }, [category, categoryValue, page, safePage, searchParams, setSearchParams, sort, sortValue])

  const updateFilters = (updates: Record<string, string | null>, replace = false) => {
    const nextParams = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value) nextParams.set(key, value)
      else nextParams.delete(key)
    }
    nextParams.delete('page')
    setSearchParams(nextParams, { replace })
  }

  const changePage = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextPage === 1) nextParams.delete('page')
    else nextParams.set('page', String(nextPage))
    setSearchParams(nextParams)
  }

  const searchField = (
    <label className="flex h-[42px] min-w-0 flex-1 items-center gap-150 rounded-100 border border-beige-500 bg-white px-200 focus-within:border-grey-900">
      <span className="sr-only">Search transaction by name</span>
      <input
        className="min-w-0 flex-1 bg-transparent text-preset-4 text-grey-900 outline-none placeholder:text-beige-500"
        onChange={(event) => updateFilters({ search: event.target.value || null }, true)}
        placeholder="Search transaction"
        type="search"
        value={search}
      />
      <IconSearch aria-hidden="true" className="shrink-0" />
    </label>
  )

  const categorySelect = (id: string) => (
    <label className="flex min-w-0 justify-end items-center gap-100">
      <span className="text-preset-5 text-grey-500">Category</span>
      <span className="relative">
        <select
          aria-label="Filter by category"
          className="h-[42px] w-full appearance-none rounded-100 border border-beige-500 bg-white pl-200 pr-500 text-preset-4 text-grey-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
          id={id}
          onChange={(event) => updateFilters({ category: event.target.value || null })}
          value={category ?? ''}
        >
          <option value="">All Transactions</option>
          {transactionCategories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <IconCaretDown className="pointer-events-none absolute right-200 top-1/2 -translate-y-1/2" />
      </span>
    </label>
  )

  const sortSelect = (id: string) => (
    <label className="flex min-w-0 justify-end items-center gap-100">
      <span className="text-preset-5 text-grey-500">Sort by</span>
      <span className="relative">
        <select
          aria-label="Sort transactions"
          className="h-[42px] w-full appearance-none rounded-100 border border-beige-500 bg-white pl-200 pr-500 text-preset-4 text-grey-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
          id={id}
          onChange={(event) => updateFilters({ sort: event.target.value })}
          value={sort}
        >
          {transactionSorts.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <IconCaretDown className="pointer-events-none absolute right-200 top-1/2 -translate-y-1/2" />
      </span>
    </label>
  )

  return (
    <section aria-labelledby="page-title">
      <h1 className="text-preset-1">Transactions</h1>

      <Card className="mt-400 px-250 py-300 tablet:p-400">
        <p aria-live="polite" className="sr-only">
          Showing {firstRecord}–{lastRecord} of {filteredTransactions.length} transactions
        </p>

        <>
          <div className="mb-300 hidden w-full items-end gap-300 tablet:flex tablet:justify-between">
            <div className="w-full min-w-[161px] max-w-[320px]">{searchField}</div>
            <div className="flex">
              <div className="w-[170px]">{sortSelect('transaction-sort-desktop')}</div>
              <div className="w-[245px]">{categorySelect('transaction-category-desktop')}</div>
            </div>
          </div>
          <div className="mb-300 flex w-full items-center gap-300 tablet:hidden">
            {searchField}
            <button
              aria-expanded={mobilePanel === 'sort'}
              aria-label="Sort transactions"
              className="grid size-5 shrink-0 place-items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grey-900"
              onClick={() => setMobilePanel((current) => (current === 'sort' ? null : 'sort'))}
              type="button"
            >
              <IconSortMobile />
            </button>
            <button
              aria-expanded={mobilePanel === 'category'}
              aria-label="Filter transactions by category"
              className="grid size-5 shrink-0 place-items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grey-900"
              onClick={() =>
                setMobilePanel((current) => (current === 'category' ? null : 'category'))
              }
              type="button"
            >
              <IconFilterMobile />
            </button>
          </div>
          {mobilePanel && (
            <div className="mb-300 grid w-full grid-cols-1 gap-200 rounded-100 bg-beige-100 p-200 tablet:hidden">
              {mobilePanel === 'sort'
                ? sortSelect('transaction-sort-mobile')
                : categorySelect('transaction-category-mobile')}
            </div>
          )}

          {pageTransactions.length > 0 ? (
            <>
              <div
                aria-hidden="true"
                className="mb-250 hidden grid-cols-[minmax(0,1.7fr)_minmax(7rem,1fr)_minmax(8rem,1fr)_auto] gap-200 border-b border-grey-100 pb-150 text-preset-5 text-grey-500 tablet:grid"
              >
                <span>Recipient / Sender</span>
                <span>Category</span>
                <span>Transaction Date</span>
                <span className="text-right">Amount</span>
              </div>
              <ul aria-label="Transactions" className="list-none p-0">
                {pageTransactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </ul>

              <nav
                aria-label="Transaction pages"
                className="mt-300 flex items-center justify-between gap-100 pt-250 tablet:border-t tablet:border-grey-100"
              >
                <Button
                  aria-label="Previous page"
                  className="flex items-center gap-100 px-150 py-150 tablet:px-200"
                  disabled={safePage === 1}
                  onClick={() => changePage(Math.max(1, safePage - 1))}
                  variant="secondary"
                >
                  <IconCaretLeft aria-hidden="true" />
                  <span className="hidden tablet:inline">Prev</span>
                </Button>

                <ol className="flex list-none items-center gap-50 p-0">
                  {pageButtons(safePage, pageCount).map((pageNumber, index, pages) => (
                    <li className="flex items-center gap-50" key={pageNumber}>
                      {index > 0 && pages[index - 1] < pageNumber - 1 && (
                        <span aria-hidden="true" className="px-50 text-grey-500">
                          …
                        </span>
                      )}
                      <button
                        aria-current={pageNumber === safePage ? 'page' : undefined}
                        aria-label={`Page ${pageNumber}`}
                        className={[
                          'size-9 rounded-100 text-preset-5-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900',
                          pageNumber === safePage
                            ? 'bg-grey-900 text-white'
                            : 'text-grey-900 hover:bg-beige-100',
                        ].join(' ')}
                        onClick={() => changePage(pageNumber)}
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
                  disabled={safePage === pageCount}
                  onClick={() => changePage(Math.min(pageCount, safePage + 1))}
                  variant="secondary"
                >
                  <span className="hidden tablet:inline">Next</span>
                  <IconCaretRight aria-hidden="true" />
                </Button>
              </nav>
            </>
          ) : (
            <div className="rounded-100 bg-beige-100 px-200 py-500 text-center">
              <p className="text-preset-3">No matching transactions</p>
              <p className="mt-100 text-preset-4 text-grey-500">
                Try changing your search or category filter.
              </p>
              {(search || category) && (
                <Button
                  className="mt-200"
                  onClick={() => updateFilters({ search: null, category: null, sort: 'latest' })}
                  variant="secondary"
                >
                  Clear search and filters
                </Button>
              )}
            </div>
          )}
        </>
      </Card>
    </section>
  )
}
