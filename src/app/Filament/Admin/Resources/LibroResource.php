<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\LibroResource\Pages;
use App\Models\Libro;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class LibroResource extends Resource
{
    protected static ?string $model = Libro::class;

    protected static ?string $navigationIcon = 'heroicon-o-book-open';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('titulo')->maxLength(255),
                Forms\Components\TextInput::make('autor')->maxLength(255),
                Forms\Components\TextInput::make('editorial')->maxLength(255),
                Forms\Components\TextInput::make('anio_publicacion')->maxLength(4),
                Forms\Components\Select::make('genero')
                    ->options([
                        'novela'         => 'Novela',
                        'fantasia'       => 'Fantasía',
                        'ciencia_ficcion'=> 'Ciencia ficción',
                        'terror'         => 'Terror',
                        'misterio'       => 'Misterio',
                        'romance'        => 'Romance',
                        'historia'       => 'Historia',
                        'biografia'      => 'Biografía',
                        'poesia'         => 'Poesía',
                        'ensayo'         => 'Ensayo',
                        'otro'           => 'Otro',
                    ]),
                Forms\Components\Textarea::make('descripcion')->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('titulo')->searchable(),
                Tables\Columns\TextColumn::make('autor')->searchable(),
                Tables\Columns\TextColumn::make('editorial')->searchable(),
                Tables\Columns\TextColumn::make('anio_publicacion'),
                Tables\Columns\TextColumn::make('genero')->badge(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLibros::route('/'),
            'create' => Pages\CreateLibro::route('/create'),
            'edit' => Pages\EditLibro::route('/{record}/edit'),
        ];
    }
}
