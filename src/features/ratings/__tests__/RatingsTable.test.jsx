import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RatingsTable from '../components/RatingsTable';

// Mock matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

describe('RatingsTable', () => {
  it('renders correctly with empty data', () => {
    render(<RatingsTable data={[]} loading={false} pagination={{ current: 1 }} onChange={() => {}} />);
    expect(screen.getByText('No Data', { exact: false })).toBeInTheDocument();
  });

  it('renders data rows correctly', () => {
    const mockData = [
      {
        _id: '1',
        ratingType: 'FOOD',
        stars: 5,
        comment: 'Great!',
        userId: { fullName: 'John Doe', email: 'john@test.com' },
        foodId: { name: 'Pizza' },
        createdAt: '2026-07-15T00:00:00Z'
      }
    ];
    
    render(<RatingsTable data={mockData} loading={false} pagination={{ current: 1 }} onChange={() => {}} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Great!/i)).toBeInTheDocument();
  });
});
