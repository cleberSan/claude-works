---
resumo: Estado de ilha React guardado no localStorage com leitura defensiva e useSyncExternalStore, sem biblioteca de estado, como o Montar pedido da lojinha.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/lojinha-da-lua/blob/main/src/islands/useStoredOrder.ts
  - https://github.com/cleberSan/lojinha-da-lua/blob/main/src/domain/order-storage.ts
  - https://github.com/cleberSan/lojinha-da-lua/blob/main/docs/adr/0006-montar-pedido-no-navegador.md
---

# Estado no localStorage

Uma fonte de verdade (o `localStorage`), regras puras fora do React, tela que sabe quando o armazenamento não existe.

## Acesso que nunca lança

```ts
export const ORDER_STORAGE_KEY = "lojinha-da-lua:pedido";
export type OrderStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** undefined no build ou quando o navegador bloqueia dados de sites (só acessar já lança). */
export function getBrowserStorage(): OrderStorage | undefined {
  try { return globalThis.localStorage ?? undefined; } catch { return undefined; }
}

/** Texto salvo, null se não houver, undefined se indisponível. */
export function readStoredOrder(storage: OrderStorage | undefined): string | null | undefined {
  if (!storage) return undefined;
  try { return storage.getItem(ORDER_STORAGE_KEY); } catch { return undefined; }
}

/** Pedido vazio apaga a chave. false quando o navegador não deixa gravar (cota, modo privado). */
export function saveOrder(storage: OrderStorage | undefined, items: readonly OrderItem[]): boolean {
  if (!storage) return false;
  try {
    if (items.length === 0) storage.removeItem(ORDER_STORAGE_KEY);
    else storage.setItem(ORDER_STORAGE_KEY, serializeOrder(items));
    return true;
  } catch { return false; }
}
```

## Leitura defensiva

```ts
export function parseStoredOrder(raw: string | null, catalog: OrderCatalog): StoredOrder {
  const empty: StoredOrder = { items: [], dropped: 0 };
  if (raw === null || raw.length > MAX_STORED_LENGTH) return empty;     // 10 mil caracteres
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return empty; }
  if (!isRecord(data) || data["version"] !== STORED_VERSION || !Array.isArray(data["items"])) return empty;

  let items: OrderItem[] = [];
  let dropped = 0;
  for (const entry of data["items"]) {
    const item = toOrderItem(entry);                        // tipos, quantidade 1..99
    const result = item ? addItem(items, item, catalog) : undefined; // existe no catálogo? soma repetidos, limita a 20
    if (result?.status === "added" || result?.status === "capped") items = result.items;
    else dropped += 1;
  }
  return { items, dropped };                                 // a tela avisa quantos itens saíram
}
```

Nome e preço vêm sempre do catálogo do build; o que está no aparelho é só `{ slug, variant, quantity }`. Catálogo como `Map` (um slug `__proto__` não acha nada).

## Hook sem biblioteca de estado

```ts
const CHANGE_EVENT = "lojinha-da-lua:pedido-alterado";
const LOADING = Symbol("carregando");
const UNAVAILABLE = Symbol("indisponível");

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === null || e.key === ORDER_STORAGE_KEY) onChange(); };
  window.addEventListener("storage", onStorage);   // outras abas
  window.addEventListener(CHANGE_EVENT, onChange); // esta aba
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(CHANGE_EVENT, onChange); };
}
const getSnapshot = () => { const raw = readStoredOrder(getBrowserStorage()); return raw === undefined ? UNAVAILABLE : raw; };
const getServerSnapshot = () => LOADING;            // build e hidratação

export function useStoredOrder(catalog: OrderCatalog) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => snapshot === LOADING ? { status: "loading" as const }
    : snapshot === UNAVAILABLE ? { status: "unavailable" as const }
    : { status: "ready" as const, ...parseStoredOrder(snapshot, catalog) }, [snapshot, catalog]);
}

export function storeOrder(items: readonly OrderItem[]): boolean {
  const saved = saveOrder(getBrowserStorage(), items);
  if (saved) window.dispatchEvent(new Event(CHANGE_EVENT));
  return saved;
}
```

O snapshot é uma string (primitivo): o React compara com `Object.is` e não renderiza à toa.

## Testes

Unidade nas funções puras (JSON quebrado, versão errada, item fora do catálogo, quantidade fora do limite, `__proto__`, tamanho máximo, cota cheia). E2E na tela, inclusive com armazenamento bloqueado: os botões "Pedir" de cada variação continuam funcionando.
