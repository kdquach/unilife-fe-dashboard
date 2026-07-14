import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MenuScheduleUpdateModal from '../MenuScheduleUpdateModal';

// Mock matchMedia to fix Ant Design testing errors
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

describe('MenuScheduleUpdateModal', () => {
  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with correct title and fields', () => {
    render(
      <MenuScheduleUpdateModal
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        detail={{ date: '2026-07-15T00:00:00.000Z', status: 'DRAFT', __v: 1 }}
        totalReservedCount={0}
      />
    );
    expect(screen.getByText('Update Menu Schedule')).toBeInTheDocument();
  });

  it('shows warning messages when totalReservedCount > 0', () => {
    render(
      <MenuScheduleUpdateModal
        isOpen={true}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
        detail={{ date: '2026-07-15T00:00:00.000Z', status: 'PUBLISHED', __v: 1 }}
        totalReservedCount={5}
      />
    );
    
    expect(screen.getByText(/Customers have already placed orders/)).toBeInTheDocument();
    expect(screen.getByText(/Cannot downgrade status to DRAFT/)).toBeInTheDocument();
  });
});
