export type AddKind = 'goal' | 'habit';

let selectedKind: AddKind | null = null;
let goalDraft = '';
let habitDraft = '';

export function getSelectedAddKind(): AddKind | null { return selectedKind; }
export function setSelectedAddKind(kind: AddKind | null): void { selectedKind = kind; }
export function getAddDraft(kind: AddKind): string { return kind === 'goal' ? goalDraft : habitDraft; }
export function setAddDraft(kind: AddKind, value: string): void {
  if (kind === 'goal') goalDraft = value;
  else habitDraft = value;
}
export function clearAddDraft(kind: AddKind): void { setAddDraft(kind, ''); }
