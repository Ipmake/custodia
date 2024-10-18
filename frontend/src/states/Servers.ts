import axios from "axios";
import { create } from "zustand";
import { getBaseURL } from "../functions";

interface ServerState {
  servers: Types.Server[];
  setServers: (services: Types.Server[]) => void;
  fetchServers: () => void;
  swapPositions: (serverA: string, serverB: string) => void;
  deleteServer: (serverId: string) => void;
  moveService: (server: Types.Server, service: Types.Service, position: number) => void;
  removeService: (service: Types.Service) => void;
};

export const useServers = create<ServerState>((set) => ({
    servers: [],
    setServers: (servers) => set({ servers }),
    fetchServers: async () => {
        const response = await axios.get(`${getBaseURL()}/servers`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }).catch(() => {
            return null;
        });
        if (!response) return;

        set({ servers: response.data.servers });
    },
    swapPositions: async (serverA, serverB) => {
        const servers = [...useServers.getState().servers];
        const serverAData = servers.find(server => server.id === serverA);
        const serverBData = servers.find(server => server.id === serverB);

        if (!serverAData || !serverBData) return;

        const serverAposition = serverAData.position;
        const serverBposition = serverBData.position;

        serverAData.position = serverBposition;
        serverBData.position = serverAposition;

        servers.sort((a, b) => a.position - b.position);

        await axios.patch(`${getBaseURL()}/servers/positions`, {
            serverA,
            serverB
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).catch(() => {
            return null;
        });

        set({ servers });
    },
    deleteServer: async (serverId) => {
        const servers = [...useServers.getState().servers];
        const serverData = servers.find(server => server.id === serverId);

        if (!serverData) return;

        const position = serverData.position;

        servers.splice(position, 1);

        axios.delete(`${getBaseURL()}/servers/${serverId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).catch(() => {
            return null;
        });

        set({ servers });
    },
    moveService: async (server, service, position) => {
        await axios.patch(`${getBaseURL()}/service/positions`, {
            server: server.id,
            service: service.id,
            position
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).catch(() => {
            return null;
        });

        useServers.getState().fetchServers();
    },
    removeService: async (service) => {
        await axios.delete(`${getBaseURL()}/service/${service.id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).catch(() => {
            return null;
        });

        useServers.getState().fetchServers();
    }
}));