const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = (entity: string) => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`vet_app_${entity}`);
  return data ? JSON.parse(data) : [];
};

const setStorage = (entity: string, data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`vet_app_${entity}`, JSON.stringify(data));
};

interface EntityActions {
  list: (sort?: string) => Promise<any[]>;
  filter: (query: any) => Promise<any[]>;
  get: (id: string) => Promise<any>;
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  delete: (id: string) => Promise<any>;
}

const createEntityProxy = () => {
  return new Proxy({} as Record<string, EntityActions>, {
    get: (_, prop) => {
      const entity = prop.toString();
      return {
        list: async (sort?: string) => { 
          await delay(100); 
          let data = getStorage(entity);
          if (sort) {
            const isDesc = sort.startsWith('-');
            const field = isDesc ? sort.substring(1) : sort;
            data.sort((a: any, b: any) => {
              if (a[field] < b[field]) return isDesc ? 1 : -1;
              if (a[field] > b[field]) return isDesc ? -1 : 1;
              return 0;
            });
          }
          return data; 
        },
        filter: async (query: any) => { 
          await delay(100); 
          const data = getStorage(entity);
          return data.filter((item: any) => {
            for (const key in query) {
              if (item[key] !== query[key]) return false;
            }
            return true;
          });
        },
        get: async (id: string) => { 
          await delay(100); 
          return getStorage(entity).find((i: any) => i.id === id); 
        },
        create: async (data: any) => { 
          await delay(100); 
          const items = getStorage(entity);
          const newItem = { ...data, id: crypto.randomUUID(), created_date: new Date().toISOString() };
          setStorage(entity, [...items, newItem]);
          return newItem;
        },
        update: async (id: string, data: any) => {
          await delay(100);
          const items = getStorage(entity);
          const index = items.findIndex((i: any) => i.id === id);
          if (index > -1) {
            items[index] = { ...items[index], ...data };
            setStorage(entity, items);
            return items[index];
          }
          throw new Error('Not found');
        },
        delete: async (id: string) => {
          await delay(100);
          const items = getStorage(entity);
          setStorage(entity, items.filter((i: any) => i.id !== id));
          return { success: true };
        }
      }
    }
  });
};

const db = {
  auth: {
    isAuthenticated: async () => true,
    me: async () => ({ id: '1', name: 'Admin', role: 'Administrador' })
  },
  entities: createEntityProxy(),
  integrations: {
    Core: {
      UploadFile: async (data: any) => ({ file_url: '' }),
      SendEmail: async (data: any) => ({ success: true }),
      InvokeLLM: async (data: any) => ({ previsao: Math.floor(Math.random() * 50) + 10 })
    }
  }
};

export default db;
