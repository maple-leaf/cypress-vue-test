import logger, { log } from './logger';

export default function call() {
    return logger() + ' ' + log();
}
