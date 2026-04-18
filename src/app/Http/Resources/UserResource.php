<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'reviews' => $this->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'libro' => $review->libro?->titulo ?? null,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                ];
            }),
            'likes' => $this->likes->map(function ($like) {
                return [
                    'estado' => $like->estado,
                ];
            }),
        ];
    }


}
