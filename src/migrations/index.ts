import * as migration_20261018_090539_initial from './20261018_090539_initial';
import * as migration_20261019_080233_media_visibility from './20261019_080233_media_visibility';
import * as migration_20261019_103056_course_content from './20261019_103056_course_content';

export const migrations = [
  {
    up: migration_20261018_090539_initial.up,
    down: migration_20261018_090539_initial.down,
    name: '20261018_090539_initial',
  },
  {
    up: migration_20261019_080233_media_visibility.up,
    down: migration_20261019_080233_media_visibility.down,
    name: '20261019_080233_media_visibility',
  },
  {
    up: migration_20261019_103056_course_content.up,
    down: migration_20261019_103056_course_content.down,
    name: '20261019_103056_course_content'
  },
];
