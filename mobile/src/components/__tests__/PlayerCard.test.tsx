import React from 'react';
import { render } from '@testing-library/react-native';
import PlayerCard from '../PlayerCard';

describe('PlayerCard Component', () => {
  const mockPlayer = {
    id: '1',
    team_id: 'team-123',
    user_id: 'user-123',
    first_name: 'John',
    last_name: 'Doe',
    username: 'JohnDoe',
    email: 'john.doe@example.com',
    role: 'player' as const,
    position: 'Attaquant',
    stats: {
      matches_played: 10,
      games_played: 8,
      goals: 5,
      assists: 3,
      yellow_cards: 1,
      red_cards: 0,
      average_rating: 4.5
    },
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: new Date(),
    updated_at: new Date()
  };

  it('renders player name correctly', () => {
    const { getByText } = render(<PlayerCard player={mockPlayer} />);
    expect(getByText('JohnDoe')).toBeTruthy();
  });

  it('displays player position', () => {
    const { getByText } = render(<PlayerCard player={mockPlayer} />);
    expect(getByText('Forward')).toBeTruthy();
  });

  it('shows player stats', () => {
    const { getByText } = render(<PlayerCard player={mockPlayer} />);
    expect(getByText('Goals: 5')).toBeTruthy();
    expect(getByText('Assists: 3')).toBeTruthy();
  });
});
