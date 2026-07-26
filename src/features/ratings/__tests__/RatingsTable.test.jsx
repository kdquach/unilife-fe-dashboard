import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
    expect(screen.getAllByText('No data', { exact: false }).length).toBeGreaterThan(0);
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
    const mockOnViewDetail = vi.fn();
    render(<RatingsTable data={mockData} loading={false} pagination={{ current: 1 }} onChange={() => {}} onViewDetail={mockOnViewDetail} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Great!/i)).toBeInTheDocument();
    
    // In actual tests we might simulate click on the "View Detail" button if we add test-id
    // fireEvent.click(screen.getByRole('link'));
  });
});
