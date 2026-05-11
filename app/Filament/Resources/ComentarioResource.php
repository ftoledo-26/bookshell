<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ComentarioResource\Pages;
use App\Models\Comentario;
use App\Models\Libro;
use App\Models\Usuario;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ComentarioResource extends Resource
{
    protected static ?string $model = Comentario::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('usuario_id')
                    ->label('Usuario')
                    ->options(Usuario::pluck('nombre', 'id'))
                    ->searchable()
                    ->required(),
                Forms\Components\Select::make('libro_id')
                    ->label('Libro')
                    ->options(Libro::pluck('titulo', 'id'))
                    ->searchable()
                    ->required(),
                Forms\Components\Textarea::make('contenido')
                    ->required()
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('likes')
                    ->numeric()
                    ->default(0),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('usuario.nombre')
                    ->label('Usuario')
                    ->searchable(),
                Tables\Columns\TextColumn::make('libro.titulo')
                    ->label('Libro')
                    ->searchable(),
                Tables\Columns\TextColumn::make('contenido')
                    ->limit(50),
                Tables\Columns\TextColumn::make('likes')
                    ->numeric()
                    ->sortable(),
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
            'index' => Pages\ListComentarios::route('/'),
            'create' => Pages\CreateComentario::route('/create'),
            'edit' => Pages\EditComentario::route('/{record}/edit'),
        ];
    }
}
