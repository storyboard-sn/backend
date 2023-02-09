import { register as tsRegister } from 'typescript-paths';
tsRegister();

import { ø, Storyboard } from './src/server';

process.on('SIGUSR2', () => ø.stop());
process.on('SIGQUIT', () => ø.stop());
process.on('SIGINT',  () => ø.stop());

ø.run();