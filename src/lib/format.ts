export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(price);
};
