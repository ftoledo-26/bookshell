<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
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
            'libro' => $this->libro?->titulo ?? null,
            'portada' => $this->libro?->foto ?: ($this->libro?->portada ?: 'default.pdf'),
            'user' => $this->user?->name ?? null,
            'valoracion' => $this->valoracion,
            'comentario' => $this->comentario,
        ];
    }
}
