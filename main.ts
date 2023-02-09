import { register as tsRegister } from 'typescript-paths';
tsRegister();

import 'reflect-metadata';

import { Storyboard } from './server/storyboard';

const server = new Storyboard()
server.run();