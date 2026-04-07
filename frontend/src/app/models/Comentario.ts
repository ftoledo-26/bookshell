export interface Comentario {
    id: number;
    UsuarioId: number;
    BookId: number;
    contenido: string;
    likes: number;
}