export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    password: string;
    rol: string;
    foto: string;
    phone: string;
    descripcion?: string;
    reviews?: any[];
    likes?: any[];
    followers_count?: number;
    following_count?: number;
}