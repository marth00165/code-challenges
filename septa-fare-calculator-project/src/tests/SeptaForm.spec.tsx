import { render, screen, fireEvent } from '@testing-library/react';
import FareForm from '../components/FareForm';
import * as useFaresHook from '../hooks/useFares';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockFaresJson = {
  zones: [
    {
      zone: 1,
      name: 'CCP/1',
      fares: [
        {
          type: 'weekday',
          purchase: 'advance_purchase',
          trips: 1,
          price: 4.75,
        },
        { type: 'weekday', purchase: 'onboard_purchase', trips: 1, price: 6.0 },
        {
          type: 'evening_weekend',
          purchase: 'advance_purchase',
          trips: 1,
          price: 3.75,
        },
        {
          type: 'evening_weekend',
          purchase: 'onboard_purchase',
          trips: 1,
          price: 5.0,
        },
        {
          type: 'anytime',
          purchase: 'advance_purchase',
          trips: 10,
          price: 38.0,
        },
      ],
    },
  ],
  info: {
    anytime: 'Valid anytime',
    weekday: 'Valid Monday through Friday',
    evening_weekend: 'Valid weekends',
    advance_purchase: 'Buy at station',
    onboard_purchase: 'Buy onboard',
  },
};

describe('FareForm', () => {
  beforeEach(() => {
    vi.spyOn(useFaresHook, 'useFares').mockImplementation(() => ({
      data: mockFaresJson,
      loading: false,
      error: null,
    }));
  });

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(<FareForm />);
      expect(screen.getByLabelText(/Where are you going/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/When are you riding/i)).toBeInTheDocument();
      expect(screen.getByText(/Station Kiosk/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/How many rides/i)).toBeInTheDocument();
    });

    it('shows helper text for selected fare type', () => {
      render(<FareForm />);
      expect(
        screen.getByText(/Valid Monday through Friday/i)
      ).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText(/When are you riding/i), {
        target: { value: 'anytime' },
      });
      expect(screen.getByText(/Valid anytime/i)).toBeInTheDocument();
    });
  });

  describe('Fare Calculations', () => {
    it('shows correct fare for default values', () => {
      render(<FareForm />);
      expect(screen.getByText('$4.75')).toBeInTheDocument();
    });

    it('updates fare when ride type changes', () => {
      render(<FareForm />);
      fireEvent.change(screen.getByLabelText(/When are you riding/i), {
        target: { value: 'evening_weekend' },
      });
      expect(screen.getByText('$3.75')).toBeInTheDocument();
    });

    it('updates fare when purchase type changes', () => {
      render(<FareForm />);
      fireEvent.click(screen.getByLabelText(/Onboard/i));
      expect(screen.getByText('$6.00')).toBeInTheDocument();
    });

    it('shows $0.00 when rides is empty', () => {
      render(<FareForm />);
      const ridesInput = screen.getByLabelText(/How many rides/i);
      fireEvent.change(ridesInput, { target: { value: '' } });
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('multiplies fare by number of rides', () => {
      render(<FareForm />);
      const ridesInput = screen.getByLabelText(/How many rides/i);
      fireEvent.change(ridesInput, { target: { value: '3' } });
      expect(screen.getByText('$14.25')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state', () => {
      vi.spyOn(useFaresHook, 'useFares').mockImplementation(() => ({
        data: null,
        loading: true,
        error: null,
      }));
      render(<FareForm />);
      expect(screen.getByText(/Loading fares/i)).toBeInTheDocument();
    });

    it('shows error state', () => {
      vi.spyOn(useFaresHook, 'useFares').mockImplementation(() => ({
        data: null,
        loading: false,
        error: 'Failed to load fares',
      }));
      render(<FareForm />);
      expect(screen.getByText(/Could not load fares/i)).toBeInTheDocument();
    });
  });

  describe('Zone Selection', () => {
    it('shows all available zones', () => {
      render(<FareForm />);
      const zoneSelect = screen.getByLabelText(/Where are you going/i);
      expect(zoneSelect).toHaveDisplayValue('CCP/1');
      expect(screen.getAllByRole('option')).toHaveLength(1); // assuming mock has 1 zone
    });

    it('updates fare when zone changes', () => {
      const extendedMock = {
        ...mockFaresJson,
        zones: [
          ...mockFaresJson.zones,
          {
            zone: 2,
            name: 'Zone 2',
            fares: [
              {
                type: 'weekday',
                purchase: 'advance_purchase',
                trips: 1,
                price: 5.75,
              },
            ],
          },
        ],
      };

      vi.spyOn(useFaresHook, 'useFares').mockImplementation(() => ({
        data: extendedMock,
        loading: false,
        error: null,
      }));

      render(<FareForm />);
      fireEvent.change(screen.getByLabelText(/Where are you going/i), {
        target: { value: '2' },
      });
      expect(screen.getByText('$5.75')).toBeInTheDocument();
    });
  });

  describe('Anytime 10-Trip Fare Logic', () => {
    beforeEach(() => {
      render(<FareForm />);
      // Select anytime fare type
      fireEvent.change(screen.getByLabelText(/When are you riding/i), {
        target: { value: 'anytime' },
      });
    });

    it('shows validation error for non-multiple of 10', () => {
      const ridesInput = screen.getByLabelText(/How many rides/i);
      fireEvent.change(ridesInput, { target: { value: '15' } });

      expect(
        screen.getByText(/must be purchased in multiples of 10/i)
      ).toBeInTheDocument();
      expect(ridesInput).toHaveClass('error');
      expect(ridesInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows no error for multiple of 10', () => {
      const ridesInput = screen.getByLabelText(/How many rides/i);
      fireEvent.change(ridesInput, { target: { value: '20' } });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(ridesInput).not.toHaveClass('error');
      expect(ridesInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('calculates correct total for multiple books', () => {
      const ridesInput = screen.getByLabelText(/How many rides/i);
      fireEvent.change(ridesInput, { target: { value: '20' } });

      // Should show price for 2 books ($38.00 * 2)
      expect(screen.getByText('$76.00')).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    it('handles empty ride input', () => {
      render(<FareForm />);
      const ridesInput = screen.getByLabelText(/How many rides/i);
      fireEvent.change(ridesInput, { target: { value: '' } });
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('handles negative ride numbers', () => {
      render(<FareForm />);
      const ridesInput = screen.getByLabelText(/How many rides/i);
      fireEvent.change(ridesInput, { target: { value: '-1' } });
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('shows helper text for anytime tickets', () => {
      render(<FareForm />);
      fireEvent.change(screen.getByLabelText(/When are you riding/i), {
        target: { value: 'anytime' },
      });
      expect(
        screen.getByText(/must be purchased in multiples of 10/i)
      ).toBeInTheDocument();
    });

    it('removes error when switching from anytime to regular fare', () => {
      render(<FareForm />);

      // Switch to anytime and enter invalid value
      fireEvent.change(screen.getByLabelText(/When are you riding/i), {
        target: { value: 'anytime' },
      });
      fireEvent.change(screen.getByLabelText(/How many rides/i), {
        target: { value: '15' },
      });

      // Switch back to weekday
      fireEvent.change(screen.getByLabelText(/When are you riding/i), {
        target: { value: 'weekday' },
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByLabelText(/How many rides/i)).not.toHaveClass('error');
    });
  });

  describe('Accessibility', () => {
    it('has proper error state ARIA attributes', () => {
      render(<FareForm />);

      // Switch to anytime and trigger error
      fireEvent.change(screen.getByLabelText(/When are you riding/i), {
        target: { value: 'anytime' },
      });
      const ridesInput = screen.getByLabelText(/How many rides/i);
      fireEvent.change(ridesInput, { target: { value: '15' } });

      expect(ridesInput).toHaveAttribute('aria-invalid', 'true');
      expect(ridesInput).toHaveAttribute('aria-describedby', 'rides-error');
      expect(screen.getByRole('alert')).toHaveTextContent(
        /must be purchased in multiples of 10/i
      );
    });

    it('has proper ARIA attributes', () => {
      render(<FareForm />);

      // Check for aria-describedby on ride type select
      const typeSelect = screen.getByLabelText(/When are you riding/i);
      expect(typeSelect).toHaveAttribute('aria-describedby', 'type-helper');

      // Check for aria-live on result region
      const result = screen
        .getByText(/Your fare will cost/i)
        .closest('.fare-result');
      expect(result).toHaveAttribute('aria-live', 'polite');
    });

    it('maintains proper tab order', () => {
      render(<FareForm />);
      const elements = [
        screen.getByLabelText(/Where are you going/i),
        screen.getByLabelText(/When are you riding/i),
        screen.getByLabelText(/Station Kiosk/i),
        screen.getByLabelText(/Onboard/i),
        screen.getByLabelText(/How many rides/i),
      ];

      elements.forEach((el, i) => {
        expect(el).toHaveAttribute('tabIndex', i === 0 ? '0' : undefined);
      });
    });
  });
});
