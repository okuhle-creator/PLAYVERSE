import { test, expect } from '@playwright/test';

test.describe('GLITCH HUNT: End-to-End Gameplay Loop', () => {
  test('Complete deduction investigation and submit score to leaderboard', async ({ page }) => {
    // 1. Open the application
    await page.goto('/');

    // Verify editorial title and briefing
    await expect(page.locator('.brand-title')).toContainText('GLITCH HUNT');
    await expect(page.getByText('Incident Briefing: Five Signals. One Contradiction.')).toBeVisible();

    // 2. Start an investigation
    const startBtn = page.getByRole('button', { name: 'Start Investigation' });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // 3. Verify exactly five event cards appear
    const eventCards = page.locator('.event-card');
    await expect(eventCards).toHaveCount(5);

    // 4. Select the third event card
    const targetCard = eventCards.nth(2);
    await targetCard.click();
    await expect(targetCard).toHaveClass(/selected/);

    // 5. Commit deduction
    const commitBtn = page.getByRole('button', { name: 'Commit Deduction' });
    await expect(commitBtn).toBeEnabled();
    await commitBtn.click();

    // 6. Result Panel appears with forensic reasoning
    const resultPanel = page.locator('.result-panel');
    await expect(resultPanel).toBeVisible();
    await expect(page.locator('.explanation-text')).not.toBeEmpty();

    // 7. If deduction was correct, submit alias to leaderboard
    const aliasInput = page.getByPlaceholder('Operator Alias (e.g. Lynx-7)');
    if (await aliasInput.isVisible()) {
      await aliasInput.fill('E2E-Pilot');
      const submitLbBtn = page.getByRole('button', { name: 'Submit to Leaderboard' });
      await submitLbBtn.click();

      // Verify success confirmation
      await expect(page.getByText(/Verified server score recorded on public leaderboard/i)).toBeVisible();

      // Verify alias appears in the leaderboard table
      const leaderboardTable = page.locator('.leaderboard-table');
      await expect(leaderboardTable).toContainText('E2E-Pilot');
    }

    // 8. Verify "Run It Back" replay button is functional
    const replayBtn = page.getByRole('button', { name: 'Run It Back (Next Case)' });
    await expect(replayBtn).toBeVisible();
    await replayBtn.click();

    // Verify new investigation starts with fresh cards
    await expect(page.locator('.event-card')).toHaveCount(5);
  });
});
