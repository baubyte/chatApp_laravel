<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Undocumented function
     */
    public function __construct()
    {
        $this->middleware('auth');
    }


    /**
     * Undocumented function
     *
     * @return void
     */
    public function show(Chat $chat)
    {
        /**
         * Aborta la conexion si no se cumple
         */
        abort_unless($chat->users->contains(auth()->id()),403);
        return view('chat',[
            'chat' => $chat
        ]);
    }

    /**
     * Undocumented function
     *
     * @param User $user
     * @return void
     */
    public function chat_with(User $user)
	{

        //Usuario autenticado
		$user_a = auth()->user();
        //Usuario por Parametro el que estamos buscando
		$user_b = $user;

        /**
         * Buscamos si tiene una sala
         */
		$chat = $user_a->chats()->wherehas('users', function ($q) use ($user_b) {

			$q->where('chat_user.user_id', $user_b->id);

		})->first();

        /**
         * Si no la encuentra
         */
		if(!$chat)
		{
            //Creamos una sala
			$chat = Chat::create([]);
            //Vinculamos la sala con los usuarios
			$chat->users()->sync([$user_a->id, $user_b->id]);

		}
		return redirect()->route('chat.show', $chat);

	}

}
