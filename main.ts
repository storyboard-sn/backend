import { register as tsRegister } from 'typescript-paths';
tsRegister();

import { Storyboard } from './server/storyboard';

const server = new Storyboard()
server.run();