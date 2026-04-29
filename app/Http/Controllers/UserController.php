<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;


class UserController extends Controller
{
    public function index(){
        // Aquí puedes obtener los usuarios de la base de datos y pasarlos a la vista
        $users = User::all();
        return view('users.index', ['users' => $users]);
    }

    public function show($id){
        // Aquí puedes obtener un usuario específico por su ID y pasarlo a la vista
        $user = User::findOrFail($id);
        return view('users.show', ['user' => $user]);
    }

    public function create(){
        // Aquí puedes mostrar un formulario para crear un nuevo usuario
        return view('users.create');
    }

    public function store(Request $request){
        // Aquí puedes validar y guardar un nuevo usuario en la base de datos
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'phone'=> 'required|integer|min:900000000|max:999999999',
            'localidad' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'phone' => $validatedData['phone'],
            'localidad' => $validatedData['localidad'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),
        ]);

        return redirect()->route('users.index')->with('success', 'Usuario creado exitosamente.');
    }

    public function edit($id){
        // Aquí puedes obtener un usuario específico por su ID y mostrar un formulario para editarlo
        $user = User::findOrFail($id);
        return view('users.edit', ['user' => $user]);
    }

    public function destroy($id){
        // Aquí puedes eliminar un usuario específico por su ID
        $user = User::findOrFail($id);
        $user->delete();
        return redirect()->route('users.index')->with('success', 'Usuario eliminado exitosamente.');
    }
}
