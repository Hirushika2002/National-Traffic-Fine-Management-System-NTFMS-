import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FineFilters from '../src/components/FineFilters';

const EMPTY_FILTERS = { status: '', districtId: '', categoryId: '', startDate: '', endDate: '' };
const districts = [{ id: 1, name: 'Colombo' }, { id: 2, name: 'Kandy' }];
const categories = [{ id: 1, code: 'SEC_140' }, { id: 2, code: 'SEC_151' }];

describe('FineFilters', () => {
  it('renders district and category options', () => {
    render(
      <FineFilters filters={EMPTY_FILTERS} districts={districts} categories={categories} onChange={vi.fn()} onReset={vi.fn()} />,
    );
    expect(screen.getByRole('option', { name: 'Colombo' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'SEC_151' })).toBeInTheDocument();
  });

  it('calls onChange with the updated status filter', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FineFilters filters={EMPTY_FILTERS} districts={districts} categories={categories} onChange={onChange} onReset={vi.fn()} />,
    );

    await user.selectOptions(screen.getByLabelText(/status/i), 'PAID');
    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, status: 'PAID' });
  });

  it('calls onReset when the reset button is clicked', async () => {
    const onReset = vi.fn();
    const user = userEvent.setup();
    render(
      <FineFilters filters={EMPTY_FILTERS} districts={districts} categories={categories} onChange={vi.fn()} onReset={onReset} />,
    );

    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
