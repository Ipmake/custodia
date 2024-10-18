import axios from 'axios';
import { create } from 'zustand';
import { getBaseURL } from '../functions';

export interface GeneralState {
    loaded: boolean;
    title: string;
    subtitle: string;
    banner?: string;
    wallpaper?: string | null;

    setLoaded(loaded: boolean): void;
    setData(data: Partial<GeneralState>): void;
    fetchData(): void;
}

export const useGeneralState = create<GeneralState>((set) => ({
    loaded: false,
    title: '',
    subtitle: '',
    banner: '',
    wallpaper: null,

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

        window.document.title = response.data.title;

        if(response.data.wallpaper) {
            // set the body to the wallpaper as a darkend background using a gradient
            const body = document.getElementsByTagName('body')[0];
            body.style.background = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0,0,0,0.5)), url('${getBaseURL().replace("/api", "")}/assets/${encodeURIComponent(response.data.wallpaper)}')`;
        } else {
            const body = document.getElementsByTagName('body')[0];
            body.style.background = ``;
        }

        set(set => ({
            loaded: true,
            title: response.data.title,
            subtitle: response.data.subtitle,
            banner: response.data.banner,
            wallpaper: response.data.wallpaper
        }));
    }
}));