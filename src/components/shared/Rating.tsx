export const Rating = ({ rating }: { rating: number }) => {
  if (!rating || rating <= 0) return null;

  return <span>{rating} ★ Vendor Rating</span>;
};
