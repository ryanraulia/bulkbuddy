import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../pages/Home';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('Home Component', () => {
  beforeAll(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ meals: [], nutrients: {} }),
      })
    );
  });

  beforeEach(() => {
    fetch.mockClear();
  });

  it('should submit form with exclude ingredients', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Fill out form
    fireEvent.input(screen.getByLabelText(/daily calorie target/i), {
      target: { value: '2000' }
    });
    fireEvent.input(screen.getByLabelText(/exclude ingredients/i), {
      target: { value: 'nuts, dairy' }
    });

    // Submit form
    fireEvent.click(screen.getByText(/generate meal plan/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('exclude=nuts%2Cdairy')
      );
    });
  });

  it('should show error message when exclusions prevent generation', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'No meal plan found' }),
      })
    );

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.input(screen.getByLabelText(/daily calorie target/i), {
      target: { value: '2000' }
    });
    fireEvent.input(screen.getByLabelText(/exclude ingredients/i), {
      target: { value: 'invalid' }
    });
    fireEvent.click(screen.getByText(/generate meal plan/i));

    await waitFor(() => {
      expect(screen.getByText(/No meal plan found/)).toBeInTheDocument();
    });
  });
});