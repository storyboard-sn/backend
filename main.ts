import { register as tsRegister } from 'typescript-paths';
tsRegister();

import { Storyboard } from './server/server';

Storyboard.instance.run();

process.on('SIGUSR2', () => Storyboard.instance.stop());
process.on('SIGQUIT', () => Storyboard.instance.stop());
process.on('SIGINT',  () => Storyboard.instance.stop());