export const getTenantStorageData = (prefix: string, user: any): any[] => {
  if (!user) return [];
  const cleanEmail = (user.email || 'demo').toLowerCase().replace(/[^a-z0-9]/g, '');
  const primaryKey = `${prefix}_${cleanEmail}`;
  const itemsMap = new Map<string, any>();

  // 1. Read primary deterministic email key
  try {
    const raw = localStorage.getItem(primaryKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) parsed.forEach(i => i && i.id && itemsMap.set(i.id, i));
    }
  } catch (e) {}

  // 2. Read secondary organizationId key if different
  if (user.organizationId) {
    try {
      const raw = localStorage.getItem(`${prefix}_${user.organizationId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) parsed.forEach(i => i && i.id && itemsMap.set(i.id, i));
      }
    } catch (e) {}
  }

  // 3. Scan all keys in localStorage starting with prefix to ensure 0 lost data
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item && item.id) {
                if (!itemsMap.has(item.id)) {
                  itemsMap.set(item.id, item);
                }
              }
            });
          }
        }
      }
    }
  } catch (e) {}

  const merged = Array.from(itemsMap.values());
  // Synchronize back to primary key
  try {
    localStorage.setItem(primaryKey, JSON.stringify(merged));
  } catch (e) {}

  return merged;
};

export const saveTenantStorageData = (prefix: string, user: any, item: any) => {
  if (!user || !item || !item.id) return;
  const existing = getTenantStorageData(prefix, user);
  const updated = [item, ...existing.filter((i: any) => i.id !== item.id)];
  
  const cleanEmail = (user.email || 'demo').toLowerCase().replace(/[^a-z0-9]/g, '');
  const primaryKey = `${prefix}_${cleanEmail}`;

  try {
    localStorage.setItem(primaryKey, JSON.stringify(updated));
    if (user.organizationId) {
      localStorage.setItem(`${prefix}_${user.organizationId}`, JSON.stringify(updated));
    }
  } catch (e) {}
};
