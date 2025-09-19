export const crestMap: Record<string, string> = {
  // English Premier League
  "Manchester City": "/crests/manchester-city.svg",
  "Manchester United": "/crests/manchester-united.svg",
  "Liverpool": "/crests/liverpool.svg",
  "Arsenal": "/crests/arsenal.svg",
  "Chelsea": "/crests/chelsea.svg",
  "Tottenham Hotspur": "/crests/tottenham.svg",
  "Newcastle United": "/crests/newcastle.svg",

  // La Liga
  "Real Madrid": "/crests/real-madrid.svg",
  "FC Barcelona": "/crests/barcelona.svg",
  "Atlético Madrid": "/crests/atletico-madrid.svg",
  "Sevilla": "/crests/sevilla.svg",

  // Serie A
  "Juventus": "/crests/juventus.svg",
  "Inter": "/crests/inter.svg",
  "AC Milan": "/crests/ac-milan.svg",
  "Napoli": "/crests/napoli.svg",

  // Bundesliga
  "Bayern Munich": "/crests/bayern.svg",
  "Borussia Dortmund": "/crests/dortmund.svg",
  "RB Leipzig": "/crests/rb-leipzig.svg",
  "Bayer Leverkusen": "/crests/leverkusen.svg",

  // Ligue 1
  "Paris Saint-Germain": "/crests/psg.svg",
  "Olympique de Marseille": "/crests/om.svg",
  "Lyon": "/crests/lyon.svg",
};

export function getCrestPath(teamName?: string | null, fallback?: string) {
  if (fallback && fallback !== "") return fallback;
  if (!teamName) return "/placeholder.svg";
  return crestMap[teamName] || "/placeholder.svg";
}
