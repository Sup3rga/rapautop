
export default class Events{

    static events = {};

    static emit(ev,args){
        if(ev in Events.events){
            for(var i in Events.events[ev]){
                Events.events[ev][i](args);
            }
        }
        return Events;
    }

    static off(ev){
        if(ev in Events.events){
            Events.events[ev] = [];
        }
        return Events;
    }

    static on(ev, callback){
        if(!(ev in Events.events)){
            Events.events[ev] = [];
        }
        Events.events[ev].push(callback);
        return Events;
    }
}