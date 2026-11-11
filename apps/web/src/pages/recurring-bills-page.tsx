import { useMemo, useRef, useState } from 'react'
import { IconSearch, IconSortMobile } from '@/shared/components/icons'
import { RecurringBillRow } from '@/features/recurring-bills/components/recurring-bill-row'
import {
  RecurringBillSummaryCard,
  RecurringBillTotalCard,
} from '@/features/recurring-bills/components/recurring-bill-summary'
import {
  calculateRecurringBills,
  DEMO_RECURRING_BILL_CONTEXT,
} from '@/features/recurring-bills/recurring-bill-calculation'
import {
  getRecurringBillSummary,
  getVisibleRecurringBills,
  recurringBillSorts,
  type RecurringBillSort,
} from '@/features/recurring-bills/recurring-bill-query'
import { transactions } from '@/features/transactions/data/transactions'
import { paginateItems } from '@/shared/lib/pagination'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { DropdownSelect } from '@/shared/ui/dropdown-select'
import { Pagination } from '@/shared/ui/pagination'
import { formatRupiah } from '@/shared/lib/money'

const recurringBills = calculateRecurringBills(transactions, DEMO_RECURRING_BILL_CONTEXT)
const summary = getRecurringBillSummary(recurringBills)
const avatarByTransactionId = new Map(
  transactions.map((transaction) => [transaction.id, transaction.avatar]),
)

export function RecurringBillsPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<RecurringBillSort>('latest')
  const [page, setPage] = useState(1)
  const desktopSortButton = useRef<HTMLButtonElement>(null)
  const mobileSortButton = useRef<HTMLButtonElement>(null)
  const visibleBills = useMemo(
    () => getVisibleRecurringBills(recurringBills, search, sort),
    [search, sort],
  )
  const paginatedBills = paginateItems(visibleBills, page)

  const updateSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const updateSort = (value: string) => {
    setSort(value as RecurringBillSort)
    setPage(1)
  }

  const searchField = (
    <label className="flex h-[42px] min-w-0 flex-1 items-center gap-150 rounded-100 border border-beige-500 bg-white px-200 focus-within:border-grey-900">
      <span className="sr-only">Search bills by vendor</span>
      <input
        className="min-w-0 flex-1 bg-transparent text-preset-4 text-grey-900 outline-none placeholder:text-beige-500"
        onChange={(event) => updateSearch(event.target.value)}
        placeholder="Search bills"
        type="search"
        value={search}
      />
      <IconSearch aria-hidden="true" className="shrink-0" />
    </label>
  )

  const desktopSort = (
    <DropdownSelect
      className="w-[220px] shrink-0"
      label="Sort by"
      labelPosition="inline"
      value={sort}
      options={recurringBillSorts}
      buttonRef={desktopSortButton}
      buttonClassName="h-[42px] min-w-[132px] px-200"
      menuPosition="below"
      portalMenu
      menuClassName="min-w-[160px]"
      onChange={updateSort}
    />
  )

  const mobileSort = (
    <DropdownSelect
      label="Sort by"
      labelClassName="sr-only"
      value={sort}
      options={recurringBillSorts}
      buttonRef={mobileSortButton}
      buttonClassName="!size-8 !min-h-8 !border-0 !p-0 !justify-center"
      className="shrink-0"
      menuPosition="below"
      menuClassName="min-w-[160px]"
      portalMenu
      portalMenuWidth={160}
      portalMenuAlign="end"
      showCaret={false}
      renderValue={() => <IconSortMobile aria-hidden="true" />}
      onChange={updateSort}
    />
  )

  return (
    <section aria-labelledby="recurring-bills-title">
      <h1 className="text-preset-1" id="recurring-bills-title">
        Recurring Bills
      </h1>

      <div className="mt-400 grid grid-cols-1 items-start gap-300 tablet:grid-cols-2 desktop:grid-cols-[minmax(0,0.8fr)_minmax(0,1.7fr)]">
        <div className="grid gap-300 tablet:col-span-2 tablet:grid-cols-2 desktop:col-span-1 desktop:grid-cols-1">
          <RecurringBillTotalCard totalBills={summary.totalBills} />
          <RecurringBillSummaryCard summary={summary} />
        </div>

        <Card padding="compact" className="min-w-0 tablet:col-span-2 desktop:col-span-1">
          <div className="mb-300 hidden items-center justify-between gap-300 tablet:flex">
            <div className="w-full max-w-[320px]">{searchField}</div>
            {desktopSort}
          </div>

          <div className="mb-300 flex items-center gap-200 tablet:hidden">
            {searchField}
            {mobileSort}
          </div>

          {paginatedBills.totalItems > 0 ? (
            <>
              <div
                aria-hidden="true"
                className="mb-150 hidden grid-cols-[minmax(0,1.5fr)_minmax(8rem,1fr)_auto] gap-200 border-b border-grey-100 pb-150 text-preset-5 text-grey-500 tablet:grid"
              >
                <span>Bill Title</span>
                <span>Due Date</span>
                <span className="text-right">Amount</span>
              </div>
              <ul aria-label="Recurring bills" className="list-none p-0">
                {paginatedBills.items.map((bill) => (
                  <RecurringBillRow
                    key={bill.vendorId}
                    bill={bill}
                    avatar={avatarByTransactionId.get(bill.canonicalTransactionId)}
                  />
                ))}
              </ul>
              <Pagination
                label="Recurring bill"
                page={paginatedBills.page}
                pageCount={paginatedBills.pageCount}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="rounded-100 bg-beige-100 px-200 py-500 text-center">
              <p className="text-preset-3">
                {recurringBills.length === 0 ? 'No recurring bills yet' : 'No matching bills'}
              </p>
              <p className="mt-100 text-preset-4 text-grey-500">
                {recurringBills.length === 0
                  ? 'Recurring bills will appear here when they are available.'
                  : 'Try a different vendor name or clear your search.'}
              </p>
              {search && (
                <Button className="mt-200" onClick={() => setSearch('')} variant="secondary">
                  Clear search
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      <p className="sr-only" aria-live="polite" role="status">
        Showing {paginatedBills.firstItem}–{paginatedBills.lastItem} of {paginatedBills.totalItems}{' '}
        recurring bills on page {paginatedBills.page} of {paginatedBills.pageCount}. Sorted by{' '}
        {recurringBillSorts.find((option) => option.value === sort)?.label}. Total across all{' '}
        {recurringBills.length} bills: {formatRupiah(summary.totalBills.amount)}.
      </p>
    </section>
  )
}
