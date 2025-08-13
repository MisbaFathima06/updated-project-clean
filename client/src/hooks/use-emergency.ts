import { create } from "zustand";

interface EmergencyState {
  isEmergencyModalOpen: boolean;
  openEmergencyModal: () => void;
  closeEmergencyModal: () => void;
}

export const useEmergency = create<EmergencyState>((set) => ({
  isEmergencyModalOpen: false,
  openEmergencyModal: () => set({ isEmergencyModalOpen: true }),
  closeEmergencyModal: () => set({ isEmergencyModalOpen: false }),
}));