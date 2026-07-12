import type {
  CollectionPreview,
  MovieBrief,
  MovieDetail,
  MovieSearchFilters,
  ReviewPreview,
  UsageSnapshot
} from "./types";

const palette = {
  interstellar: ["#1b2440", "#43315d", "#d7b06a"],
  arrival: ["#141b2c", "#304d60", "#e0c37a"],
  bladeRunner2049: ["#130f18", "#3d2a40", "#f0a45a"],
  dune: ["#1d1512", "#513524", "#d8b06d"]
} as const;

export const sceneAtlasMovies: MovieDetail[] = [
  {
    slug: "interstellar",
    title: "Interstellar",
    year: 2014,
    releaseDate: "2014-11-07",
    runtimeMinutes: 169,
    rating: 8.7,
    genres: ["Science Fiction", "Drama", "Adventure"],
    tagline: "A rescue mission becomes a study in gravity, memory, and love.",
    overview:
      "When Earth faces collapse, a former pilot joins a deep-space expedition through a wormhole to find a new home for humanity.",
    posterPalette: palette.interstellar,
    wikidataId: "Q148272",
    commonsCategory: "Category:Interstellar_(film)",
    director: "Christopher Nolan",
    writer: "Jonathan Nolan",
    composer: "Hans Zimmer",
    language: "English",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    analysis: {
      summary:
        "Interstellar balances hard science and emotional stakes, following a team forced to choose between immediate survival and long-horizon hope.",
      spoilerSummary:
        "The film reveals that the survival mission is also a message across time, with Cooper acting through the tesseract to help Murph complete the equation.",
      ending:
        "Cooper is released near Saturn and reunites with an elderly Murph, then heads toward Brand's colony to continue the human story.",
      spoilerEnding:
        "The ending confirms that love is treated as a navigational force as much as a human one, while the tesseract closes the loop on the film's time paradox.",
      timeline: [
        {
          order: 1,
          label: "Act I",
          title: "Dust and dwindling futures",
          description: "Cooper discovers the scale of Earth's environmental collapse and the abandoned mission behind NASA's survival plan.",
          characters: ["Cooper", "Murph", "Professor Brand"]
        },
        {
          order: 2,
          label: "Act II",
          title: "A split across time",
          description: "The expedition begins and time dilation on Miller's planet shows how costly the mission really is.",
          characters: ["Cooper", "Brand", "Romilly", "Mann"]
        },
        {
          order: 3,
          label: "Act III",
          title: "Inside the tesseract",
          description: "Cooper becomes the signal across time, sending data back through Murph's bedroom shelf.",
          characters: ["Cooper", "Murph"]
        }
      ],
      relationships: [
        { source: "Cooper", target: "Murph", label: "father / daughter" },
        { source: "Cooper", target: "Brand", label: "teammates" },
        { source: "Murph", target: "Professor Brand", label: "student / mentor" }
      ],
      similar: [
        { slug: "arrival", title: "Arrival", year: 2016, reason: "Both films use language, grief, and non-linear time to reframe what saving the future means." },
        { slug: "dune", title: "Dune: Part One", year: 2021, reason: "Large-scale worldbuilding, spiritual intensity, and a cinematic emphasis on destiny." }
      ]
    }
  },
  {
    slug: "arrival",
    title: "Arrival",
    year: 2016,
    releaseDate: "2016-11-11",
    runtimeMinutes: 116,
    rating: 7.9,
    genres: ["Science Fiction", "Drama", "Mystery"],
    tagline: "Understanding the message changes the person receiving it.",
    overview:
      "When twelve alien vessels appear across the globe, a linguist is recruited to decode their language before political tensions escalate.",
    posterPalette: palette.arrival,
    wikidataId: "Q217199",
    commonsCategory: "Category:Arrival_(film)",
    director: "Denis Villeneuve",
    writer: "Eric Heisserer",
    composer: "Jóhann Jóhannsson",
    language: "English",
    cast: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"],
    analysis: {
      summary:
        "Arrival is a restrained first-contact thriller that uses language as a key to empathy, politics, and time perception.",
      spoilerSummary:
        "The heptapods' written language is revealed to alter cognition, allowing Louise to experience her future as memory.",
      ending:
        "Louise accepts the life she will live, including the pain she knows is coming, because she values the whole story.",
      spoilerEnding:
        "The final reveal turns the film into a meditation on choice under certainty: knowing the future does not eliminate meaning.",
      timeline: [
        {
          order: 1,
          label: "Signal",
          title: "The ships arrive",
          description: "Louise is recruited to interpret the alien language after global communication breaks down.",
          characters: ["Louise", "Ian", "Colonel Weber"]
        },
        {
          order: 2,
          label: "Language",
          title: "A grammar of time",
          description: "The written symbols start to behave like a way of seeing rather than just a way of speaking.",
          characters: ["Louise", "Ian"]
        },
        {
          order: 3,
          label: "Choice",
          title: "Knowing the future",
          description: "Louise understands her life story in full and still chooses it.",
          characters: ["Louise"]
        }
      ],
      relationships: [
        { source: "Louise", target: "Ian", label: "colleagues" },
        { source: "Louise", target: "Colonel Weber", label: "client / lead linguist" }
      ],
      similar: [
        { slug: "interstellar", title: "Interstellar", year: 2014, reason: "Both explore time, communication, and emotional truth under cosmic pressure." },
        { slug: "blade-runner-2049", title: "Blade Runner 2049", year: 2017, reason: "Moody future design and philosophical questions about identity and memory." }
      ]
    }
  },
  {
    slug: "blade-runner-2049",
    title: "Blade Runner 2049",
    year: 2017,
    releaseDate: "2017-10-06",
    runtimeMinutes: 164,
    rating: 8.0,
    genres: ["Science Fiction", "Mystery", "Thriller"],
    tagline: "The future is built on memories someone chose for you.",
    overview:
      "A new blade runner uncovers a buried secret that could destabilize the fragile balance between humans and replicants.",
    posterPalette: palette.bladeRunner2049,
    wikidataId: "Q173869",
    commonsCategory: "Category:Blade_Runner_2049",
    director: "Denis Villeneuve",
    writer: "Hampton Fancher",
    composer: "Hans Zimmer & Benjamin Wallfisch",
    language: "English",
    cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas", "Robin Wright"],
    analysis: {
      summary:
        "Blade Runner 2049 is a slow-burn neo-noir about identity, reproduction, and the cost of believing you may be singular.",
      spoilerSummary:
        "The central mystery shifts from proving a miracle to recognizing that meaning does not depend on being the chosen one.",
      ending:
        "K's final act is less about destiny than about grace, while Deckard finally reaches the child he has been trying to protect.",
      spoilerEnding:
        "The film closes by rejecting the obsession with singular birthright and instead centers the dignity of chosen action.",
      timeline: [
        {
          order: 1,
          label: "Investigation",
          title: "A manufactured world",
          description: "K traces a replicant case through layers of corporate secrecy and body politics.",
          characters: ["K", "Lieutenant Joshi"]
        },
        {
          order: 2,
          label: "Discovery",
          title: "A child in the data",
          description: "The evidence suggests a history that the system was never meant to acknowledge.",
          characters: ["K", "Deckard", "Joi"]
        },
        {
          order: 3,
          label: "Release",
          title: "Choosing a life",
          description: "K makes a final choice that gives the story its emotional scale.",
          characters: ["K", "Deckard"]
        }
      ],
      relationships: [
        { source: "K", target: "Joi", label: "partner" },
        { source: "K", target: "Deckard", label: "pursuer / protector" },
        { source: "K", target: "Lieutenant Joshi", label: "handler" }
      ],
      similar: [
        { slug: "dune", title: "Dune: Part One", year: 2021, reason: "Both use monumental production design to frame inherited power and uncertain identity." },
        { slug: "arrival", title: "Arrival", year: 2016, reason: "Shared interest in memory, interpretation, and what makes a person legible to themselves." }
      ]
    }
  },
  {
    slug: "dune",
    title: "Dune: Part One",
    year: 2021,
    releaseDate: "2021-10-22",
    runtimeMinutes: 155,
    rating: 8.0,
    genres: ["Science Fiction", "Adventure", "Drama"],
    tagline: "Power, prophecy, and the price of inheriting a world.",
    overview:
      "Paul Atreides is thrust into the politics of Arrakis, where the future of a planet and a family are both being rewritten.",
    posterPalette: palette.dune,
    wikidataId: "Q101064",
    commonsCategory: "Category:Dune_(2021_film)",
    director: "Denis Villeneuve",
    writer: "Jon Spaihts & Denis Villeneuve",
    composer: "Hans Zimmer",
    language: "English",
    cast: ["Timothee Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Zendaya"],
    analysis: {
      summary:
        "Dune: Part One introduces a world where ecology, religion, and empire are inseparable, with every choice carrying colonial weight.",
      spoilerSummary:
        "Paul begins to see a future built around myth, but the film keeps its focus on how power shapes the stories people are forced to live inside.",
      ending:
        "Paul and Jessica join the Fremen, stepping into a story that promises survival but not safety.",
      spoilerEnding:
        "The ending is a threshold rather than a resolution, setting up the moral question of whether prophecy is liberation or trap.",
      timeline: [
        {
          order: 1,
          label: "Arrival",
          title: "The assignment to Arrakis",
          description: "House Atreides inherits a world whose resources make it both precious and dangerous.",
          characters: ["Paul", "Jessica", "Duke Leto"]
        },
        {
          order: 2,
          label: "Betrayal",
          title: "The fall of House Atreides",
          description: "The political trap closes, forcing Paul and Jessica into the desert.",
          characters: ["Paul", "Jessica", "Duke Leto", "Baron Harkonnen"]
        },
        {
          order: 3,
          label: "Transition",
          title: "Into the Fremen world",
          description: "Paul and Jessica enter a new order of survival and belief.",
          characters: ["Paul", "Jessica", "Chani"]
        }
      ],
      relationships: [
        { source: "Paul", target: "Jessica", label: "mother / son" },
        { source: "Paul", target: "Chani", label: "allies" },
        { source: "Duke Leto", target: "Paul", label: "father / heir" }
      ],
      similar: [
        { slug: "interstellar", title: "Interstellar", year: 2014, reason: "Both are sweeping, high-craft epics about inheritance and survival across impossible distances." },
        { slug: "blade-runner-2049", title: "Blade Runner 2049", year: 2017, reason: "Both pair giant-scale worldbuilding with intimate questions about identity and purpose." }
      ]
    }
  }
];

export const sceneAtlasCollections: CollectionPreview[] = [
  {
    id: "watch-later",
    name: "Watch Later",
    description: "Stories with big ideas and heavy atmosphere.",
    movieCount: 12,
    visibility: "private"
  },
  {
    id: "epic-sci-fi",
    name: "Epic Sci-Fi",
    description: "Large-scale science fiction with memorable worldbuilding.",
    movieCount: 8,
    visibility: "shared"
  }
];

export const sceneAtlasReviews: ReviewPreview[] = [
  {
    id: "review-1",
    author: "Mina",
    rating: 5,
    title: "The analysis cards feel premium",
    body: "The spoiler toggle and timeline sections make the product feel like a research tool instead of just a movie database.",
    createdAt: "2026-07-08"
  },
  {
    id: "review-2",
    author: "Rafael",
    rating: 4,
    title: "Exactly the kind of movie rabbit hole I wanted",
    body: "I can jump between metadata, insights, and recommendations without losing the thread.",
    createdAt: "2026-07-06"
  }
];

export const sceneAtlasUsage: UsageSnapshot = {
  searchesRemaining: 5,
  analysesRemaining: 2,
  chatMessagesRemaining: 10,
  isPremium: false,
  adsEnabled: true,
  chatMessagesUsed: 0,
  chatMessagesLimit: 10
};

export function getSceneAtlasMovie(slug: string) {
  return sceneAtlasMovies.find((movie) => movie.slug === slug) ?? null;
}

export function searchSceneAtlasMovies(query: string, filters?: MovieSearchFilters) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return sceneAtlasMovies.filter((movie) => matchesMovieFilters(movie, filters));
  }

  return sceneAtlasMovies.filter((movie) => {
    const haystack = [
      movie.title,
      movie.tagline,
      movie.overview,
      movie.genres.join(" "),
      movie.cast.join(" "),
      movie.language ?? ""
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized) && matchesMovieFilters(movie, filters);
  });
}

function matchesMovieFilters(movie: MovieDetail, filters?: MovieSearchFilters) {
  if (!filters) {
    return true;
  }

  if (filters.genre && !movie.genres.includes(filters.genre)) {
    return false;
  }

  if (typeof filters.year === "number" && movie.year !== filters.year) {
    return false;
  }

  if (filters.language && (movie.language ?? "").toLowerCase() !== filters.language.trim().toLowerCase()) {
    return false;
  }

  return true;
}
