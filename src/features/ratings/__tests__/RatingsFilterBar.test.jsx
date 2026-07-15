import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RatingsFilterBar from '../components/RatingsFilterBar';

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

describe('RatingsFilterBar', () => {
  it('renders filter inputs correctly', () => {
    const mockOnFilterChange = vi.fn();
    render(<RatingsFilterBar onFilterChange={mockOnFilterChange} loading={false} />);
    
    expect(screen.getByPlaceholderText('Search by keyword...')).toBeInTheDocument();
  });
});
