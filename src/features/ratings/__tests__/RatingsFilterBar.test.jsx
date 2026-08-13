import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
  it('renders all filter inputs correctly', () => {
    render(<RatingsFilterBar onFilterChange={() => {}} loading={false} />);
    
    expect(screen.getByPlaceholderText('Search by keyword...')).toBeInTheDocument();
    expect(screen.getByText('Filter by Type')).toBeInTheDocument();
    expect(screen.getByText('Reply Status')).toBeInTheDocument();
  });

  it('calls onFilterChange when Search is performed', () => {
    const mockOnFilterChange = vi.fn();
    render(<RatingsFilterBar onFilterChange={mockOnFilterChange} loading={false} />);
    
    const input = screen.getByPlaceholderText('Search by keyword...');
    fireEvent.change(input, { target: { value: 'delicious' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      keyword: 'delicious'
    }));
  });
});
