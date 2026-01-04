import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type MatchStatus = 'completed' | 'live' | 'upcoming';

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  time: string;
  status: MatchStatus;
  division: string;
  minute?: number;
}

const TEAMS = [
  'Динамо', 'Спартак', 'ЦСКА', 'Зенит', 'Локомотив', 'Краснодар',
  'Рубин', 'Ростов', 'Урал', 'Сочи', 'Химки', 'Факел'
];

const DIVISIONS = ['Премьер', 'Первая', 'Вторая'];

const generateRandomScore = () => Math.floor(Math.random() * 5);
const generateRandomMinute = () => Math.floor(Math.random() * 90) + 1;

const generateMatches = (): Match[] => {
  const matches: Match[] = [];
  let id = 1;

  for (let i = 0; i < 6; i++) {
    const home = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    let away = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    while (away === home) {
      away = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    }

    const hour = 10 + i * 2;
    const status: MatchStatus = i < 2 ? 'completed' : i < 4 ? 'live' : 'upcoming';

    matches.push({
      id: id++,
      homeTeam: home,
      awayTeam: away,
      homeScore: status === 'upcoming' ? 0 : generateRandomScore(),
      awayScore: status === 'upcoming' ? 0 : generateRandomScore(),
      time: `${hour}:00`,
      status,
      division: DIVISIONS[Math.floor(Math.random() * DIVISIONS.length)],
      minute: status === 'live' ? generateRandomMinute() : undefined,
    });
  }

  return matches;
};

export default function Index() {
  const [matches, setMatches] = useState<Match[]>(generateMatches());
  const [activeSection, setActiveSection] = useState('main');

  useEffect(() => {
    const interval = setInterval(() => {
      setMatches((prevMatches) =>
        prevMatches.map((match) => {
          if (match.status === 'live') {
            const newMinute = (match.minute || 0) + 1;
            if (newMinute >= 90) {
              return {
                ...match,
                status: 'completed' as MatchStatus,
                minute: undefined,
              };
            }
            return {
              ...match,
              homeScore: Math.random() > 0.95 ? match.homeScore + 1 : match.homeScore,
              awayScore: Math.random() > 0.95 ? match.awayScore + 1 : match.awayScore,
              minute: newMinute,
            };
          }
          return match;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const renderMatch = (match: Match) => (
    <Card
      key={match.id}
      className="p-6 bg-card border-border hover:border-accent/50 transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="flex items-center justify-between mb-4">
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
          {match.status === 'completed' && 'Завершен'}
          {match.status === 'upcoming' && match.time}
        </Badge>
        <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
          {match.division} дивизион
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-lg mb-1">{match.homeTeam}</div>
          <div className="font-semibold text-lg text-muted-foreground">{match.awayTeam}</div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold font-['Montserrat'] tracking-tight">
            {match.status !== 'upcoming' ? match.homeScore : '-'}
          </div>
          <div className="text-3xl font-bold font-['Montserrat'] tracking-tight text-muted-foreground">
            {match.status !== 'upcoming' ? match.awayScore : '-'}
          </div>
        </div>
      </div>
    </Card>
  );

  const completedMatches = matches.filter((m) => m.status === 'completed');
  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded flex items-center justify-center">
                <Icon name="Trophy" className="text-accent-foreground" size={24} />
              </div>
              <h1 className="text-2xl font-bold font-['Montserrat'] tracking-tight">IIFL</h1>
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

      <div className="relative h-[300px] bg-gradient-to-br from-accent/20 via-background to-background border-b border-border">
        <div className="container mx-auto px-6 h-full flex flex-col justify-center">
          <h2 className="text-5xl md:text-6xl font-bold font-['Montserrat'] mb-4 tracking-tight">
            Международная Футбольная Лига
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl font-light">
            Круглосуточный профессиональный футбол. Живые трансляции и результаты в режиме реального времени.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-muted">
            <TabsTrigger value="all">Все матчи</TabsTrigger>
            <TabsTrigger value="live">
              <Icon name="Radio" size={16} className="mr-2" />
              Лайв ({liveMatches.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
            <TabsTrigger value="completed">Завершенные</TabsTrigger>
          </TabsList>
        </Tabs>

        {liveMatches.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <h3 className="text-2xl font-bold font-['Montserrat']">Сейчас играют</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">{liveMatches.map(renderMatch)}</div>
          </div>
        )}

        {upcomingMatches.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Icon name="Clock" size={24} className="text-accent" />
              <h3 className="text-2xl font-bold font-['Montserrat']">Предстоящие матчи</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">{upcomingMatches.map(renderMatch)}</div>
          </div>
        )}

        {completedMatches.length > 0 && (
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Icon name="CheckCircle2" size={24} className="text-muted-foreground" />
              <h3 className="text-2xl font-bold font-['Montserrat']">Завершенные матчи</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">{completedMatches.map(renderMatch)}</div>
          </div>
        )}
      </div>

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8">
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
