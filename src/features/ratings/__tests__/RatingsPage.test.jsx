import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RatingsPage from '../pages/RatingsPage';
import useRatings from '../hooks/useRatings';

// Mock useRatings
vi.mock('../hooks/useRatings');

// Mock matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

describe('RatingsPage', () => {
  it('renders page header and child components', () => {
    useRatings.mockReturnValue({
      ratings: [],
      loading: false,
      pagination: { current: 1, pageSize: 10, total: 0 },
      filters: {},
      handleTableChange: vi.fn(),
      handleFilterChange: vi.fn(),
    });

    render(<RatingsPage />);
    
    // PageHeader should render the title
    expect(screen.getAllByText('Customer Ratings').length).toBeGreaterThan(0);
    
    // Check if FilterBar and Table are rendered by looking for their texts
    expect(screen.getByPlaceholderText('Search by keyword...')).toBeInTheDocument();
    expect(screen.getAllByText('Customer').length).toBeGreaterThan(0); // Table headerColumn
  });
});
