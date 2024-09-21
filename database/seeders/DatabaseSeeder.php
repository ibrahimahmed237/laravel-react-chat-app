<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Group;
use App\Models\User;
use App\Models\Message;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'is_admin' => true,
        ]);

        User::factory()->create([
            'name' => 'Normal User',
            'email' => 'normal@example.com',
            'password' => bcrypt('password')
        ]);

        User::factory(10)->create();

        // Create 5 groups and attach random users to each group
        for ($i = 0; $i < 5; $i++) {
            $group = Group::factory()->create([
                'owner_id' => 1,
            ]);
            $users = User::inRandomOrder()->limit(value: rand(2, 5))->pluck('id');
            $group->users()->attach(array_unique([1, ...$users]));
        }

        Message::factory(1000)->create();

        $messages = Message::whereNull('group_id')->orderBy('created_at')->get();

        // Group messages by sender and receiver pairs

        $conversations = $messages->groupBy(function ($message) {
            // Create a unique key for each pair of users

            return collect([$message->sender_id, $message->receiver_id])->sort()->implode('_');
        })->map(function ($groupedMessages) {
            // Map each group of messages to a conversation array

            return [
                'user_id1' => $groupedMessages->first()->sender_id,
                'user_id2' => $groupedMessages->first()->receiver_id,
                'last_message_id' => $groupedMessages->last()->id,
                'created_at' => new Carbon(),
                'updated_at' => new Carbon()
            ];
        })->values();
        // Insert the conversations into the database, ignoring duplicates

        Conversation::insertOrIgnore($conversations->toArray());
    }
}
