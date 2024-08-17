export function decideBid(hand) {
  // Placeholder for AI bidding logic
  return Math.floor(Math.random() * 13) + 1; // Random bid between 1 and 13
}

export function playCard(hand, currentTrick) {
  // Placeholder for AI card playing logic
  return hand[Math.floor(Math.random() * hand.length)];
}