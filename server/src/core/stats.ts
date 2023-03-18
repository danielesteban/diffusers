import { Types } from 'mongoose';

import { Job } from '../models';

export default (client?: string) => {
  const now = new Date();
  const fourWeeksAgo = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 28
  ));
  return Job.aggregate()
    .match({
      ...(client ? { client: new Types.ObjectId(client) } : {}),
      createdAt: { $gt: fourWeeksAgo }
    })
    .group({
      _id: { date: { $dateToString: { format: '%Y%m%d', date: '$createdAt' } }, pipeline: '$pipeline' },
      count: { $sum: 1 },
    })
    .then((results) => (
      results.reduce((results, { _id: { date, pipeline }, count }) => {
        if (!results[date]) {
          results[date] = [0, 0, 0];
        }
        results[date][['depth', 'diffusion', 'upscale'].indexOf(pipeline)] = count;
        return results;
      }, {})
    ));
};
