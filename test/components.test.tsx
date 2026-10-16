import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import App from '../src/app/App';

describe('PLAYVERSE UI Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('renders PLAYVERSE wordmark, tagline, and intro', () => {
    render(<App />);

    expect(screen.getAllByText('PLAYVERSE').length).toBeGreaterThan(0);
    expect(screen.getByText(/One portal\./i)).toBeInTheDocument();
    expect(screen.getByText(/Endless play\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explore Games/i })).toBeInTheDocument();
  });

  it('renders all 6 game cards initially', () => {
    render(<App />);

    expect(screen.getAllByText('Snake Classic').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2048 Matrix').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Memory Match').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tic-Tac-Toe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rock Paper Scissors').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reaction Test').length).toBeGreaterThan(0);
  });

  it('filters games when typing in the search box', async () => {
    render(<App />);

    const searchInput = screen.getByLabelText(/Search games/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Serpent' } });
    });

    // Snake Classic description mentions 'serpent'
    expect(screen.getAllByText('Snake Classic').length).toBeGreaterThan(0);
    // 2048 should be filtered out
    expect(screen.queryByText('2048 Matrix')).toBeNull();
  });

  it('filters games when clicking a category pill', async () => {
    render(<App />);

    const puzzleBtn = screen.getByRole('tab', { name: 'Puzzle' });
    await act(async () => {
      fireEvent.click(puzzleBtn);
    });

    // 2048 is in Puzzle category
    expect(screen.getByText('2048 Matrix')).toBeInTheDocument();
    // Snake is in Arcade category, so it should not be in the grid
    expect(screen.queryByText('Snake Classic')).toBeNull();
  });

  it('opens GameArena when clicking Play Game on a card and returns back', async () => {
    render(<App />);

    // Click Play Game on Memory Match
    const playMemoryBtn = screen.getByRole('button', { name: 'Play Memory Match' });
    await act(async () => {
      fireEvent.click(playMemoryBtn);
    });

    // GameArena should be active with Back button and Play Arena tab
    expect(screen.getByRole('button', { name: /Back to Arcade/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Play Arena/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rules & Keys/i })).toBeInTheDocument();

    // Now click Back to Arcade
    const backBtn = screen.getByRole('button', { name: /Back to Arcade/i });
    await act(async () => {
      fireEvent.click(backBtn);
    });

    // Should return to homepage
    expect(screen.getByRole('button', { name: /Explore Games/i })).toBeInTheDocument();
  });

  it('toggles theme when clicking the theme button', async () => {
    render(<App />);

    const themeToggle = screen.getByLabelText(/Switch to (light|dark) mode/i);
    await act(async () => {
      fireEvent.click(themeToggle);
    });

    expect(document.documentElement.getAttribute('data-theme')).toBeTruthy();
  });
});
