/**
 * input = {
 *   zone: number | string (1,2,3,4,5),
 *   type: 'weekday' | 'evening_weekend' | 'anytime',
 *   purchase: 'advance_purchase' | 'onboard_purchase',
 *   rides: number
 * }
 * faresJson = the entire JSON
 */
type Fare = {
  type: 'weekday' | 'evening_weekend' | 'anytime';
  purchase: 'advance_purchase' | 'onboard_purchase';
  trips: number;
  price: number;
};

type Zone = {
  zone: number;
  name: string;
  fares: Fare[];
};

type FaresJson = {
  zones: Zone[];
  info: { [key: string]: string };
};

type CalcFareInput = {
  zone: number | string;
  type: 'weekday' | 'evening_weekend' | 'anytime';
  purchase: 'advance_purchase' | 'onboard_purchase';
  rides: number;
};

/**
 Wanted to leave a some context on how this function works here... 
 * Calculates fare based on user input and fare data.
 * - Finds the selected zone from faresJson.
 * - For "anytime" fares, finds the 10-trip fare and calculates total books needed.
 * - For other types, finds the matching single-trip fare and multiplies by rides.
 * - Returns unit price, total cost, and a helper message.
 */
export function calcFare(input: CalcFareInput, faresJson: FaresJson) {
  const { zone, type, purchase, rides } = input;

  // Find the selected zone
  const selectedZone = faresJson.zones.find(
    z => z.zone === Number(zone) || z.name === zone
  );

  // I did this althought the form should ensure this doesn't happen
  if (!selectedZone) {
    return { unitPrice: 0, total: 0, message: 'Zone not found' };
  }

  let fareOption: Fare | undefined = undefined;


  // Handle "anytime" (10-trip) fare specially
  if (type === 'anytime') {
    fareOption = selectedZone.fares.find(
      f => f.type === 'anytime' && f.purchase === purchase && f.trips === 10
    );
    if (fareOption) {
      const booksNeeded = Math.ceil(rides / 10);
      const totalCost = fareOption.price * booksNeeded;
      return {
        unitPrice: fareOption.price / 10,
        total: totalCost,
        message: faresJson.info.anytime
      };
    }
  }

  // For other fare types, find the single-trip fare
  fareOption = selectedZone.fares.find(
    f =>
      f.type === type &&
      f.purchase === purchase &&
      f.trips === 1
  );

  /*
    Although currently there is always a fare for each combo,
    the app should ensure this doesn't happen.
  */
  if (!fareOption) {
    return { unitPrice: 0, total: 0, message: 'No fare for this combo' };
  }

  const unitPrice = fareOption.price;
  const total = unitPrice * rides;
  return {
    unitPrice,
    total,
    message: faresJson.info[type] || ''
  };
}


/*
Simple USD formatter utility.
*/
export function formatUSD(value) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
}
