export interface Transaction {
  id: string
  avatar: string
  name: string
  category: string
  date: string
  /** Signed integer rupiah (IDR). */
  amount: number
  recurring: boolean
}
