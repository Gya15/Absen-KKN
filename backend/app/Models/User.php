<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $appends = ['foto_url'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nama',
        'nim',
        'jurusan',
        'password',
        'foto_registrasi',
        'face_embedding',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'face_embedding',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Get the attendance records for the user.
     */
    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Serialize face embedding array to binary BLOB.
     */
    public function setFaceEmbeddingAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['face_embedding'] = pack('f*', ...$value);
        } else {
            $this->attributes['face_embedding'] = $value;
        }
    }

    /**
     * Deserialize binary BLOB to face embedding float array.
     */
    public function getFaceEmbeddingArrayAttribute(): ?array
    {
        $raw = $this->attributes['face_embedding'] ?? null;
        if (empty($raw)) {
            return null;
        }
        return array_values(unpack('f*', $raw));
    }

    /**
     * Get the full URL for the user's registration photo.
     */
    public function getFotoUrlAttribute()
    {
        if ($this->foto_registrasi) {
            return \Illuminate\Support\Facades\Storage::url($this->foto_registrasi);
        }
        return null;
    }
}
