<?php

namespace App\Filament\Admin\Resources\LibroResource\Pages;

use App\Filament\Admin\Resources\LibroResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListLibros extends ListRecords
{
    protected static string $resource = LibroResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
