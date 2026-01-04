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
  time: string;
  status: MatchStatus;
  division: number;
  session: number;
  minute?: number;
}

const DIVISION_TEAMS = {
  1: ['Динамо А', 'Спартак А', 'ЦСКА А', 'Зенит А', 'Локомотив А', 'Краснодар А'],
  2: ['Динамо Б', 'Спартак Б', 'ЦСКА Б', 'Зенит Б', 'Локомотив Б', 'Краснодар Б'],
  3: ['Рубин', 'Ростов', 'Урал', 'Сочи', 'Химки', 'Факел'],
  4: ['Торпедо', 'Крылья', 'Амкар', 'Балтика', 'Арсенал', 'Нижний'],
};

const generateRandomScore = () => Math.floor(Math.random() * 5);
const generateRandomMinute = () => Math.floor(Math.random() * 90) + 1;

const generateMatches = (): Match[] => {
  const matches: Match[] = [];
  let id = 1;
  const currentHour = new Date().getHours();

  for (let hour = 0; hour < 24; hour++) {
    for (let matchInHour = 0; matchInHour < 4; matchInHour++) {
      const division = (matchInHour + 1) as 1 | 2 | 3 | 4;
      const session = Math.floor(hour / 6) + 1;
      const teams = DIVISION_TEAMS[division];
      
      const home = teams[Math.floor(Math.random() * teams.length)];
      let away = teams[Math.floor(Math.random() * teams.length)];
      while (away === home) {
        away = teams[Math.floor(Math.random() * teams.length)];
      }

      const matchTime = `${hour.toString().padStart(2, '0')}:${(matchInHour * 15).toString().padStart(2, '0')}`;
      
      let status: MatchStatus = 'upcoming';
      if (hour < currentHour) {
        status = 'completed';
      } else if (hour === currentHour) {
        status = 'live';
      }

      matches.push({
        id: id++,
        homeTeam: home,
        awayTeam: away,
        homeScore: status === 'upcoming' ? 0 : generateRandomScore(),
        awayScore: status === 'upcoming' ? 0 : generateRandomScore(),
        time: matchTime,
        status,
        division,
        session,
        minute: status === 'live' ? generateRandomMinute() : undefined,
      });
    }
  }

  return matches;
};

export default function Index() {
  const [matches, setMatches] = useState<Match[]>(generateMatches());
  const [activeSection, setActiveSection] = useState('main');
  const [selectedDivision, setSelectedDivision] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState('all');

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
          {match.status === 'upcoming' && match.time}
        </Badge>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
            Дивизион {match.division}
          </span>
          <span className="text-xs text-accent font-medium">
            Сессия {match.session}
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

  const filteredMatches = selectedDivision === 'all' 
    ? matches 
    : matches.filter(m => m.division === selectedDivision);

  const completedMatches = filteredMatches.filter((m) => m.status === 'completed');
  const liveMatches = filteredMatches.filter((m) => m.status === 'live');
  const upcomingMatches = filteredMatches.filter((m) => m.status === 'upcoming');

  const displayMatches = 
    activeTab === 'all' ? filteredMatches :
    activeTab === 'live' ? liveMatches :
    activeTab === 'upcoming' ? upcomingMatches :
    completedMatches;

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
                <p className="text-xs text-muted-foreground">96 матчей • 4 дивизиона</p>
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
            Круглосуточный профессиональный футбол • 96 матчей в день • 4 дивизиона • 4 сессии
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
              variant={selectedDivision === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDivision('all')}
            >
              Все дивизионы
            </Button>
            {[1, 2, 3, 4].map((div) => (
              <Button
                key={div}
                variant={selectedDivision === div ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDivision(div)}
              >
                Д{div}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[600px] rounded-lg border border-border p-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayMatches.map(renderMatch)}
          </div>
        </ScrollArea>
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
