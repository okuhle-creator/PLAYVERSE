import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameCategory, GameId, GameMetadata, HighScores, RecentlyPlayedItem, Theme } from './types';
import { GAMES_CATALOG, getGameById } from '../services/gamesRegistry';
import { StorageService } from '../services/storage';
import { Sound } from '../services/sound';
import { Navbar } from '../components/Navbar';
import { HeroIntro } from '../components/HeroIntro';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { FeaturedSection } from '../components/FeaturedSection';
import { GameCard } from '../components/GameCard';
import { RecentlyPlayed } from '../components/RecentlyPlayed';
import { Footer } from '../components/Footer';
import { GameArena } from '../games/GameArena';
import { SearchX, LayoutGrid } from 'lucide-react';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => StorageService.getTheme());
  const [isMuted, setIsMuted] = useState<boolean>(() => StorageService.isSoundMuted());
  const [activeGame, setActiveGame] = useState<GameMetadata | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [highScores, setHighScores] = useState<HighScores>(() => StorageService.getHighScores());
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>(() =>
    StorageService.getRecentlyPlayed()
  );

  // Sync theme with DOM root
  useEffect(() => {
    StorageService.setTheme(theme);
  }, [theme]);

  // Support URL hash routing for direct game launch (e.g. #snake, #2048)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim() as GameId;
      if (hash) {
        const matched = getGameById(hash);
        if (matched) {
          setActiveGame(matched);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      setActiveGame(null);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    Sound.click();
  };

  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    StorageService.setSoundMuted(nextMuted);
    if (!nextMuted) {
      Sound.click();
    }
  };

  const handlePlayGame = useCallback((game: GameMetadata) => {
    Sound.click();
    setActiveGame(game);
    window.location.hash = game.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Record into recently played
    const updated = StorageService.addRecentlyPlayed(game.id);
    setRecentlyPlayed(updated);
    setHighScores(StorageService.getHighScores());
  }, []);

  const handleBackToArcade = useCallback(() => {
    Sound.click();
    setActiveGame(null);
    window.location.hash = '';
    // Reload high scores and recently played on return
    setHighScores(StorageService.getHighScores());
    setRecentlyPlayed(StorageService.getRecentlyPlayed());
  }, []);

  const handleClearRecent = () => {
    StorageService.clearRecentlyPlayed();
    setRecentlyPlayed([]);
    Sound.click();
  };

  const handleExploreClick = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateCategories = () => {
    if (activeGame) setActiveGame(null);
    setSelectedCategory('all');
    setTimeout(() => {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleNavigateAllGames = () => {
    if (activeGame) setActiveGame(null);
    setSelectedCategory('all');
    setSearchQuery('');
    setTimeout(() => {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Filter games based on search and category
  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter((game) => {
      const matchesCategory =
        selectedCategory === 'all' || game.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        game.title.toLowerCase().includes(q) ||
        game.description.toLowerCase().includes(q) ||
        game.category.toLowerCase().includes(q) ||
        game.tagline.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredGames = useMemo(() => {
    return GAMES_CATALOG.filter((g) => g.featured);
  }, []);

  const gamesMap = useMemo(() => {
    const map: Record<string, GameMetadata> = {};
    GAMES_CATALOG.forEach((g) => {
      map[g.id] = g;
    });
    return map;
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* A11y skip to content link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Primary Navigation */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onNavigateHome={handleBackToArcade}
        onNavigateCategories={handleNavigateCategories}
        onNavigateAllGames={handleNavigateAllGames}
      />

      <main id="main-content" className="flex-1 w-full flex flex-col">
        {activeGame ? (
          <GameArena
            game={activeGame}
            highScore={highScores[activeGame.id]}
            onBack={handleBackToArcade}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Concise Hero Section */}
            <HeroIntro
              onExploreClick={handleExploreClick}
              totalGames={GAMES_CATALOG.length}
            />

            <div className="container py-6 space-y-6">
              {/* Recently Played Section (Real local history) */}
              <RecentlyPlayed
                recentlyPlayed={recentlyPlayed}
                gamesMap={gamesMap}
                onPlay={handlePlayGame}
                onClear={handleClearRecent}
              />

              {/* Featured Curated Spotlight */}
              {searchQuery === '' && selectedCategory === 'all' && (
                <FeaturedSection
                  featuredGames={featuredGames}
                  highScores={highScores}
                  onPlay={handlePlayGame}
                />
              )}

              {/* Functional Search and Category Filters */}
              <SearchAndFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                resultsCount={filteredGames.length}
              />

              {/* Complete Game Library Grid */}
              <section className="pb-12" aria-label="Arcade Games Library">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LayoutGrid size={16} className="text-[var(--color-accent)]" />
                    <h2 className="text-sm font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                      {selectedCategory === 'all' ? 'Arcade Library' : `${selectedCategory} Collection`}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    Showing {filteredGames.length} of {GAMES_CATALOG.length} games
                  </span>
                </div>

                {filteredGames.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        highScore={highScores[game.id]}
                        onPlay={handlePlayGame}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] flex flex-col items-center justify-center">
                    <SearchX size={36} className="text-[var(--text-muted)] mb-3" />
                    <h3 className="text-lg font-bold mb-1">No Games Found</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-sm">
                      We couldn't find any games matching "{searchQuery}". Try searching for another genre or clearing your filter.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
