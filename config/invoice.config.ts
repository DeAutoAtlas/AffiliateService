export default () => ({
  invoice: {
    minimumPayout: Number(process.env.MINIMUM_PAYOUT) || 20,
    pricePerLead: Number(process.env.PRICE_PER_LEAD) || 1,
  },
});
