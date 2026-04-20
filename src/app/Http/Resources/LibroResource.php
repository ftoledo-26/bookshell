<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LibroResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'autor' => $this->autor,
            'genero' => $this->genero,
            'descripcion' => $this->descripcion,
            'reviews' => $this->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'user' => $review->user?->name ?? null,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                ];
            }),
        ];
    }
}
