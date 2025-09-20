import { NBATeam } from '@/types/onboarding';

export const NBA_TEAMS: NBATeam[] = [
  // Eastern Conference - Atlantic
  {
    id: 'boston-celtics',
    name: 'Celtics',
    city: 'Boston',
    abbreviation: 'BOS',
    logo: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg',
    primaryColor: '#007A33',
    secondaryColor: '#BA9653',
    record: { wins: 57, losses: 25 }
  },
  {
    id: 'brooklyn-nets',
    name: 'Nets',
    city: 'Brooklyn',
    abbreviation: 'BKN',
    logo: 'https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    record: { wins: 32, losses: 50 }
  },
  {
    id: 'new-york-knicks',
    name: 'Knicks',
    city: 'New York',
    abbreviation: 'NYK',
    logo: 'https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg',
    primaryColor: '#006BB6',
    secondaryColor: '#F58426',
    record: { wins: 50, losses: 32 }
  },
  {
    id: 'philadelphia-76ers',
    name: '76ers',
    city: 'Philadelphia',
    abbreviation: 'PHI',
    logo: 'https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg',
    primaryColor: '#006BB6',
    secondaryColor: '#ED174C',
    record: { wins: 47, losses: 35 }
  },
  {
    id: 'toronto-raptors',
    name: 'Raptors',
    city: 'Toronto',
    abbreviation: 'TOR',
    logo: 'https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    record: { wins: 25, losses: 57 }
  },

  // Eastern Conference - Central
  {
    id: 'chicago-bulls',
    name: 'Bulls',
    city: 'Chicago',
    abbreviation: 'CHI',
    logo: 'https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    record: { wins: 39, losses: 43 }
  },
  {
    id: 'cleveland-cavaliers',
    name: 'Cavaliers',
    city: 'Cleveland',
    abbreviation: 'CLE',
    logo: 'https://cdn.nba.com/logos/nba/1610612739/primary/L/logo.svg',
    primaryColor: '#860038',
    secondaryColor: '#FDBB30',
    record: { wins: 48, losses: 34 }
  },
  {
    id: 'detroit-pistons',
    name: 'Pistons',
    city: 'Detroit',
    abbreviation: 'DET',
    logo: 'https://cdn.nba.com/logos/nba/1610612765/primary/L/logo.svg',
    primaryColor: '#C8102E',
    secondaryColor: '#1D42BA',
    record: { wins: 14, losses: 68 }
  },
  {
    id: 'indiana-pacers',
    name: 'Pacers',
    city: 'Indiana',
    abbreviation: 'IND',
    logo: 'https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg',
    primaryColor: '#002D62',
    secondaryColor: '#FDBB30',
    record: { wins: 47, losses: 35 }
  },
  {
    id: 'milwaukee-bucks',
    name: 'Bucks',
    city: 'Milwaukee',
    abbreviation: 'MIL',
    logo: 'https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg',
    primaryColor: '#00471B',
    secondaryColor: '#EEE1C6',
    record: { wins: 49, losses: 33 }
  },

  // Eastern Conference - Southeast
  {
    id: 'atlanta-hawks',
    name: 'Hawks',
    city: 'Atlanta',
    abbreviation: 'ATL',
    logo: 'https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg',
    primaryColor: '#E03A3E',
    secondaryColor: '#C1D32F',
    record: { wins: 36, losses: 46 }
  },
  {
    id: 'charlotte-hornets',
    name: 'Hornets',
    city: 'Charlotte',
    abbreviation: 'CHA',
    logo: 'https://cdn.nba.com/logos/nba/1610612766/primary/L/logo.svg',
    primaryColor: '#1D1160',
    secondaryColor: '#00788C',
    record: { wins: 21, losses: 61 }
  },
  {
    id: 'miami-heat',
    name: 'Heat',
    city: 'Miami',
    abbreviation: 'MIA',
    logo: 'https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg',
    primaryColor: '#98002E',
    secondaryColor: '#F9A01B',
    record: { wins: 46, losses: 36 }
  },
  {
    id: 'orlando-magic',
    name: 'Magic',
    city: 'Orlando',
    abbreviation: 'ORL',
    logo: 'https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg',
    primaryColor: '#0077C0',
    secondaryColor: '#C4CED4',
    record: { wins: 47, losses: 35 }
  },
  {
    id: 'washington-wizards',
    name: 'Wizards',
    city: 'Washington',
    abbreviation: 'WAS',
    logo: 'https://cdn.nba.com/logos/nba/1610612764/primary/L/logo.svg',
    primaryColor: '#002B5C',
    secondaryColor: '#E31837',
    record: { wins: 15, losses: 67 }
  },

  // Western Conference - Northwest
  {
    id: 'denver-nuggets',
    name: 'Nuggets',
    city: 'Denver',
    abbreviation: 'DEN',
    logo: 'https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg',
    primaryColor: '#0E2240',
    secondaryColor: '#FEC524',
    record: { wins: 57, losses: 25 }
  },
  {
    id: 'minnesota-timberwolves',
    name: 'Timberwolves',
    city: 'Minnesota',
    abbreviation: 'MIN',
    logo: 'https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg',
    primaryColor: '#0C2340',
    secondaryColor: '#236192',
    record: { wins: 56, losses: 26 }
  },
  {
    id: 'oklahoma-city-thunder',
    name: 'Thunder',
    city: 'Oklahoma City',
    abbreviation: 'OKC',
    logo: 'https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg',
    primaryColor: '#007AC1',
    secondaryColor: '#EF3B24',
    record: { wins: 57, losses: 25 }
  },
  {
    id: 'portland-trail-blazers',
    name: 'Trail Blazers',
    city: 'Portland',
    abbreviation: 'POR',
    logo: 'https://cdn.nba.com/logos/nba/1610612757/primary/L/logo.svg',
    primaryColor: '#E03A3E',
    secondaryColor: '#000000',
    record: { wins: 21, losses: 61 }
  },
  {
    id: 'utah-jazz',
    name: 'Jazz',
    city: 'Utah',
    abbreviation: 'UTA',
    logo: 'https://cdn.nba.com/logos/nba/1610612762/primary/L/logo.svg',
    primaryColor: '#002B5C',
    secondaryColor: '#F9A01B',
    record: { wins: 31, losses: 51 }
  },

  // Western Conference - Pacific
  {
    id: 'golden-state-warriors',
    name: 'Warriors',
    city: 'Golden State',
    abbreviation: 'GSW',
    logo: 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg',
    primaryColor: '#1D428A',
    secondaryColor: '#FFC72C',
    record: { wins: 46, losses: 36 }
  },
  {
    id: 'los-angeles-clippers',
    name: 'Clippers',
    city: 'Los Angeles',
    abbreviation: 'LAC',
    logo: 'https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg',
    primaryColor: '#C8102E',
    secondaryColor: '#1D428A',
    record: { wins: 51, losses: 31 }
  },
  {
    id: 'los-angeles-lakers',
    name: 'Lakers',
    city: 'Los Angeles',
    abbreviation: 'LAL',
    logo: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg',
    primaryColor: '#552583',
    secondaryColor: '#FDB927',
    record: { wins: 47, losses: 35 }
  },
  {
    id: 'phoenix-suns',
    name: 'Suns',
    city: 'Phoenix',
    abbreviation: 'PHX',
    logo: 'https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg',
    primaryColor: '#1D1160',
    secondaryColor: '#E56020',
    record: { wins: 49, losses: 33 }
  },
  {
    id: 'sacramento-kings',
    name: 'Kings',
    city: 'Sacramento',
    abbreviation: 'SAC',
    logo: 'https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg',
    primaryColor: '#5A2D81',
    secondaryColor: '#63727A',
    record: { wins: 46, losses: 36 }
  },

  // Western Conference - Southwest
  {
    id: 'dallas-mavericks',
    name: 'Mavericks',
    city: 'Dallas',
    abbreviation: 'DAL',
    logo: 'https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg',
    primaryColor: '#00538C',
    secondaryColor: '#002B5E',
    record: { wins: 50, losses: 32 }
  },
  {
    id: 'houston-rockets',
    name: 'Rockets',
    city: 'Houston',
    abbreviation: 'HOU',
    logo: 'https://cdn.nba.com/logos/nba/1610612745/primary/L/logo.svg',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    record: { wins: 41, losses: 41 }
  },
  {
    id: 'memphis-grizzlies',
    name: 'Grizzlies',
    city: 'Memphis',
    abbreviation: 'MEM',
    logo: 'https://cdn.nba.com/logos/nba/1610612763/primary/L/logo.svg',
    primaryColor: '#5D76A9',
    secondaryColor: '#12173F',
    record: { wins: 27, losses: 55 }
  },
  {
    id: 'new-orleans-pelicans',
    name: 'Pelicans',
    city: 'New Orleans',
    abbreviation: 'NOP',
    logo: 'https://cdn.nba.com/logos/nba/1610612740/primary/L/logo.svg',
    primaryColor: '#0C2340',
    secondaryColor: '#C8102E',
    record: { wins: 49, losses: 33 }
  },
  {
    id: 'san-antonio-spurs',
    name: 'Spurs',
    city: 'San Antonio',
    abbreviation: 'SAS',
    logo: 'https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg',
    primaryColor: '#C4CED4',
    secondaryColor: '#000000',
    record: { wins: 22, losses: 60 }
  }
];
