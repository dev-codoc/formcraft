import { useReducer, useEffect, useCallback, useRef } from "react";
import { useDebouncedCallback } from "./useDebounce";

// ---------- Types ----------

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "file"
  | "rating";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select / radio / checkbox
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  order: number;
}

export interface FormTheme {
  primaryColor: string;
  fontFamily: string;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  theme: FormTheme;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface BuilderState {
  schema: FormSchema;
  selectedFieldId: string | null;
  history: FormSchema[];
  historyIndex: number;
  saveStatus: SaveStatus;
  isDirty: boolean;
}

type BuilderAction =
  | { type: "LOAD_FORM"; payload: FormSchema }
  | { type: "ADD_FIELD"; payload: { field: FormField; atIndex?: number } }
  | { type: "UPDATE_FIELD"; payload: { id: string; updates: Partial<FormField> } }
  | { type: "DELETE_FIELD"; payload: { id: string } }
  | { type: "REORDER_FIELDS"; payload: { fields: FormField[] } }
  | { type: "SELECT_FIELD"; payload: { id: string | null } }
  | { type: "UPDATE_META"; payload: { title?: string; description?: string } }
  | { type: "UPDATE_THEME"; payload: Partial<FormTheme> }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_SAVE_STATUS"; payload: SaveStatus }
  | { type: "MARK_SAVED" };

const MAX_HISTORY = 50;

// Actions that should create a new history checkpoint (undo-able)
const HISTORY_ACTIONS = new Set([
  "ADD_FIELD",
  "UPDATE_FIELD",
  "DELETE_FIELD",
  "REORDER_FIELDS",
  "UPDATE_META",
  "UPDATE_THEME",
]);

function pushHistory(state: BuilderState, nextSchema: FormSchema): Pick<BuilderState, "history" | "historyIndex"> {
  // Drop any "future" states if we'd undone and are now branching
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  const nextHistory = [...trimmed, nextSchema].slice(-MAX_HISTORY);
  return { history: nextHistory, historyIndex: nextHistory.length - 1 };
}

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "LOAD_FORM": {
      return {
        schema: action.payload,
        selectedFieldId: null,
        history: [action.payload],
        historyIndex: 0,
        saveStatus: "idle",
        isDirty: false,
      };
    }

    case "ADD_FIELD": {
      const { field, atIndex } = action.payload;
      const fields = [...state.schema.fields];
      const insertAt = atIndex ?? fields.length;
      fields.splice(insertAt, 0, field);
      const reordered = fields.map((f, i) => ({ ...f, order: i }));
      const nextSchema = { ...state.schema, fields: reordered };
      return {
        ...state,
        schema: nextSchema,
        selectedFieldId: field.id,
        isDirty: true,
        ...pushHistory(state, nextSchema),
      };
    }

    case "UPDATE_FIELD": {
      const { id, updates } = action.payload;
      const fields = state.schema.fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
      const nextSchema = { ...state.schema, fields };
      return {
        ...state,
        schema: nextSchema,
        isDirty: true,
        ...pushHistory(state, nextSchema),
      };
    }

    case "DELETE_FIELD": {
      const fields = state.schema.fields
        .filter((f) => f.id !== action.payload.id)
        .map((f, i) => ({ ...f, order: i }));
      const nextSchema = { ...state.schema, fields };
      const wasSelected = state.selectedFieldId === action.payload.id;
      return {
        ...state,
        schema: nextSchema,
        selectedFieldId: wasSelected ? null : state.selectedFieldId,
        isDirty: true,
        ...pushHistory(state, nextSchema),
      };
    }

    case "REORDER_FIELDS": {
      const fields = action.payload.fields.map((f, i) => ({ ...f, order: i }));
      const nextSchema = { ...state.schema, fields };
      return {
        ...state,
        schema: nextSchema,
        isDirty: true,
        ...pushHistory(state, nextSchema),
      };
    }

    case "SELECT_FIELD": {
      return { ...state, selectedFieldId: action.payload.id };
    }

    case "UPDATE_META": {
      const nextSchema = { ...state.schema, ...action.payload };
      return {
        ...state,
        schema: nextSchema,
        isDirty: true,
        ...pushHistory(state, nextSchema),
      };
    }

    case "UPDATE_THEME": {
      const nextSchema = {
        ...state.schema,
        theme: { ...state.schema.theme, ...action.payload },
      };
      return {
        ...state,
        schema: nextSchema,
        isDirty: true,
        ...pushHistory(state, nextSchema),
      };
    }

    case "UNDO": {
      if (state.historyIndex <= 0) return state;
      const prevIndex = state.historyIndex - 1;
      return {
        ...state,
        schema: state.history[prevIndex],
        historyIndex: prevIndex,
        isDirty: true,
      };
    }

    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIndex = state.historyIndex + 1;
      return {
        ...state,
        schema: state.history[nextIndex],
        historyIndex: nextIndex,
        isDirty: true,
      };
    }

    case "SET_SAVE_STATUS": {
      return { ...state, saveStatus: action.payload };
    }

    case "MARK_SAVED": {
      return { ...state, saveStatus: "saved", isDirty: false };
    }

    default:
      return state;
  }
}

function createEmptyForm(id: string): FormSchema {
  return {
    id,
    title: "Untitled Form",
    description: "",
    fields: [],
    theme: { primaryColor: "#18181b", fontFamily: "Inter" },
  };
}

function createField(type: FieldType, order: number): FormField {
  return {
    id: crypto.randomUUID(),
    type,
    label: "Untitled question",
    required: false,
    options: ["select", "radio", "checkbox"].includes(type) ? ["Option 1"] : undefined,
    order,
  };
}

// ---------- Hook ----------

interface UseFormBuilderOptions {
  formId: string;
  initialSchema?: FormSchema;
  autosaveDelay?: number; // ms, default 800
  onSaveError?: (error: Error) => void;
}

export function useFormBuilder({
  formId,
  initialSchema,
  autosaveDelay = 800,
  onSaveError,
}: UseFormBuilderOptions) {
  const [state, dispatch] = useReducer(
    builderReducer,
    initialSchema ?? createEmptyForm(formId),
    (schema) => ({
      schema,
      selectedFieldId: null,
      history: [schema],
      historyIndex: 0,
      saveStatus: "idle" as SaveStatus,
      isDirty: false,
    })
  );

  // Track whether the schema currently in state has actually been saved,
  // so we don't fire a save call on initial mount.
  const isFirstRender = useRef(true);

  const persistToServer = useCallback(
    async (schema: FormSchema) => {
      dispatch({ type: "SET_SAVE_STATUS", payload: "saving" });
      try {
        const res = await fetch(`/api/forms/${schema.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(schema),
        });
        if (!res.ok) throw new Error(`Save failed: ${res.status}`);
        dispatch({ type: "MARK_SAVED" });
      } catch (err) {
        dispatch({ type: "SET_SAVE_STATUS", payload: "error" });
        onSaveError?.(err as Error);
      }
    },
    [onSaveError]
  );

  const debouncedSave = useDebouncedCallback(persistToServer, autosaveDelay);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (state.isDirty) {
      debouncedSave(state.schema);
    }
  }, [state.schema, state.isDirty, debouncedSave]);

  // ---------- Public API ----------

  const addField = useCallback((type: FieldType, atIndex?: number) => {
    dispatch({
      type: "ADD_FIELD",
      payload: { field: createField(type, atIndex ?? 0), atIndex },
    });
  }, []);

  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    dispatch({ type: "UPDATE_FIELD", payload: { id, updates } });
  }, []);

  const deleteField = useCallback((id: string) => {
    dispatch({ type: "DELETE_FIELD", payload: { id } });
  }, []);

  const reorderFields = useCallback((fields: FormField[]) => {
    dispatch({ type: "REORDER_FIELDS", payload: { fields } });
  }, []);

  const selectField = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_FIELD", payload: { id } });
  }, []);

  const updateMeta = useCallback((updates: { title?: string; description?: string }) => {
    dispatch({ type: "UPDATE_META", payload: updates });
  }, []);

  const updateTheme = useCallback((updates: Partial<FormTheme>) => {
    dispatch({ type: "UPDATE_THEME", payload: updates });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const saveNow = useCallback(() => {
    persistToServer(state.schema);
  }, [persistToServer, state.schema]);

  const selectedField = state.schema.fields.find((f) => f.id === state.selectedFieldId) ?? null;

  return {
    schema: state.schema,
    fields: state.schema.fields,
    selectedField,
    selectedFieldId: state.selectedFieldId,
    saveStatus: state.saveStatus,
    isDirty: state.isDirty,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    addField,
    updateField,
    deleteField,
    reorderFields,
    selectField,
    updateMeta,
    updateTheme,
    undo,
    redo,
    saveNow,
  };
}