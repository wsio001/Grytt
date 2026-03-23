import { useReducer } from "react";

export const DRAG_INIT = { ex: null, pe: null, src: null, srcRow: null, overRow: null, overPos: null };

function dragReducer(state, action) {
  switch (action.type) {
    case "START_LIB":  return { ...DRAG_INIT, ex: action.ex, src: "library" };
    case "START_PLAN": return { ...DRAG_INIT, pe: action.pe, src: action.src, srcRow: action.srcRow };
    case "OVER":       return { ...state, overRow: action.row, overPos: action.pos };
    case "RESET":      return DRAG_INIT;
    default:           return state;
  }
}

export function useDragReducer() {
  return useReducer(dragReducer, DRAG_INIT);
}