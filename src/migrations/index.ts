import * as migration_20261018_090539_initial from './20261018_090539_initial';
import * as migration_20261019_080233_media_visibility from './20261019_080233_media_visibility';

export const migrations = [
  {
    up: migration_20261018_090539_initial.up,
    down: migration_20261018_090539_initial.down,
    name: '20261018_090539_initial',
  },
  {
    up: migration_20261019_080233_media_visibility.up,
    down: migration_20261019_080233_media_visibility.down,
    name: '20261019_080233_media_visibility'
  },
];
