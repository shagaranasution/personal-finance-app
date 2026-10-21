import { Button } from '@/shared/ui/button'
import { IconSearch } from '@/shared/components/icons/IconSearch'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

export default function App() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-preset-5">Personal Finance App</h1>
      <h1 className="text-preset-5-bold">Personal Finance App</h1>
      <p className="mt-4 text-beige-500 text-base">Frontend workspace ready.</p>
      <p className="mt-4 text-navy-grey text-base">Frontend workspace ready.</p>
      <p className="mt-4 text-base">Frontend workspace ready.</p>
      <div>
        <p>Button Demo</p>
        <div>
          <p>Primary:</p>
          <Button>Primary</Button>
        </div>

        <p>Button Demo</p>
        <div>
          <p>Secondary:</p>
          <Button variant="secondary">Secondary</Button>
        </div>

        <div>
          <p>Tertiary:</p>
          <Button variant="tertiary">Tertiary</Button>
        </div>

        <div>
          <p>Destroy:</p>
          <Button variant="destroy">Destroy</Button>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-preset-3">Input demo</h2>
        <div className="mt-4 grid gap-6">
          <Input
            containerClassName="max-w-80"
            label="Basic Field"
            helperText="Helper text"
            placeholder="Placeholder"
          />
          <Input
            containerClassName="max-w-80"
            label="Field With Prefix"
            helperText="Helper text"
            placeholder="Placeholder"
            prefix="$"
          />
          <Input
            colorTag="var(--color-green)"
            containerClassName="max-w-80"
            label="Field With Color Tag"
            helperText="Helper text"
            placeholder="Placeholder"
          />
          <Input
            containerClassName="max-w-80"
            label="Field With Icon"
            helperText="Helper text"
            placeholder="Placeholder"
            trailingIcon={<IconSearch />}
          />
          <Input
            containerClassName="max-w-80"
            error="Enter a valid amount."
            label="Field With Validation"
            placeholder="Placeholder"
          />
          <Input
            containerClassName="max-w-80"
            disabled
            label="Disabled Field"
            placeholder="Placeholder"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-preset-3">Card demo</h2>
        <Card className="mt-4 max-w-152">
          <h3 className="text-preset-2 text-grey-900">Card title</h3>
          <p className="mt-150 text-preset-4 text-grey-500">
            Mobile padding is 20 by 24 pixels; tablet and desktop use 32 pixels on every side.
          </p>
        </Card>
      </section>
    </main>
  )
}
