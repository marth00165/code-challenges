import React, { useState } from 'react';
import { useFares } from '../hooks/useFairs';
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
          onChange={(e) => setType(e.target.value as FareType)}
          disabled={loading}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className='fare-helper'>
          {faresJson && (faresJson as FaresJson).info[type]}
        </div>
      </div>

      <div className='fare-group'>
        <label>Where will you purchase the fare?</label>
        <div className='fare-radios'>
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
        </div>
      </div>

      <div className='fare-group'>
        <label htmlFor='rides'>How many rides will you need?</label>
        <input
          id='rides'
          type='number'
          min='0'
          value={rides}
          onChange={(e) => setRides(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className='fare-result'>
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
