import { register as tsRegister } from 'typescript-paths';
tsRegister();

import { ø, Storyboard } from './src/server';

ø.run();

process.on('SIGUSR2', () => Storyboard.instance.stop());
process.on('SIGQUIT', () => Storyboard.instance.stop());
process.on('SIGINT',  () => Storyboard.instance.stop());