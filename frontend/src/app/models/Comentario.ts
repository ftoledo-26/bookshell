export interface Comentario {
    id: number;
    UsuarioId?: number;
    BookId?: number;
    contenido?: string;
    comentario?: string;
    likes?: number;
    user?: string;
    libro?: string;
    portada?: string;
    rating?: number | null;
    comment?: string | null;
}