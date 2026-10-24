import { Link } from 'react-router'
import { Card } from '@/shared/ui/card'

export function NotFoundPage() {
  return (
    <section aria-labelledby="page-title">
      <h1 className="text-preset-1" id="page-title">
        Page not found
      </h1>
      <Card className="mt-400 max-w-152">
        <p className="text-preset-4 text-grey-500">The page you requested does not exist.</p>
        <Link
          className="mt-200 inline-flex text-preset-4-bold text-grey-900 underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-grey-900"
          to="/"
        >
          Return to Overview
        </Link>
      </Card>
    </section>
  )
}
