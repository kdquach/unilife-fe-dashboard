import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RatingDetailModal from '../components/RatingDetailModal';

window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

describe('RatingDetailModal', () => {
  it('renders modal with correct title', () => {
    render(
      <RatingDetailModal
        isOpen={true}
        onClose={() => {}}
        detail={{ _id: '1', ratingType: 'FOOD', stars: 5, comment: 'Awesome!' }}
        loading={false}
      />
    );
    expect(screen.getByText('Rating Detail')).toBeInTheDocument();
    expect(screen.getByText('Awesome!')).toBeInTheDocument();
  });

  it('renders staff reply if available', () => {
    render(
      <RatingDetailModal
        isOpen={true}
        onClose={() => {}}
        detail={{
          _id: '1',
          ratingType: 'FOOD',
          stars: 5,
          staffReply: 'Thanks!',
          repliedBy: { fullName: 'Admin' }
        }}
        loading={false}
      />
    );
    expect(screen.getByText('Thanks!')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders reply form if no staff reply', () => {
    render(
      <RatingDetailModal
        isOpen={true}
        onClose={() => {}}
        detail={{
          _id: '1',
          ratingType: 'FOOD',
          stars: 5,
          staffReply: null,
        }}
        loading={false}
      />
    );
    expect(screen.getByPlaceholderText('Write your reply here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reply/i })).toBeInTheDocument();
  });
});
