import { Flight, CaptainStory } from "./types";

export const MOCK_FLIGHTS: Flight[] = [
  {
    id: "mock-1",
    callsign: "AF1",
    aircraftType: "Airbus A320",
    origin: "Paris",
    destination: "New York",
    latitude: 40.72,
    longitude: -73.99,
    altitude: 35000,
    heading: 280,
  },
  {
    id: "mock-2",
    callsign: "BA256",
    aircraftType: "Boeing 777",
    origin: "London",
    destination: "San Francisco",
    latitude: 40.75,
    longitude: -73.95,
    altitude: 38000,
    heading: 310,
  },
  {
    id: "mock-3",
    callsign: "JL012",
    aircraftType: "Boeing 787",
    origin: "Tokyo",
    destination: "London",
    latitude: 40.68,
    longitude: -74.02,
    altitude: 41000,
    heading: 45,
  },
  {
    id: "mock-4",
    callsign: "EK201",
    aircraftType: "Airbus A380",
    origin: "Dubai",
    destination: "New York",
    latitude: 40.71,
    longitude: -73.97,
    altitude: 37000,
    heading: 270,
  },
  {
    id: "mock-5",
    callsign: "DL100",
    aircraftType: "Boeing 737",
    origin: "Atlanta",
    destination: "Miami",
    latitude: 40.69,
    longitude: -74.01,
    altitude: 28000,
    heading: 180,
  },
];

export const MOCK_STORIES: CaptainStory[] = [
  {
    captainName: "Captain Wobbles",
    personality: "gets really excited about secret doors and always carries a first aid kit just in case",
    dinnerMenu:
      "Rainbow lollipops with sparkly sticks, candy cookies shaped like clouds, and a giggle juice that makes your nose tickle!",
    passengerStory:
      "Sam and Rio found a SECRET DOOR in the cockpit and I gave them candy! But then Rio thought a pretty flower was a snack and ate it by accident -- and now their tummy feels funny and rumbly! Sam is doing silly airplane-wing dances to make them feel better!",
    destinationFact:
      "Did you know flowers are super colorful but some of them make your tummy feel wiggly if you eat them? The safest snacks are the yummy ones, not the pretty ones! Real food is always the best adventure!",
  },
  {
    captainName: "Captain Barnacle",
    personality: "talks to the clouds like they're old friends and gives them silly names",
    dinnerMenu:
      "Upside-down pancakes with banana smiles, spaghetti tornadoes you have to slurp really fast, and a mystery dessert that changes color when you lick it!",
    passengerStory:
      "Rio found a secret door in the bathroom and discovered where the pilots hide their gummy bear stash! Sam and Rio are now sharing them with everyone, and Sam is doing silly dances in the aisles to celebrate!",
    destinationFact:
      "Did you know that in New York, there are alligators living under the streets? Well, maybe not really, but people love telling that story! What IS real is a park so big you could walk around it all day and still find new things!",
  },
  {
    captainName: "Captain Zigzag",
    personality: "flies in zigzags for fun and wears mismatched socks every single day",
    dinnerMenu:
      "Popcorn soup served in tiny top hats, jellybean tacos with extra giggles, and a cake that sings happy birthday even when it's nobody's birthday!",
    passengerStory:
      "Rio figured out how to make the overhead light blink like a disco ball and Sam started a silly dance party! Everyone's dancing in the aisles -- they're basically the coolest in-flight entertainment duo!",
    destinationFact:
      "London has a giant wheel called the London Eye that spins super slowly so you can see the whole city from way up high! It's like being in a bubble floating over rooftops and tiny red buses!",
  },
  {
    captainName: "Captain Noodle",
    personality: "does a little dance in the cockpit every time we fly over a mountain",
    dinnerMenu:
      "Pizza rolls that look like tiny volcanoes, fizzy apple juice that tickles your nose, and ice cream sandwiches shaped like little airplanes with chocolate wings!",
    passengerStory:
      "Rio made friends with a penguin puppet from the seat pocket and created an amazing puppet show while Sam provided the soundtrack with silly airplane dances! Sir Waddles even got a dance solo!",
    destinationFact:
      "Tokyo has a really tall tower that lights up in different colors at night, like a giant rainbow stick! And there are vending machines everywhere that sell the silliest things -- even hot soup and tiny toys!",
  },
];

// Fallback flights when no real flights are found
export const FALLBACK_FLIGHTS: Flight[] = [
  {
    id: "fallback-1",
    callsign: "AIRFRC1",
    aircraftType: "Boeing 747",
    origin: "Washington D.C.",
    destination: "Los Angeles",
    latitude: 40.0,
    longitude: -74.0,
    altitude: 45000,
    heading: 270,
  },
  {
    id: "fallback-2",
    callsign: "SQ321",
    aircraftType: "Airbus A380",
    origin: "Singapore",
    destination: "London",
    latitude: 40.0,
    longitude: -74.0,
    altitude: 40000,
    heading: 30,
  },
  {
    id: "fallback-3",
    callsign: "QF1",
    aircraftType: "Boeing 787",
    origin: "Sydney",
    destination: "London",
    latitude: 40.0,
    longitude: -74.0,
    altitude: 43000,
    heading: 350,
  },
];
