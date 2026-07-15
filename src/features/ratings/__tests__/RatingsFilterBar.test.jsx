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
    expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('calls onFilterChange with correct values when Apply Filters is clicked', () => {
    const mockOnFilterChange = vi.fn();
    render(<RatingsFilterBar onFilterChange={mockOnFilterChange} loading={false} />);
    
    // Type in keyword
    const input = screen.getByPlaceholderText('Search by keyword...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Click apply
    const applyBtn = screen.getByRole('button', { name: /apply filters/i });
    fireEvent.click(applyBtn);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      keyword: 'test'
    }));
  });

  it('calls onFilterChange with undefined values when Reset is clicked', () => {
    const mockOnFilterChange = vi.fn();
    render(<RatingsFilterBar onFilterChange={mockOnFilterChange} loading={false} />);
    
    // Type in keyword
    const input = screen.getByPlaceholderText('Search by keyword...');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Click reset
    const resetBtn = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetBtn);
    
    expect(input.value).toBe('');
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      keyword: undefined,
      type: undefined,
      stars: undefined,
      hasReply: undefined,
      startDate: undefined,
      endDate: undefined,
    }));
  });
});
