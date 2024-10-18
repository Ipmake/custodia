declare namespace Types {
    interface Server {
        id: string;
        title: string;
        logo: string;
        logoPosition: string;
        banner: string;
        position: number;

        services: Service[];
    }

    interface Service {
        id: string;
        title: string;
        icon: string;
        subtitle?: string;
        link: string;
        position: number;
    }
}