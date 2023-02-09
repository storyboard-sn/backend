import { register as tsRegister } from 'typescript-paths';
tsRegister();

import { Storyboard } from './server/storyboard';

Storyboard.instance.run();