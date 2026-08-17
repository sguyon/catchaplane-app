import type { CaptainStory, Flight } from "./types";

/**
 * Convert a CaptainStory + Flight into a theatrical narration script
 * suitable for TTS. Dramatic, playful, with exclamations and sound effects
 * to keep a 3-5 year old engaged.
 */
export function formatStoryForNarration(story: CaptainStory, flight: Flight): string {
  const lines = [
    `Crrrkkk... Hello hello hello! Can you hear me, little controller?`,
    `This is ${story.captainName} speaking! I'm calling you from way up in the sky, from flight ${flight.callsign}!`,
    `Whoooosh! That was us flying past a big fluffy cloud!`,
    `You want to know something funny about me? I ${story.personality}! Ha ha ha!`,
    `But wait... wait wait wait... Can you guess who's on my plane right now?`,
    story.passengerStory,
    `Isn't that amazing?!`,
    `Now, we're flying a biiiiig ${flight.aircraftType}... Vroooom! All the way from ${flight.origin}... to... ${flight.destination}!`,
    `Ooh ooh ooh, and you're going to LOVE this! Guess what's for dinner on the plane tonight? Are you ready?`,
    story.dinnerMenu,
    `Yum yum yum! My tummy is rumbling just thinking about it!`,
    `Oh! And here's something super duper cool about where we're going!`,
    story.destinationFact,
    `Wow! Can you believe that?`,
    `Okay little controller, I have to go fly this big plane now! Byyye! Keep watching the skies for more planes! Over and out! Crrrkkk...`,
  ];

  return lines.join(" ");
}
