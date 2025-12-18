/**
 * Custom routes for bids
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/bids/auction/:auctionId',
      handler: 'bid.findByAuction',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/bids/auction/:auctionId/highest',
      handler: 'bid.getHighestBid',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/bids/my-bids',
      handler: 'bid.findByUser',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
