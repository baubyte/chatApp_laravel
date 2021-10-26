<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Chat extends Model
{
    use HasFactory;

    /**
     * Undocumented function
     *
     * @return void
     */
    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * Undocumented function
     *
     * @return void
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
