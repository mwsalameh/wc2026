const SIZE_MAP = { sm: 40, md: 64, lg: 96 } as const;

export const getFlagUrl = (
  countryCode: string,
  size: 'sm' | 'md' | 'lg' = 'md',
): string => {
  if (!countryCode) return '';
  const w = SIZE_MAP[size];
  return `https://flagcdn.com/w${w}/${countryCode.toLowerCase()}.png`;
};
