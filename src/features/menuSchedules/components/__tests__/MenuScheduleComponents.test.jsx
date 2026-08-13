import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MenuScheduleFilter from '../MenuScheduleFilter';
import MenuScheduleTable from '../MenuScheduleTable';
import MenuScheduleDetailDrawer from '../MenuScheduleDetailDrawer';

describe('MenuSchedule Components', () => {
  describe('MenuScheduleFilter', () => {
    it('renders filter inputs', () => {
      render(<MenuScheduleFilter filters={{ status: undefined }} onFilterChange={vi.fn()} />);
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Start date')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('End date')).toBeInTheDocument();
    });

    it('handles filter status change', () => {
      const mockOnFilterChange = vi.fn();
      render(<MenuScheduleFilter filters={{ status: undefined }} onFilterChange={mockOnFilterChange} />);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('MenuScheduleTable', () => {
    it('renders table columns correctly', () => {
      const mockData = [
        { _id: '1', date: '2026-06-25T00:00:00.000Z', status: 'PUBLISHED', createdAt: '2026-06-25T00:00:00.000Z' }
      ];
      render(<MenuScheduleTable data={mockData} loading={false} pagination={{ total: 1 }} onChange={vi.fn()} onViewDetail={vi.fn()} />);
      
      expect(screen.getByText('Serving Date')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Created At')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('MenuScheduleDetailDrawer', () => {
    it('renders empty state if no detail', () => {
      render(<MenuScheduleDetailDrawer open={true} onClose={vi.fn()} detail={null} loading={false} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders items if detail is provided', () => {
      const mockDetail = {
        _id: '1',
        date: '2026-06-25T00:00:00.000Z',
        items: [
          {
            _id: 'item1',
            foodId: { name: 'Fried Rice', price: 30000 },
            maxServing: 100
          }
        ]
      };
      render(<MenuScheduleDetailDrawer open={true} onClose={vi.fn()} detail={mockDetail} loading={false} />);
      expect(screen.getByText('Menu Schedule: 25/06/2026')).toBeInTheDocument();
      expect(screen.getByText('Fried Rice')).toBeInTheDocument();
      expect(screen.getByText('100 portions')).toBeInTheDocument();
    });
  });
});
