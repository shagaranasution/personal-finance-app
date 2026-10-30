# Project conventions

- Core currency: **IDR (Indonesian rupiah)**. Store and calculate whole rupiah as bounded integers; do not introduce cents, fractional rupiah, USD formatting, or exchange-rate conversion.
- Format monetary UI values with `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })`.
- App fixtures use the approved fixed scaling of original challenge amounts × 1,000. Apply this once during adaptation, never again at runtime. Original challenge materials remain reference inputs. See `docs/currency.md` and the tracked README for the full contract.
- Keep owner selection server-side. The fixed demo owner is temporary local-development infrastructure, not authentication. Never accept a client-supplied owner as authorization.
- Preserve SQL migration history and database constraints; do not use `db push` to bypass migrations.
- Keep changes focused on the active FIN. Include a learning walkthrough with recommended file-reading order and explanations of new concepts.

- For UI work, inspect the relevant Figma layouts and page states before implementation. Match the design precisely while preserving IDR rules; where a state is absent, follow the existing design’s visual and interaction patterns.
