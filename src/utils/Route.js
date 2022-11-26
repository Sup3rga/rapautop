import React from 'react';
import Url from "./Url";
import Events from "./Events";
import Drawer from '../components/Menu'

export default class Route extends React.Component{
    static _routes = {};
    constructor(props) {
        super(props);
        this.state = this.getView();
    }

    getView(){
        let routes = Route._routes,
            url = Url.get();
        console.log('[URL]',url,routes);
        if(url in routes){
            return routes[url];
        }
        else{
            return <div>
                Empty !
            </div>
        }
    }

    setView(){
        console.log('[mounted]', Drawer.active)
        if(!Drawer.active){
            this.setState(this.getView());
            return;
        }
        Events
        .on('menu-transition-end', (e)=>{
            console.log('[Changing]');
            this.setState(this.getView());
        })
        .emit('close-menu')
    }

    static set(path, res){
        Route._routes[path] = res;
        return Route;
    }

    componentDidMount() {
        Events.on('nav', e => {
            this.setView();
        });
        window.addEventListener('popstate', e => {
            this.setView();
        });
    }

    render(){
        return (
            <>
                {this.state}
            </>
        );
    }
}