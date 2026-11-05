export interface ThemeOption {
  value: string
  label: string
}

/** Canonical palette shared by budgets and pots. Availability is feature-specific. */
export const themeOptions = [
  { value: '#277C78', label: 'Green' },
  { value: '#F2CDAC', label: 'Yellow' },
  { value: '#82C9D7', label: 'Cyan' },
  { value: '#626070', label: 'Navy' },
  { value: '#C94736', label: 'Red' },
  { value: '#826CB0', label: 'Purple' },
  { value: '#597C7C', label: 'Turquoise' },
  { value: '#93674F', label: 'Brown' },
  { value: '#934F6F', label: 'Magenta' },
  { value: '#3F82B2', label: 'Blue' },
  { value: '#97A0AC', label: 'Navy Grey' },
  { value: '#7F9161', label: 'Army Green' },
  { value: '#AF81BA', label: 'Pink' },
  { value: '#CAB361', label: 'Gold' },
  { value: '#BE6C49', label: 'Orange' },
] as const satisfies readonly ThemeOption[]
