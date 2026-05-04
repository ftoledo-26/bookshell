<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // 1. REGISTRO: Solo crea el usuario
    public function register(Request $request)
    {
        // Validamos el name y el email.
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        // Guardamos el usuario en la base de datos con password hasheada.
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // RESPUESTA: Solo confirmamos que se ha creado.
        // NO entregamos token aquí. El usuario tendrá que hacer login después.
        return response()->json([
            'mensaje' => 'Usuario registrado exitosamente. Por favor inicia sesión.',
            'user' => $user, // Opcional: devolver los datos del usuario creado
        ], 201);
    }

    // 2. LOGIN: El único encargado de dar Tokens
    public function login(Request $request)
    {
        // Busca en la base de datos si existe el usuario y los datos son correctos.
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['mensaje' => 'Credenciales inválidas'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        // AQUÍ es donde se genera el token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'mensaje' => 'Hola ' . $user->name,
            'access_token' => $token, // La llave de acceso
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    // 3. LOGOUT: (Igual que antes)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['mensaje' => 'Sesión cerrada correctamente']);
    }
}