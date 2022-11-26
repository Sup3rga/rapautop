import React from 'react';
import Events from "../utils/Events";

export default class Link extends React.Component{

    constructor(props){
       super(props);
    }

    render(){
        return <a className={this.props.className} href={this.props.href} onClick={(e)=>{
            e.preventDefault();
            window.history.pushState(null,'', this.props.href);
            Events.emit('nav', {
                href: this.props.href
            });
        }}>
            {this.props.children}
        </a>
    }
}