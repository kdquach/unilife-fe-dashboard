import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MenuScheduleItemsTable from '../MenuScheduleItemsTable';

// Mock window.matchMedia which is required by Ant Design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('MenuScheduleItemsTable', () => {
  const mockItems = [
    {
      _id: '1',
      foodId: {
        _id: 'f1',
        name: 'Fried Rice',
        price: 30000,
        categoryId: { name: 'Main Course' }
      },
      maxServing: 100,
      reservedCount: 20,
      remainingCount: 80,
      isActive: true,
    },
    {
      _id: '2',
      foodId: {
        _id: 'f2',
        name: 'Grilled Chicken',
        price: 45000,
      },
      maxServing: 50,
      reservedCount: 50,
      remainingCount: 0,
      isActive: false, // Inactive item
    },
    {
      _id: '3',
      foodId: null, // Null foodId to test crash safety
      maxServing: 10,
      reservedCount: 0,
      remainingCount: 10,
      isActive: true,
    }
  ];

  it('renders without crashing even with missing data', () => {
    render(<MenuScheduleItemsTable items={mockItems} loading={false} />);
    
    // Should render the title
    expect(screen.getByText('Menu Items')).toBeInTheDocument();
    
    // Should render valid items
    expect(screen.getByText('Fried Rice')).toBeInTheDocument();
    
    // Should safely render item with null foodId
    expect(screen.getByText('Unknown Item')).toBeInTheDocument();
    
    // By default, inactive items are hidden
    expect(screen.queryByText('Grilled Chicken')).not.toBeInTheDocument();
  });

  it('filters by inactive items when switch is toggled', async () => {
    render(<MenuScheduleItemsTable items={mockItems} loading={false} />);
    
    expect(screen.queryByText('Grilled Chicken')).not.toBeInTheDocument();
    
    // Toggle "Show Inactive" switch
    const switchBtn = screen.getByRole('switch');
    fireEvent.click(switchBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Grilled Chicken')).toBeInTheDocument();
    });
  });

  it('filters by search text with debounce', async () => {
    render(<MenuScheduleItemsTable items={mockItems} loading={false} />);
    
    const searchInput = screen.getByPlaceholderText('Search food by name...');
    
    fireEvent.change(searchInput, { target: { value: 'Fried' } });
    
    // Wait for deferred value to update
    await waitFor(() => {
      expect(screen.getByText('Fried Rice')).toBeInTheDocument();
      // The unknown item shouldn't match "Fried"
      expect(screen.queryByText('Unknown Item')).not.toBeInTheDocument();
    });
  });

  it('shows action buttons when isReadOnly is false', () => {
    render(<MenuScheduleItemsTable items={mockItems} loading={false} isReadOnly={false} />);
    
    // Ant Design's Table might not render headers if empty, but we have items
    expect(screen.getAllByText('Action').length).toBeGreaterThan(0);
    
    // There should be edit buttons for items
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('hides action column or disables buttons when isReadOnly is true', () => {
    render(<MenuScheduleItemsTable items={mockItems} loading={false} isReadOnly={true} />);
    
    // Action column header shouldn't be there or buttons should be disabled
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    const editButtons = screen.queryAllByRole('button', { name: /edit/i });
    expect(editButtons.length).toBe(0);
  });
});
