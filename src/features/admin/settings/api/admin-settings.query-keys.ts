export const adminSettingsQueryKeys = {
  all: ['admin-settings'] as const,
  overview: () => [...adminSettingsQueryKeys.all, 'overview'] as const,
}
