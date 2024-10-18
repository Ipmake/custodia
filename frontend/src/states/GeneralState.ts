import axios from 'axios';
import { create } from 'zustand';
import { getBaseURL } from '../functions';

export interface GeneralState {
    loaded: boolean;
    title: string;
    subtitle: string;

    setLoaded(loaded: boolean): void;
    setData(data: Partial<GeneralState>): void;
    fetchData(): void;
}

export const useGeneralState = create<GeneralState>((set) => ({
    loaded: false,
    title: '',
    subtitle: '',

    setData: (data) => set(set => ({ ...data })),
    setLoaded: (loaded) => set(set => ({ loaded })),
    fetchData: async () => {
        const response = await axios.get(`${getBaseURL()}/general`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }).catch(() => {
            return null;
        });
        if (!response) return;

        set(set => ({
            loaded: true,
            title: response.data.title,
            subtitle: response.data.subtitle
        }));
    }
}));