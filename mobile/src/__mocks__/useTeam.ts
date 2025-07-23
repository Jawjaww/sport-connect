import React from 'react';

const mockUseTeam = jest.fn().mockImplementation(() => {
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return {
    team: {
      id: '1',
      name: 'Test Team', 
      sport: 'Football',
      players: [],
    },
    isLoading,
    isSuccess: !isLoading,
    error: null,
    updateTeam: jest.fn().mockResolvedValue({}),
    deleteTeam: jest.fn().mockResolvedValue({})
  };
});

export default mockUseTeam;
