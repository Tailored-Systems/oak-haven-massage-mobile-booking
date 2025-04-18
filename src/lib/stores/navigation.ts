import { writable } from 'svelte/store';

export type NavigationState = {
  showBack: boolean;
  showNext: boolean;
  stepName: string;
  showBookButton?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  onBook?: () => void;
};

function createNavigationStore() {
  const { subscribe, set, update } = writable<NavigationState>({
    showBack: false,
    showNext: false,
    stepName: '',
    showBookButton: false
  });

  return {
    subscribe,
    setNavigation: (state: NavigationState) => set(state),
    reset: () => set({ showBack: false, showNext: false, stepName: '', showBookButton: false })
  };
}

export const navigationStore = createNavigationStore(); 