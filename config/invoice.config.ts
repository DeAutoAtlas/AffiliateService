export default () => ({
  invoice: {
    minimumPayout: Number(process.env.MINIMUM_PAYOUT) || 20,
  },
});
