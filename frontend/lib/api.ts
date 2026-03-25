// lib/api.ts
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebase';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const entityToCollection: { [key: string]: string } = {
  Agendamento: 'agendamentos',
  Cliente: 'clientes',
  Animal: 'animais',
  VacinaHistorico: 'vacinas_historico',
  Despesa: 'despesas',
  Produto: 'produtos',
  Profissional: 'profissionais',
  Venda: 'vendas',
  Internacao: 'internacoes',
  RegistroProntuario: 'prontuarios',
  Orcamento: 'orcamentos',
  Procedimento: 'procedimentos',
  TarefaVeterinaria: 'tarefas',
  Anamnese: 'anamneses',
  Termo: 'termos',
  ModeloReceita: 'modelos_receita',
  Medicamento: 'medicamentos',
  Receita: 'receitas',
  ProdutoVariante: 'produto_variantes',
  MovimentacaoEstoque: 'movimentacoes_estoque',
  Notificacao: 'notificacoes',
  Campanha: 'campanhas',
  Promocao: 'promocoes',
  Escala: 'escalas',
};

const createEntityApi = (entityName: string) => {
  const collectionName = entityToCollection[entityName] || entityName.toLowerCase();
  
  return {
    list: async (sort?: string): Promise<any[]> => {
      try {
        let q = query(collection(db, collectionName));
        if (sort) {
          const field = sort.startsWith('-') ? sort.substring(1) : sort;
          const direction = sort.startsWith('-') ? 'desc' : 'asc';
          q = query(q, orderBy(field, direction));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, collectionName);
      }
    },
    filter: async (filters: any, sort?: string): Promise<any[]> => {
      try {
        let q = query(collection(db, collectionName));
        for (const key in filters) {
          q = query(q, where(key, '==', filters[key]));
        }
        if (sort) {
          const field = sort.startsWith('-') ? sort.substring(1) : sort;
          const direction = sort.startsWith('-') ? 'desc' : 'asc';
          q = query(q, orderBy(field, direction));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, collectionName);
      }
    },
    get: async (id: string): Promise<any> => {
      try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `${collectionName}/${id}`);
      }
    },
    create: async (payload: any): Promise<any> => {
      try {
        const data = { 
          ...payload, 
          created_date: new Date().toISOString(),
          server_timestamp: serverTimestamp() 
        };
        const docRef = await addDoc(collection(db, collectionName), data);
        return { id: docRef.id, ...data };
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, collectionName);
      }
    },
    bulkCreate: async (payloads: any[]): Promise<any[]> => {
      // For simplicity, we'll just loop. In a real app, use writeBatch
      const results = [];
      for (const p of payloads) {
        results.push(await api.entities[entityName as keyof typeof api.entities].create(p));
      }
      return results;
    },
    update: async (id: string, payload: any): Promise<any> => {
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, payload);
        const updatedDoc = await getDoc(docRef);
        return { id: updatedDoc.id, ...updatedDoc.data() };
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
      }
    },
    delete: async (id: string): Promise<boolean> => {
      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
      }
    }
  };
};

export const api = {
  entities: {
    Agendamento: createEntityApi('Agendamento'),
    Cliente: createEntityApi('Cliente'),
    Animal: createEntityApi('Animal'),
    VacinaHistorico: createEntityApi('VacinaHistorico'),
    Despesa: createEntityApi('Despesa'),
    Produto: createEntityApi('Produto'),
    Profissional: createEntityApi('Profissional'),
    Venda: createEntityApi('Venda'),
    Internacao: createEntityApi('Internacao'),
    RegistroProntuario: createEntityApi('RegistroProntuario'),
    Orcamento: createEntityApi('Orcamento'),
    Procedimento: createEntityApi('Procedimento'),
    TarefaVeterinaria: createEntityApi('TarefaVeterinaria'),
    Anamnese: createEntityApi('Anamnese'),
    Termo: createEntityApi('Termo'),
    ModeloReceita: createEntityApi('ModeloReceita'),
    Medicamento: createEntityApi('Medicamento'),
    Receita: createEntityApi('Receita'),
    ProdutoVariante: createEntityApi('ProdutoVariante'),
    MovimentacaoEstoque: createEntityApi('MovimentacaoEstoque'),
    Notificacao: createEntityApi('Notificacao'),
    Campanha: createEntityApi('Campanha'),
    Promocao: createEntityApi('Promocao'),
    Escala: createEntityApi('Escala'),
  },
  integrations: {
    Core: {
      SendEmail: async (payload: any) => { console.log("Mock SendEmail", payload); return true; },
      InvokeLLM: async (payload: any) => { 
        console.log("Mock InvokeLLM", payload); 
        return { previsao: Math.floor(Math.random() * 50) + 10 }; 
      },
      UploadFile: async (payload: any) => {
        return { file_url: "https://picsum.photos/200" };
      }
    }
  },
  auth: {
    isAuthenticated: async () => auth.currentUser !== null,
    me: async () => {
      if (!auth.currentUser) return null;
      return { 
        id: auth.currentUser.uid, 
        name: auth.currentUser.displayName || 'User', 
        email: auth.currentUser.email,
        role: 'admin' // Defaulting to admin for now
      };
    }
  }
};

// Validate connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();
