export interface Book {
    id: number;
    titulo: string;
    autor: string;
    descripcion: string;
    portada: string;
    genero?: string;
    reviews?: Array<{
        id: number;
        user?: string;
        rating?: number | null;
        comment?: string | null;
    }>;
}