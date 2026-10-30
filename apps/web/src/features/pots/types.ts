export interface Pot {
  id: string
  name: string
  theme: string
  /** Whole IDR, already adapted. Never apply fixture scaling here. */
  total: number
  target: number
}
