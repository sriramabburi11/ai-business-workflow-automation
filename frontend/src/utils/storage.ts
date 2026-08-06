export const getTenantStorageData = (prefix: string, user: any): any[] => {
  if (!user || !user.email) return [];
  const cleanEmail = user.email.toLowerCase().replace(/[^a-z0-9]/g, '');
  const primaryKey = `${prefix}_${cleanEmail}`;
  const itemsMap = new Map<string, any>();

  // 1. Read primary email-isolated key
  try {
    const raw = localStorage.getItem(primaryKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) parsed.forEach(i => i && i.id && itemsMap.set(i.id, i));
    }
  } catch (e) {}

  // 2. Read secondary organizationId key ONLY if strictly belonging to current user
  if (user.organizationId && user.organizationId !== 'demo-org-123') {
    try {
      const raw = localStorage.getItem(`${prefix}_${user.organizationId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach(i => {
            if (i && i.id) {
              if (i.createdBy === user.id || i.organizationId === user.organizationId) {
                if (!itemsMap.has(i.id)) {
                  itemsMap.set(i.id, i);
                }
              }
            }
          });
        }
      }
    } catch (e) {}
  }

  return Array.from(itemsMap.values());
};

export const saveTenantStorageData = (prefix: string, user: any, item: any) => {
  if (!user || !user.email || !item || !item.id) return;
  const cleanEmail = user.email.toLowerCase().replace(/[^a-z0-9]/g, '');
  const primaryKey = `${prefix}_${cleanEmail}`;

  const existing = getTenantStorageData(prefix, user);
  const updated = [{ ...item, createdBy: user.id, organizationId: user.organizationId }, ...existing.filter((i: any) => i.id !== item.id)];

  try {
    localStorage.setItem(primaryKey, JSON.stringify(updated));
    if (user.organizationId && user.organizationId !== 'demo-org-123') {
      localStorage.setItem(`${prefix}_${user.organizationId}`, JSON.stringify(updated));
    }
  } catch (e) {}
};
