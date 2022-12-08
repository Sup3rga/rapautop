
class Channel {
    static code = {
        success: 100,
        error: 0,
        internal: 500
    }

    static message(options={}){
        let message = typeof options == 'string' ? options : "general error"
        let response = {
            error: true,
            code: Channel.code.success,
            message: message,
            data: []
        };
        if(typeof options == 'object') {
            for (let i in options) {
                if (i in response) {
                    response[i] = options[i];
                }
            }
        }
        return response;
    }
}

module.exports = Channel;