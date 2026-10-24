import { useState } from 'react'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { transactions, TRANSACTIONS_PER_PAGE } from '@/features/transactions/data/transactions'
import { TransactionRow } from '@/features/transactions/components/transaction-row'
import { IconCaretLeft, IconCaretRight } from '@/shared/components/icons'

const pageButtons = (currentPage: number, pageCount: number) => {
  const visiblePages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1])
  return [...visiblePages].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b)
}

export function TransactionsPage() {
  const [page, setPage] = useState(1)
  const pageCount = Math.ceil(transactions.length / TRANSACTIONS_PER_PAGE)
  const firstIndex = (page - 1) * TRANSACTIONS_PER_PAGE
  const pageTransactions = transactions.slice(firstIndex, firstIndex + TRANSACTIONS_PER_PAGE)
  const firstRecord = transactions.length === 0 ? 0 : firstIndex + 1
  const lastRecord = Math.min(firstIndex + TRANSACTIONS_PER_PAGE, transactions.length)

  return (
    <section aria-labelledby="page-title">
      <h1 className="text-preset-1">Transactions</h1>

      <Card className="mt-400">
        <p aria-live="polite" className="mb-300 text-preset-4 text-grey-500">
          Showing {firstRecord}–{lastRecord} of {transactions.length} transactions
        </p>

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
              className="mt-300 flex items-center justify-between gap-100 border-t border-grey-100 pt-250"
            >
              <Button
                aria-label="Previous page"
                className="flex items-center gap-100 px-150 py-150 tablet:px-200"
                disabled={page === 1}
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                variant="secondary"
              >
                <IconCaretLeft aria-hidden="true" />
                <span className="hidden tablet:inline">Prev</span>
              </Button>

              <ol className="flex list-none items-center gap-50 p-0">
                {pageButtons(page, pageCount).map((pageNumber, index, pages) => (
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
                        pageNumber === page
                          ? 'bg-grey-900 text-white'
                          : 'text-grey-900 hover:bg-beige-100',
                      ].join(' ')}
                      onClick={() => setPage(pageNumber)}
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
                onClick={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
                variant="secondary"
              >
                <span className="hidden tablet:inline">Next</span>
                <IconCaretRight aria-hidden="true" />
              </Button>
            </nav>
          </>
        ) : (
          <div className="rounded-100 bg-beige-100 px-200 py-500 text-center">
            <p className="text-preset-3">No transactions yet</p>
            <p className="mt-100 text-preset-4 text-grey-500">
              Your transactions will appear here when they are available.
            </p>
          </div>
        )}
      </Card>
    </section>
  )
}
