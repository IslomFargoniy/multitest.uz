<?php

namespace App\Observers;

use App\Models\Test;
use App\Support\DefaultAudio;

class TestObserver
{
    /**
     * Every new test starts with the four standard speaking parts.
     * Authorization is handled by TestPolicy, not here (observers also run from queue/console).
     */
    public function created(Test $test): void
    {
        $code = $test->language?->code;

        $test->parts()->createMany([
            [
                'name' => 'Part 1.1',
                'description' => 'Part one. In this part, I’m going to ask you three short questions about yourself and your interests. And then, you will see some photos and answer some questions about them. You will have 30 seconds to reply to each question. Begin speaking when you hear this sound',
                'audio_path' => DefaultAudio::path($code, 'part-1.1-voice.mp3'),
            ],
            [
                'name' => 'Part 1.2',
                'description' => 'Moving to the next section of the multitest.uz exam. Now, I’m going to ask you to compare two pictures and I will ask you two questions about them. Look at the photographs.',
                'audio_path' => DefaultAudio::path($code, 'part-1.2-voice.mp3'),
            ],
            [
                'name' => 'Part 2',
                'description' => 'Part two. This original content is created for multitest.uz users. In this part, I’m going to show you a picture and ask you three questions. You will have one minute to think about your answers before you start speaking. You will have two minutes to answer all three questions. Begin speaking when you hear this sound. Look at the photograph.',
                'audio_path' => DefaultAudio::path($code, 'part-2-voice.mp3'),
            ],
            [
                'name' => 'Part 3',
                'description' => 'Part three. Final section of the multitest.uz speaking system. In this part, you are going to speak on a topic for two minutes. You can see the topic on the screen and two lists of points related to the topic. Choose two items from each list and give a balanced argument. You have one minute to prepare and two minutes to speak. Begin speaking when you hear this sound.',
                'audio_path' => DefaultAudio::path($code, 'part-3-voice.mp3'),
            ],
        ]);
    }
}
