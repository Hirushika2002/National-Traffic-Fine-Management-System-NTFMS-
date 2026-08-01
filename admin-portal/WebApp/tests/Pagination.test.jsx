import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../src/components/Pagination';

describe('Pagination', () => {
  it('shows the current page summary', () => {
    render(<Pagination pagination={{ page: 2, limit: 10, total: 25, totalPages: 3 }} onPageChange={vi.fn()} />);
    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/25 fines/i)).toBeInTheDocument();
  });

  it('disables Previous on the first page and Next on the last page', () => {
    render(<Pagination pagination={{ page: 1, limit: 10, total: 5, totalPages: 1 }} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('calls onPageChange with the next page number', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination pagination={{ page: 1, limit: 10, total: 30, totalPages: 3 }} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
