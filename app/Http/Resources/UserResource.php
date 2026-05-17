<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $foto = $this->foto;
        if (!$foto) {
            $slug = Str::slug($this->name ?? '');
            $path = public_path('fotos/' . $slug . '.webp');
            if ($slug && file_exists($path)) {
                $foto = '/fotos/' . $slug . '.webp';
            }
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roll' => $this->roll,
            'foto' => $foto,
            'descripcion' => $this->descripcion,
            'reviews' => $this->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'libro' => $review->libro?->titulo ?? null,
                    'portada' => $review->libro?->foto ?: ($review->libro?->portada ?: 'default.pdf'),
                    'rating' => $review->valoracion,
                    'comentario' => $review->comentario,
                ];
            }),
            'followers_count' => $this->followers()->count(),
            'following_count' => $this->following()->count(),
            'likes' => $this->likes->map(function ($like) {
                return [
                    'estado' => $like->estado,
                ];
            }),
        ];
    }
}
