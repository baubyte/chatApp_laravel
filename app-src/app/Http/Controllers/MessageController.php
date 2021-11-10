<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Undocumented function
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Envio de mensajes
     *
     * @param Request $request
     * @return void
     */
    public function sent(Request $request)
    {
        //Creamos el mensaje recibimos todo del request
       $message = $request->user()->messages()->create([
           'content' => $request->message,
           'chat_id' => $request->chat_id
       ])->load('user');//traemos tambien el objeto de usuario

       //usamos el helper broadcast
       \broadcast(new MessageSent($message))->toOthers(); //solo mandamos o otros usuario para no duplicar
       //retornamos el mensaje
       return $message;
    }
}
