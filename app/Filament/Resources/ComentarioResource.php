<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ComentarioResource\Pages;
use App\Models\Libro;
use App\Models\Review;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ComentarioResource extends Resource
{
    protected static ?string $model = Review::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?string $navigationLabel = 'Reviews';

    protected static ?string $modelLabel = 'Review';

    protected static ?string $pluralModelLabel = 'Reviews';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->label('Usuario')
                    ->options(User::pluck('name', 'id'))
                    ->searchable()
                    ->required(),
                Forms\Components\Select::make('libro_id')
                    ->label('Libro')
                    ->options(Libro::pluck('titulo', 'id'))
                    ->searchable()
                    ->required(),
                Forms\Components\Textarea::make('comentario')
                    ->required()
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('valoracion')
                    ->label('Valoración (1-5)')
                    ->numeric()
                    ->minValue(1)
                    ->maxValue(5)
                    ->default(5),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Usuario')
                    ->searchable(),
                Tables\Columns\TextColumn::make('libro.titulo')
                    ->label('Libro')
                    ->searchable(),
                Tables\Columns\TextColumn::make('comentario')
                    ->limit(60),
                Tables\Columns\TextColumn::make('valoracion')
                    ->label('Valoración')
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
