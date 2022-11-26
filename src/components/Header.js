import React from 'react';
import Ressources from "../utils/Ressources";
import Url from "../utils/Url";
import Events from "../utils/Events";
import Link from "./Link";

export class Icon extends React.Component{

    render() {
        const style = 'mode' in this.props ? ['line','ion'].indexOf(this.props.mode.toString().toLowerCase()) >= 0 : 'line',
              prefix = style == 'line' ? 'las la-' : 'ion-',
              cls = prefix+this.props.icon;
        return <icon className={cls+" "+this.props.className} onClick={this.props.onClick}></icon>;
    }
}

export class Li extends React.Component{

    render() {
        let {href,children} = this.props,
            active = Url.get() === href,
            cls = "ui-element ui-relative nav-item " +(active ? 'active' : '');
        return (
            <li className={this.props.className+" "+cls}>
                <Link href={href} className="nav-link">
                    {children}
                </Link>
            </li>
        );
    }
}

class HeaderNav extends React.Component{

    constructor(props) {
        super(props);
    }

    render() {
        return Object.keys(this.props.data).map((key, index)=>{
                    return <Li className="ui-nowrap" href={key} key={index}>{this.props.data[key]}</Li>
                })
    }
}

class Banner extends React.Component{

    render(){
        return (
            <div className="ui-container ui-unwrap ui-size-fluid ui-flex ui-vertical-center">
                <Icon icon="bars" className="navicon ui-element ui-size-2 ui-horizontal-center ui-md-hide"
                    onClick={()=>{
                        Events.emit('open-menu')
                    }}
                />
                <div className="ui-element navbar-logo ui-size-4 ui-image">
                </div>
                <div className="ui-element nav-title ui-size-8">
                    {this.props.title}
                </div>
            </div>
        )
    }
}

export default class Header extends React.Component{

    render(){
        return <header className="ui-container ui-size-fluid header ui-header ui-flex ui-vertical-center">
            <div className="ui-container ui-size-8 ui-md-size-4">
                <Banner title={this.props.title}/>
            </div>
            <div className="ui-md-container ui-hide ui-size-6 ui-nav ui-unwrap">
                <HeaderNav data={this.props.links}/>
            </div>
            <div className="ui-md-container ui-size-4 ui-md-size-2 ui-horizontal-right icon-zone">
                <Icon mode="ion" icon="ios-search-strong" onClick={e => {
                    Events.emit('open-search')
                }}/>
            </div>
        </header>
    }
}