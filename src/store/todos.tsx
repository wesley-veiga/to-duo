import "expo-sqlite/localStorage/install";
import {
  createContext,
  use,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

export type Todo = {
  id: string;
  title: string;
  createdAt: number;
  doneAt: number | null;
};

type State = {
  todos: Todo[];
  swapped: boolean;
};

type Action =
  | { type: "add"; title: string }
  | { type: "toggle"; id: string }
  | { type: "remove"; id: string }
  | { type: "removeDoneBefore"; before: number }
  | { type: "swap" };

const DAY = 24 * 60 * 60 * 1000;

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function seed(): Todo[] {
  const now = Date.now();
  const make = (title: string, doneDaysAgo: number | null): Todo => ({
    id: newId(),
    title,
    createdAt: now - 30 * DAY,
    doneAt: doneDaysAgo === null ? null : now - doneDaysAgo * DAY,
  });
  return [
    make("Revisar layout da tela dividida", null),
    make("Testar no emulador Pixel Fold", null),
    make("Escrever testes do reducer", null),
    make("Configurar projeto Expo", 0),
    make("Definir paleta de cores", 0),
    make("Rascunhar telas no papel", 1),
    make("Pesquisar APIs de dobráveis", 2),
    make("Comprar café", 2),
    make("Ler docs do Reanimated", 4),
    make("Organizar backlog", 5),
    make("Instalar Android Studio", 8),
    make("Atualizar o Node", 8),
    make("Criar conta na Expo", 10),
    make("Esboçar ideia do app", 13),
    make("Comparar apps de tarefas", 16),
    make("Listar funcionalidades", 20),
  ];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add": {
      const title = action.title.trim();
      if (!title) return state;
      const todo: Todo = {
        id: newId(),
        title,
        createdAt: Date.now(),
        doneAt: null,
      };
      return { ...state, todos: [todo, ...state.todos] };
    }
    case "toggle":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id
            ? { ...t, doneAt: t.doneAt ? null : Date.now() }
            : t,
        ),
      };
    case "remove":
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) };
    case "removeDoneBefore":
      return {
        ...state,
        todos: state.todos.filter(
          (t) => t.doneAt === null || t.doneAt >= action.before,
        ),
      };
    case "swap":
      return { ...state, swapped: !state.swapped };
  }
}

const STORAGE_KEY = "to-duo:state";

function load(): State {
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<State>;
      if (Array.isArray(saved.todos)) {
        return { todos: saved.todos, swapped: saved.swapped ?? false };
      }
    }
  } catch {}
  return { todos: seed(), swapped: false };
}

const TodosContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | null>(null);

export function TodosProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  return <TodosContext value={{ state, dispatch }}>{children}</TodosContext>;
}

export function useTodos() {
  const ctx = use(TodosContext);
  if (!ctx) throw new Error("useTodos must be used inside <TodosProvider>");
  return ctx;
}
