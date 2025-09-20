'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { OnboardingStepProps, NBATeam } from '@/types/onboarding';
import { NBA_TEAMS } from '@/data/nba-teams';

export default function TeamSelection({ data, updateData, onNext, onPrevious, isFirstStep }: OnboardingStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<NBATeam | null>(data.favoriteTeam);

  const filteredTeams = NBA_TEAMS.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTeamSelect = (team: NBATeam | null) => {
    setSelectedTeam(team);
    updateData({ favoriteTeam: team });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Logo in top left */}
      <div className="flex justify-start">
        <img 
          src="/images/logo.png" 
          alt="CourtSide Logo" 
          className="h-12 w-auto object-contain"
        />
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Pick your team!</h1>
        <p className="text-lg text-neutral-300">Choose your favorite NBA team to personalize your experience</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
        <Input
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-lg bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-primary"
        />
      </div>

      {/* Neutral Fan Option */}
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-neutral-800 border-neutral-700 ${
          selectedTeam === null 
            ? 'ring-2 ring-primary bg-primary/10' 
            : 'hover:bg-neutral-700/50'
        }`}
        onClick={() => handleTeamSelect(null)}
      >
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-neutral-500 to-neutral-600 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">No favorite team / Neutral fan</h3>
              <p className="text-neutral-300">Enjoy unbiased commentary for all teams</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTeams.map((team) => (
          <Card
            key={team.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-neutral-800 border-neutral-700 ${
              selectedTeam?.id === team.id
                ? 'ring-2 ring-primary bg-primary/10'
                : 'hover:bg-neutral-700/50'
            }`}
            onClick={() => handleTeamSelect(team)}
            style={{
              borderColor: selectedTeam?.id === team.id ? team.primaryColor : undefined
            }}
          >
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto relative">
                  <img
                    src={team.logo}
                    alt={`${team.city} ${team.name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to team colors if logo fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg" style="background: linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})">${team.abbreviation}</div>`;
                      }
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{team.city}</h3>
                  <p className="text-sm text-neutral-300">{team.name}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {team.record.wins}-{team.record.losses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="px-8 bg-neutral-800 border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-none"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          className="px-8 bg-neutral-800 border-neutral-600 text-white hover:bg-neutral-700 transition-none"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
