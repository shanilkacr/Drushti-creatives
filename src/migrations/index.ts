import * as migration_20260810_065616 from './20260810_065616';
import * as migration_20260819_034102_add_portfolio_external_url from './20260819_034102_add_portfolio_external_url';

export const migrations = [
  {
    up: migration_20260810_065616.up,
    down: migration_20260810_065616.down,
    name: '20260810_065616',
  },
  {
    up: migration_20260819_034102_add_portfolio_external_url.up,
    down: migration_20260819_034102_add_portfolio_external_url.down,
    name: '20260819_034102_add_portfolio_external_url'
  },
];
