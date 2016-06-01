import Bluebird from 'bluebird';
import FluentLogger from 'fluent-logger';

import { Channel } from 'logquacious';

export default class FluentChannel extends Channel {
    static channelType = 'fluent';
    
    constructor(logger, props) {
        super(logger, props);
        
        if (!this.tag) { throw new Error('Tag required') }
        if (!this.host) { throw new Error('Host required') }
        
        let { tag, host } = this;
        
        let fluentSender = this.fluentSender = FluentLogger.createFluentSender(tag, {
            host: host
        });
        fluentSender.on('error', (err) => {
            this.emit('error', err);
        });
        this.emitFluentAsync = Bluebird.promisify(fluentSender.emit, { context: fluentSender });
    }
    
    async logAsync(record) {
        let { subtag, emitFluentAsync } = this;
        let { level } = record;
        
        await emitFluentAsync(subtag || level, record);
    }
}