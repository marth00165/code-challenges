import React, { useState } from 'react';
import { useFares } from '../hooks/useFares';
import { calcFare, formatUSD } from '../utils/calcFare';

type FareType = 'weekday' | 'evening_weekend' | 'anytime';
type PurchaseType = 'advance_purchase' | 'onboard_purchase';

interface Fare {
  type: FareType;
  purchase: PurchaseType;
  trips: number;
  price: number;
}

interface Zone {
  zone: number;
  name: string;
  fares: Fare[];
}

interface FaresJson {
  zones: Zone[];
  info: { [key: string]: string };
}

interface FareResult {
  unitPrice: number;
  total: number;
  message: string;
}

export interface FareFormProps {}

/*
This component handles user input for fare calculation.
It is a dumb component that relies on the useFares hook for data fetching
and the calcFare utility for fare calculation logic.
*/

export default function FareForm(props: FareFormProps) {
  const { data: faresJson, loading, error } = useFares();

  const [zone, setZone] = useState<string>('1');
  const [type, setType] = useState<FareType>('weekday');
  const [purchase, setPurchase] = useState<PurchaseType>('advance_purchase');
  const [rides, setRides] = useState<string>('1');
  const [ridesError, setRidesError] = useState<string>('');

  // Options
  const typeOptions = [
    { label: 'Weekdays', value: 'weekday' },
    { label: 'Evening / Weekend', value: 'evening_weekend' },
    { label: 'Anytime (10-Trip)', value: 'anytime' },
  ];
  const purchaseOptions = [
    { label: 'Station Kiosk', value: 'advance_purchase' },
    { label: 'Onboard', value: 'onboard_purchase' },
  ];

  // Calculate fare
  let fareResult: FareResult = { unitPrice: 0, total: 0, message: '' };
  if (faresJson) {
    const ridesNum = rides === '' ? 0 : Number(rides);
    fareResult = calcFare(
      { zone, type, purchase, rides: ridesNum },
      faresJson as FaresJson
    );
  }

  // Add this new validation function
  const validateRides = (value: string, fareType: FareType) => {
    if (fareType === 'anytime') {
      const numValue = Number(value);
      if (numValue % 10 !== 0) {
        setRidesError('Anytime tickets must be purchased in multiples of 10');
      } else {
        setRidesError('');
      }
    } else {
      setRidesError('');
    }
  };

  // Update the rides change handler to use the validation function
  const handleRidesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRides(value);
    validateRides(value, type);
  };

  // Add validation when fare type changes
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as FareType;
    setType(newType);
    validateRides(rides, newType);
  };

  return (
    <form className='fare-form' onSubmit={(e) => e.preventDefault()}>
      <div className='fare-header'>
        <img src='/img/septa-logo.webp' alt='SEPTA' />
        Regional Rail Fares
      </div>

      <div className='fare-group'>
        <label htmlFor='zone'>Where are you going?</label>
        <select
          id='zone'
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          disabled={loading}
        >
          {faresJson &&
            (faresJson as FaresJson).zones.map((z) => (
              <option key={z.zone} value={z.zone}>
                {z.name}
              </option>
            ))}
        </select>
      </div>

      <div className='fare-group'>
        <label htmlFor='type'>When are you riding?</label>
        <select
          id='type'
          value={type}
          onChange={handleTypeChange} // Update this line
          disabled={loading}
          aria-describedby='type-helper'
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className='fare-helper' id='type-helper'>
          {faresJson && (faresJson as FaresJson).info[type]}
        </div>
      </div>

      <div className='fare-group'>
        <fieldset className='fare-radios' aria-labelledby='purchase-legend'>
          <legend id='purchase-legend'>
            Where will you purchase the fare?
          </legend>
          {purchaseOptions.map((opt) => (
            <label key={opt.value}>
              <input
                type='radio'
                name='purchase'
                value={opt.value}
                checked={purchase === opt.value}
                onChange={(e) => setPurchase(e.target.value as PurchaseType)}
                disabled={loading}
              />{' '}
              {opt.label}
            </label>
          ))}
        </fieldset>
      </div>

      <div className='fare-group'>
        <label htmlFor='rides'>How many rides will you need?</label>
        <input
          id='rides'
          type='number'
          min='0'
          value={rides}
          onChange={handleRidesChange}
          disabled={loading}
          className={ridesError ? 'error' : ''}
          aria-invalid={Boolean(ridesError)}
          aria-describedby={ridesError ? 'rides-error' : undefined}
        />
        {ridesError ? (
          <div className='fare-error' id='rides-error' role='alert'>
            {ridesError}
          </div>
        ) : type === 'anytime' ? (
          <div className='fare-helper'>
            Anytime tickets must be purchased in multiples of 10
          </div>
        ) : null}
      </div>

      <div className='fare-result' aria-live='polite'>
        <small>
          {loading
            ? 'Loading fares...'
            : error
            ? 'Could not load fares'
            : 'Your fare will cost'}
        </small>
        <span className='fare-price'>
          {loading || error ? '$0.00' : formatUSD(fareResult.total)}
        </span>
        {fareResult.message && !loading && !error && (
          <div style={{ fontSize: '0.95em', marginTop: 8, color: '#bfc9d1' }}>
            {fareResult.message}
          </div>
        )}
      </div>
    </form>
  );
}
