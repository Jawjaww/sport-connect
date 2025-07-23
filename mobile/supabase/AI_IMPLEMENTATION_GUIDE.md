# 🤖 IA Features Implementation Guide

> Guide d'implémentation des fonctionnalités IA pour SportConnect

## 🎯 Quick Start IA

### 1. Chimie entre Joueurs (Player Chemistry)

**Service TypeScript à créer :**
```typescript
// src/services/playerChemistry.service.ts
export class PlayerChemistryService {
  
  async calculateChemistry(playerA: string, playerB: string, teamId: string): Promise<number> {
    // 1. Récupérer les matchs où ils ont joué ensemble
    const commonMatches = await this.getCommonMatches(playerA, playerB, teamId);
    
    // 2. Comparer leurs performances ensemble vs séparément
    const performanceTogether = await this.getPerformanceTogether(playerA, playerB, commonMatches);
    const performanceSeparate = await this.getPerformanceSeparate(playerA, playerB, teamId);
    
    // 3. Analyser leurs évaluations mutuelles
    const mutualRatings = await this.getMutualRatings(playerA, playerB);
    
    // 4. Calculer le score de chimie (0-10)
    const chemistryScore = this.computeChemistryScore({
      performanceTogether,
      performanceSeparate,
      mutualRatings,
      matchesCount: commonMatches.length
    });
    
    // 5. Sauvegarder en BDD
    await this.saveChemistryScore(playerA, playerB, teamId, chemistryScore);
    
    return chemistryScore;
  }
  
  private computeChemistryScore(data: ChemistryData): number {
    // Algorithme à implémenter :
    // - Performance ensemble > séparément = bonus
    // - Notes mutuelles élevées = bonus  
    // - Nombre de matchs = facteur de confiance
    // - Stabilité des performances = bonus
    
    const performanceBonus = data.performanceTogether > data.performanceSeparate ? 2 : -1;
    const ratingBonus = data.mutualRatings > 7 ? 1.5 : 0;
    const experienceBonus = Math.min(data.matchesCount * 0.1, 2);
    
    return Math.min(10, Math.max(0, 5 + performanceBonus + ratingBonus + experienceBonus));
  }
}
```

### 2. Insights Automatiques (AI Insights)

**Service d'analyse :**
```typescript
// src/services/aiInsights.service.ts
export class AIInsightsService {
  
  async generatePerformanceTrend(playerId: string): Promise<AIInsight> {
    // Analyser les 5 derniers matchs
    const recentRatings = await this.getRecentRatings(playerId, 5);
    
    // Détecter tendances
    const trends = this.detectTrends(recentRatings);
    
    if (trends.improving) {
      return {
        insight_type: 'performance_trend',
        title: `📈 ${trends.metric} en progression`,
        content: `Amélioration de +${trends.improvement}% sur ${trends.period} matchs`,
        confidence_score: trends.confidence,
        data: trends
      };
    }
    
    if (trends.declining) {
      return {
        insight_type: 'performance_trend', 
        title: `📉 Attention: ${trends.metric} en baisse`,
        content: `Baisse de ${trends.decline}% - peut-être de la fatigue ?`,
        confidence_score: trends.confidence,
        data: trends
      };
    }
    
    return null; // Pas de tendance notable
  }
  
  async generateTeamChemistryInsight(teamId: string): Promise<AIInsight[]> {
    const chemistry = await this.getTeamChemistryMatrix(teamId);
    const insights: AIInsight[] = [];
    
    // Détecter les meilleures paires
    const bestPairs = chemistry.filter(c => c.chemistry_score > 8);
    if (bestPairs.length > 0) {
      insights.push({
        insight_type: 'chemistry_analysis',
        title: '🤝 Excellentes chimies détectées',
        content: `${bestPairs.length} paires fonctionnent très bien ensemble`,
        data: { best_pairs: bestPairs }
      });
    }
    
    // Détecter les tensions
    const tensions = chemistry.filter(c => c.chemistry_score < 3);
    if (tensions.length > 0) {
      insights.push({
        insight_type: 'team_dynamics',
        title: '⚠️ Tensions détectées',
        content: 'Certaines associations semblent difficiles',
        data: { problem_pairs: tensions }
      });
    }
    
    return insights;
  }
}
```

### 3. Sélection Automatique (AI Selection)

**Service de recommandation :**
```typescript
// src/services/aiSelection.service.ts
export class AISelectionService {
  
  async recommendLineup(matchId: string, availablePlayers: string[]): Promise<AISelection> {
    const match = await this.getMatch(matchId);
    const team = await this.getTeam(match.team_id);
    
    // 1. Analyser les patterns de participation
    const patterns = await this.getParticipationPatterns(availablePlayers, team.id);
    
    // 2. Calculer la chimie entre joueurs disponibles
    const chemistry = await this.getChemistryMatrix(availablePlayers, team.id);
    
    // 3. Considérer les performances récentes
    const recentPerformances = await this.getRecentPerformances(availablePlayers);
    
    // 4. Optimiser la sélection
    const selection = this.optimizeSelection({
      availablePlayers,
      patterns,
      chemistry,
      recentPerformances,
      matchType: match.tournament_id ? 'tournament' : 'friendly'
    });
    
    // 5. Sauvegarder la recommandation
    await this.saveAISelection({
      match_id: matchId,
      team_id: team.id,
      selected_players: selection.players,
      selection_criteria: selection.criteria,
      ai_confidence: selection.confidence
    });
    
    return selection;
  }
  
  private optimizeSelection(data: SelectionData): AISelection {
    // Algorithme d'optimisation :
    // 1. Prioriser les joueurs motivés (attendance_rate élevé)
    // 2. Maximiser la chimie moyenne de l'équipe
    // 3. Équilibrer les compétences (défense/attaque)
    // 4. Considérer la forme récente
    
    const players = data.availablePlayers.map(playerId => ({
      id: playerId,
      motivation: data.patterns[playerId]?.attendance_rate || 0.5,
      form: data.recentPerformances[playerId]?.average || 5,
      chemistry: this.getAverageChemistry(playerId, data.chemistry)
    }));
    
    // Tri par score composite
    const scoredPlayers = players.map(p => ({
      ...p,
      score: (p.motivation * 0.3) + (p.form * 0.4) + (p.chemistry * 0.3)
    })).sort((a, b) => b.score - a.score);
    
    return {
      players: scoredPlayers.slice(0, 11).map(p => p.id), // Top 11
      confidence: this.calculateConfidence(scoredPlayers),
      criteria: {
        motivation_weight: 0.3,
        form_weight: 0.4,
        chemistry_weight: 0.3
      }
    };
  }
}
```

### 4. Notifications IA Intelligentes

**Service de notifications IA :**
```typescript
// src/services/aiNotifications.service.ts
export class AINotificationsService {
  
  async sendInsightNotification(userId: string, insight: AIInsight): Promise<void> {
    const notification = {
      user_id: userId,
      type: 'ai_insight',
      title: insight.title,
      message: insight.content,
      data: {
        insight_id: insight.id,
        confidence: insight.confidence_score,
        action_suggested: this.getActionSuggestion(insight)
      }
    };
    
    await this.createNotification(notification);
  }
  
  async sendSelectionSuggestion(teamId: string, selection: AISelection): Promise<void> {
    const teamMembers = await this.getTeamManagers(teamId);
    
    for (const manager of teamMembers) {
      const notification = {
        user_id: manager.user_id,
        type: 'ai_suggestion',
        title: '🤖 Suggestion de composition',
        message: `IA recommande une équipe avec ${selection.confidence}% de confiance`,
        data: {
          selected_players: selection.players,
          confidence: selection.confidence,
          reasoning: selection.criteria
        }
      };
      
      await this.createNotification(notification);
    }
  }
}
```

## 🗓️ Planning d'implémentation suggéré

### Semaine 1-2 : Player Chemistry
- [ ] Service `PlayerChemistryService`
- [ ] Calcul automatique après chaque match
- [ ] Interface pour visualiser la chimie

### Semaine 3-4 : AI Insights  
- [ ] Service `AIInsightsService`
- [ ] Détection de tendances de performance
- [ ] Insights d'équipe automatiques

### Semaine 5-6 : Selection Assistant
- [ ] Service `AISelectionService`
- [ ] Algorithme d'optimisation
- [ ] Interface de recommandations

### Semaine 7-8 : Polissage
- [ ] Notifications IA intelligentes
- [ ] Feedback utilisateur sur IA
- [ ] Amélioration algorithmes

## 🧪 Tests des Fonctionnalités IA

### Mock Data pour tester
```sql
-- Insérer des données de test pour l'IA
INSERT INTO player_chemistry (player_a_id, player_b_id, team_id, chemistry_score, matches_played_together)
VALUES 
  ('player-1-uuid', 'player-2-uuid', 'team-uuid', 8.5, 12),
  ('player-1-uuid', 'player-3-uuid', 'team-uuid', 3.2, 8);

INSERT INTO ai_insights (target_type, target_id, insight_type, title, content, confidence_score)
VALUES 
  ('player', 'player-1-uuid', 'performance_trend', '📈 Progression détectée', 'Amélioration passes +15%', 0.92);
```

### Tests unitaires
```typescript
describe('PlayerChemistryService', () => {
  it('should calculate high chemistry for compatible players', async () => {
    const chemistry = await service.calculateChemistry('player1', 'player2', 'team1');
    expect(chemistry).toBeGreaterThan(7);
  });
  
  it('should detect low chemistry for incompatible players', async () => {
    const chemistry = await service.calculateChemistry('player3', 'player4', 'team1');
    expect(chemistry).toBeLessThan(4);
  });
});
```

---

**🎯 Objectif** : Transformer SportConnect en coach virtuel intelligent qui aide les équipes à optimiser leurs performances ! 🤖⚽
