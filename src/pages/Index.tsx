import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

type MatchStatus = 'completed' | 'live' | 'upcoming';

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  startTime: string;
  endTime: string;
  status: MatchStatus;
  league: string;
  division: string;
  minute?: number;
}

interface TeamStats {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

const SCHEDULE = {
  'Север': {
    'A': [
      { time: '00:00', home: 'Murmansk', away: 'Helsinki' },
      { time: '01:00', home: 'Stockholm', away: 'Bergen' },
      { time: '02:00', home: 'Murmansk', away: 'Stockholm' },
      { time: '03:00', home: 'Helsinki', away: 'Bergen' },
      { time: '04:00', home: 'Murmansk', away: 'Bergen' },
      { time: '05:00', home: 'Helsinki', away: 'Stockholm' },
    ],
    'B': [
      { time: '06:00', home: 'Glasgow', away: 'Narvik' },
      { time: '07:00', home: 'Edinburgh', away: 'Riga' },
      { time: '08:00', home: 'Glasgow', away: 'Edinburgh' },
      { time: '09:00', home: 'Narvik', away: 'Riga' },
      { time: '10:00', home: 'Glasgow', away: 'Riga' },
      { time: '11:00', home: 'Narvik', away: 'Edinburgh' },
    ],
    'C': [
      { time: '12:00', home: 'Arkhangelsk', away: 'Cork' },
      { time: '13:00', home: 'Yakutsk', away: 'Tallinn' },
      { time: '14:00', home: 'Arkhangelsk', away: 'Yakutsk' },
      { time: '15:00', home: 'Cork', away: 'Tallinn' },
      { time: '16:00', home: 'Arkhangelsk', away: 'Tallinn' },
      { time: '17:00', home: 'Cork', away: 'Yakutsk' },
    ],
    'D': [
      { time: '18:00', home: 'Winnipeg', away: 'Ottawa' },
      { time: '19:00', home: 'Norilsk', away: 'Aarhus' },
      { time: '20:00', home: 'Winnipeg', away: 'Norilsk' },
      { time: '21:00', home: 'Ottawa', away: 'Aarhus' },
      { time: '22:00', home: 'Winnipeg', away: 'Aarhus' },
      { time: '23:00', home: 'Ottawa', away: 'Norilsk' },
    ],
  },
  'Восток': {
    'A': [
      { time: '00:00', home: 'Tokyo', away: 'Seoul' },
      { time: '01:00', home: 'Shanghai', away: 'Manila' },
      { time: '02:00', home: 'Osaka', away: 'Vladivostok' },
      { time: '03:00', home: 'Khabarovsk', away: 'Brisbane' },
      { time: '04:00', home: 'Tagum', away: 'Singapore' },
      { time: '05:00', home: 'Hong Kong', away: 'Dili' },
    ],
    'B': [
      { time: '06:00', home: 'Beijing', away: 'Cebu' },
      { time: '07:00', home: 'Canberra', away: 'Magadan' },
      { time: '08:00', home: 'Tokyo', away: 'Shanghai' },
      { time: '09:00', home: 'Manila', away: 'Osaka' },
      { time: '10:00', home: 'Vladivostok', away: 'Khabarovsk' },
      { time: '11:00', home: 'Brisbane', away: 'Tagum' },
    ],
    'C': [
      { time: '12:00', home: 'Singapore', away: 'Hong Kong' },
      { time: '13:00', home: 'Dili', away: 'Beijing' },
      { time: '14:00', home: 'Cebu', away: 'Canberra' },
      { time: '15:00', home: 'Magadan', away: 'Tokyo' },
      { time: '16:00', home: 'Seoul', away: 'Manila' },
      { time: '17:00', home: 'Shanghai', away: 'Osaka' },
    ],
    'D': [
      { time: '18:00', home: 'Vladivostok', away: 'Brisbane' },
      { time: '19:00', home: 'Khabarovsk', away: 'Tagum' },
      { time: '20:00', home: 'Singapore', away: 'Dili' },
      { time: '21:00', home: 'Hong Kong', away: 'Beijing' },
      { time: '22:00', home: 'Cebu', away: 'Magadan' },
      { time: '23:00', home: 'Canberra', away: 'Seoul' },
    ],
  },
  'Юг': {
    'A': [
      { time: '00:00', home: 'Krasnodar', away: 'Cairo' },
      { time: '01:00', home: 'Damascus', away: 'Aden' },
      { time: '02:00', home: 'Hanoi', away: 'Melbourne' },
      { time: '03:00', home: 'Lima', away: 'Belem' },
      { time: '04:00', home: 'Palermo', away: 'Baku' },
      { time: '05:00', home: 'Sevastopol', away: 'Tampa' },
    ],
    'B': [
      { time: '06:00', home: 'Plymouth', away: 'Makhachkala' },
      { time: '07:00', home: 'Lahore', away: 'Muscat' },
      { time: '08:00', home: 'Krasnodar', away: 'Damascus' },
      { time: '09:00', home: 'Aden', away: 'Hanoi' },
      { time: '10:00', home: 'Melbourne', away: 'Lima' },
      { time: '11:00', home: 'Belem', away: 'Palermo' },
    ],
    'C': [
      { time: '12:00', home: 'Baku', away: 'Sevastopol' },
      { time: '13:00', home: 'Tampa', away: 'Plymouth' },
      { time: '14:00', home: 'Makhachkala', away: 'Lahore' },
      { time: '15:00', home: 'Muscat', away: 'Krasnodar' },
      { time: '16:00', home: 'Cairo', away: 'Aden' },
      { time: '17:00', home: 'Damascus', away: 'Hanoi' },
    ],
    'D': [
      { time: '18:00', home: 'Melbourne', away: 'Belem' },
      { time: '19:00', home: 'Lima', away: 'Palermo' },
      { time: '20:00', home: 'Baku', away: 'Tampa' },
      { time: '21:00', home: 'Sevastopol', away: 'Plymouth' },
      { time: '22:00', home: 'Makhachkala', away: 'Muscat' },
      { time: '23:00', home: 'Lahore', away: 'Cairo' },
    ],
  },
  'Запад': {
    'A': [
      { time: '00:00', home: 'Chicago', away: 'Turin' },
      { time: '01:00', home: 'Cadiz', away: 'Kingston' },
      { time: '02:00', home: 'Mexico', away: 'Austin' },
      { time: '03:00', home: 'Tucson', away: 'Reno' },
      { time: '04:00', home: 'Toronto', away: 'Kursk' },
      { time: '05:00', home: 'Minsk', away: 'Essen' },
    ],
    'B': [
      { time: '06:00', home: 'Cologne', away: 'Verdun' },
      { time: '07:00', home: 'Dakar', away: 'Tunis' },
      { time: '08:00', home: 'Chicago', away: 'Cadiz' },
      { time: '09:00', home: 'Kingston', away: 'Mexico' },
      { time: '10:00', home: 'Austin', away: 'Tucson' },
      { time: '11:00', home: 'Reno', away: 'Toronto' },
    ],
    'C': [
      { time: '12:00', home: 'Kursk', away: 'Minsk' },
      { time: '13:00', home: 'Essen', away: 'Cologne' },
      { time: '14:00', home: 'Verdun', away: 'Dakar' },
      { time: '15:00', home: 'Tunis', away: 'Chicago' },
      { time: '16:00', home: 'Turin', away: 'Kingston' },
      { time: '17:00', home: 'Cadiz', away: 'Mexico' },
    ],
    'D': [
      { time: '18:00', home: 'Austin', away: 'Reno' },
      { time: '19:00', home: 'Tucson', away: 'Toronto' },
      { time: '20:00', home: 'Kursk', away: 'Essen' },
      { time: '21:00', home: 'Minsk', away: 'Cologne' },
      { time: '22:00', home: 'Verdun', away: 'Tunis' },
      { time: '23:00', home: 'Dakar', away: 'Turin' },
    ],
  },
};

const generateRandomScore = () => Math.floor(Math.random() * 5);

const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMins = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMins / 60) % 24;
  const newMins = totalMins % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

const generateMatches = (): Match[] => {
  const matches: Match[] = [];
  let id = 1;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  Object.entries(SCHEDULE).forEach(([league, divisions]) => {
    Object.entries(divisions).forEach(([division, games]) => {
      games.forEach((game) => {
        const [startHour, startMin] = game.time.split(':').map(Number);
        const startTotalMinutes = startHour * 60 + startMin;
        const endTotalMinutes = startTotalMinutes + 50;
        const endTime = addMinutesToTime(game.time, 50);

        let status: MatchStatus = 'upcoming';
        let minute: number | undefined = undefined;

        if (currentTotalMinutes >= endTotalMinutes) {
          status = 'completed';
        } else if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes) {
          status = 'live';
          minute = currentTotalMinutes - startTotalMinutes;
        }

        matches.push({
          id: id++,
          homeTeam: game.home,
          awayTeam: game.away,
          homeScore: status === 'upcoming' ? 0 : generateRandomScore(),
          awayScore: status === 'upcoming' ? 0 : generateRandomScore(),
          startTime: game.time,
          endTime,
          status,
          league,
          division,
          minute,
        });
      });
    });
  });

  return matches.sort((a, b) => a.startTime.localeCompare(b.startTime));
};

const calculateStats = (matches: Match[], league: string): TeamStats[] => {
  const statsMap = new Map<string, TeamStats>();
  
  const leagueMatches = matches.filter(m => m.league === league && m.status === 'completed');
  
  leagueMatches.forEach(match => {
    [match.homeTeam, match.awayTeam].forEach(team => {
      if (!statsMap.has(team)) {
        statsMap.set(team, {
          team,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDiff: 0,
          points: 0,
        });
      }
    });

    const homeStats = statsMap.get(match.homeTeam)!;
    const awayStats = statsMap.get(match.awayTeam)!;

    homeStats.played++;
    awayStats.played++;
    homeStats.goalsFor += match.homeScore;
    homeStats.goalsAgainst += match.awayScore;
    awayStats.goalsFor += match.awayScore;
    awayStats.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeStats.wins++;
      homeStats.points += 3;
      awayStats.losses++;
    } else if (match.homeScore < match.awayScore) {
      awayStats.wins++;
      awayStats.points += 3;
      homeStats.losses++;
    } else {
      homeStats.draws++;
      awayStats.draws++;
      homeStats.points++;
      awayStats.points++;
    }

    homeStats.goalDiff = homeStats.goalsFor - homeStats.goalsAgainst;
    awayStats.goalDiff = awayStats.goalsFor - awayStats.goalsAgainst;
  });

  return Array.from(statsMap.values())
    .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
};

export default function Index() {
  const [matches, setMatches] = useState<Match[]>(generateMatches());
  const [activeSection, setActiveSection] = useState('main');
  const [selectedLeague, setSelectedLeague] = useState<string | 'all'>('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const interval = setInterval(() => {
      setMatches((prevMatches) =>
        prevMatches.map((match) => {
          if (match.status === 'live') {
            const newMinute = (match.minute || 0) + 1;
            if (newMinute >= 50) {
              return {
                ...match,
                status: 'completed' as MatchStatus,
                minute: undefined,
              };
            }
            return {
              ...match,
              homeScore: Math.random() > 0.97 ? match.homeScore + 1 : match.homeScore,
              awayScore: Math.random() > 0.97 ? match.awayScore + 1 : match.awayScore,
              minute: newMinute,
            };
          }
          return match;
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const renderMatch = (match: Match) => (
    <Card
      key={match.id}
      className="p-4 bg-card border-border hover:border-accent/50 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge
          variant={match.status === 'live' ? 'default' : 'secondary'}
          className={
            match.status === 'live'
              ? 'bg-red-600 text-white animate-pulse'
              : match.status === 'completed'
              ? 'bg-muted text-muted-foreground'
              : 'bg-secondary text-secondary-foreground'
          }
        >
          {match.status === 'live' && `${match.minute}'`}
          {match.status === 'completed' && 'FT'}
          {match.status === 'upcoming' && `${match.startTime}–${match.endTime}`}
        </Badge>
        <div className="flex items-center gap-2">
          <span className="text-xs text-accent font-bold tracking-wider">
            {match.league}-{match.division}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-base mb-0.5">{match.homeTeam}</div>
          <div className="font-semibold text-base text-muted-foreground">{match.awayTeam}</div>
        </div>

        <div className="text-right ml-4">
          <div className="text-2xl font-bold font-['Montserrat'] tracking-tight">
            {match.status !== 'upcoming' ? match.homeScore : '-'}
          </div>
          <div className="text-2xl font-bold font-['Montserrat'] tracking-tight text-muted-foreground">
            {match.status !== 'upcoming' ? match.awayScore : '-'}
          </div>
        </div>
      </div>
    </Card>
  );

  const filteredMatches = selectedLeague === 'all' 
    ? matches 
    : matches.filter(m => m.league === selectedLeague);

  const completedMatches = filteredMatches.filter((m) => m.status === 'completed');
  const liveMatches = filteredMatches.filter((m) => m.status === 'live');
  const upcomingMatches = filteredMatches.filter((m) => m.status === 'upcoming');

  const displayMatches = 
    activeTab === 'all' ? filteredMatches :
    activeTab === 'live' ? liveMatches :
    activeTab === 'upcoming' ? upcomingMatches :
    completedMatches;

  const renderDivisionsContent = () => {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(SCHEDULE).map(([league, divisions]) => (
          <div key={league}>
            <h3 className="text-2xl font-bold font-['Montserrat'] mb-4 text-accent">{league}</h3>
            {Object.entries(divisions).map(([divName, games]) => {
              const teams = Array.from(new Set(games.flatMap(g => [g.home, g.away])));
              return (
                <Card key={divName} className="p-4 mb-4 bg-card border-border">
                  <h4 className="font-semibold text-lg mb-3">Дивизион {divName}</h4>
                  <div className="space-y-2">
                    {teams.map((team, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Icon name="Shield" size={14} className="text-muted-foreground" />
                        <span>{team}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderStatsContent = () => {
    return (
      <div className="space-y-8">
        {['Север', 'Восток', 'Юг', 'Запад'].map(league => {
          const stats = calculateStats(matches, league);
          return (
            <div key={league}>
              <h3 className="text-2xl font-bold font-['Montserrat'] mb-4 text-accent">
                Таблица лиги {league}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-semibold">#</th>
                      <th className="text-left p-3 text-sm font-semibold">Команда</th>
                      <th className="text-center p-3 text-sm font-semibold">И</th>
                      <th className="text-center p-3 text-sm font-semibold">В</th>
                      <th className="text-center p-3 text-sm font-semibold">Н</th>
                      <th className="text-center p-3 text-sm font-semibold">П</th>
                      <th className="text-center p-3 text-sm font-semibold">ЗМ</th>
                      <th className="text-center p-3 text-sm font-semibold">ПМ</th>
                      <th className="text-center p-3 text-sm font-semibold">РМ</th>
                      <th className="text-center p-3 text-sm font-semibold bg-accent/10">О</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat, idx) => (
                      <tr key={stat.team} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 text-sm text-muted-foreground">{idx + 1}</td>
                        <td className="p-3 text-sm font-medium">{stat.team}</td>
                        <td className="p-3 text-sm text-center">{stat.played}</td>
                        <td className="p-3 text-sm text-center text-green-500">{stat.wins}</td>
                        <td className="p-3 text-sm text-center text-muted-foreground">{stat.draws}</td>
                        <td className="p-3 text-sm text-center text-red-500">{stat.losses}</td>
                        <td className="p-3 text-sm text-center">{stat.goalsFor}</td>
                        <td className="p-3 text-sm text-center">{stat.goalsAgainst}</td>
                        <td className="p-3 text-sm text-center font-medium">{stat.goalDiff > 0 ? '+' : ''}{stat.goalDiff}</td>
                        <td className="p-3 text-sm text-center font-bold bg-accent/10">{stat.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded flex items-center justify-center">
                <Icon name="Trophy" className="text-accent-foreground" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-['Montserrat'] tracking-tight">IIFL</h1>
                <p className="text-xs text-muted-foreground">96 матчей • 4 лиги • 16 дивизионов</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {['main', 'schedule', 'divisions', 'stats', 'news', 'live'].map((section) => {
                const labels = {
                  main: 'Главная',
                  schedule: 'Расписание',
                  divisions: 'Дивизоны',
                  stats: 'Статистика',
                  news: 'Новости',
                  live: 'Лайв',
                };
                return (
                  <Button
                    key={section}
                    variant={activeSection === section ? 'default' : 'ghost'}
                    className="font-medium"
                    onClick={() => setActiveSection(section)}
                  >
                    {labels[section as keyof typeof labels]}
                  </Button>
                );
              })}
            </div>

            <Button variant="outline" size="icon" className="md:hidden">
              <Icon name="Menu" size={20} />
            </Button>
          </div>
        </div>
      </nav>

      <div className="relative h-[250px] bg-gradient-to-br from-accent/20 via-background to-background border-b border-border">
        <div className="container mx-auto px-6 h-full flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-bold font-['Montserrat'] mb-3 tracking-tight">
            Международная Футбольная Лига
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl font-light">
            Круглосуточный профессиональный футбол • 96 матчей в день • 50 минут каждый
          </p>
          <div className="flex gap-3 mt-4">
            <Badge className="bg-accent/20 text-accent border-accent/30">
              <Icon name="Radio" size={14} className="mr-1" />
              {liveMatches.length} лайв
            </Badge>
            <Badge variant="secondary">
              <Icon name="CheckCircle2" size={14} className="mr-1" />
              {completedMatches.length} завершено
            </Badge>
            <Badge variant="outline">
              <Icon name="Clock" size={14} className="mr-1" />
              {upcomingMatches.length} предстоящих
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {activeSection === 'main' && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="bg-muted w-full justify-start">
                  <TabsTrigger value="all">Все ({filteredMatches.length})</TabsTrigger>
                  <TabsTrigger value="live">
                    <Icon name="Radio" size={16} className="mr-2" />
                    Лайв ({liveMatches.length})
                  </TabsTrigger>
                  <TabsTrigger value="upcoming">Предстоящие ({upcomingMatches.length})</TabsTrigger>
                  <TabsTrigger value="completed">Завершенные ({completedMatches.length})</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2">
                <Button
                  variant={selectedLeague === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLeague('all')}
                >
                  Все
                </Button>
                {['Север', 'Восток', 'Юг', 'Запад'].map((league) => (
                  <Button
                    key={league}
                    variant={selectedLeague === league ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLeague(league)}
                  >
                    {league}
                  </Button>
                ))}
              </div>
            </div>

            <ScrollArea className="h-[600px] rounded-lg border border-border p-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayMatches.map(renderMatch)}
              </div>
            </ScrollArea>
          </>
        )}

        {activeSection === 'divisions' && (
          <div>
            <h2 className="text-3xl font-bold font-['Montserrat'] mb-6">Дивизионы</h2>
            {renderDivisionsContent()}
          </div>
        )}

        {activeSection === 'stats' && (
          <div>
            <h2 className="text-3xl font-bold font-['Montserrat'] mb-6">Статистика</h2>
            {renderStatsContent()}
          </div>
        )}

        {(activeSection === 'schedule' || activeSection === 'news' || activeSection === 'live') && (
          <div className="text-center py-20">
            <Icon name="Construction" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold font-['Montserrat'] mb-2">Раздел в разработке</h3>
            <p className="text-muted-foreground">Скоро здесь появится контент</p>
          </div>
        )}
      </div>

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                <Icon name="Trophy" className="text-accent-foreground" size={20} />
              </div>
              <span className="font-bold font-['Montserrat']">IIFL</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Международная Футбольная Лига. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
