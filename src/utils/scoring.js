export function calculateScores(bids, tricksWon) {
  return bids.map((bid, index) => {
    if (tricksWon[index] === bid) {
      return bid * 10; // Full points if bid is matched exactly
    } else {
      return -Math.abs(bid - tricksWon[index]) * 10; // Negative points if bid is not met
    }
  });
}