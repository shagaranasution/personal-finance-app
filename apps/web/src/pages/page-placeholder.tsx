import { Card } from '@/shared/ui/card'

interface PagePlaceholderProps {
  title: string
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <section aria-labelledby="page-title">
      <h1 className="text-preset-1" id="page-title">
        {title}
      </h1>
      <Card className="mt-400 max-w-152">
        <p className="text-preset-4 text-grey-500">
          This page is ready for its feature implementation.
        </p>
      </Card>
    </section>
  )
}
