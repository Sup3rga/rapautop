import React from 'react';
import {DefaultPage} from "../components/Page";
import Ressources from "../utils/Ressources";
import Footer from "../components/Footer";
import Url from "../utils/Url";
import {Icon} from "../components/Header";

export default class Reading extends React.Component{

    constructor(props) {
        super(props);
        let url = Url.get().split('/');
        this.data = {
            id: url[2],
            title: url[3].replace(/\+/g,' ')
        };
        console.log('[URl]', this.data);
        this.state = {
            title: null,
            text: null,
            publishDate: null,
            time: null,
            stats: [],
            author: null
        };
    }

    componentDidMount() {
        setTimeout(()=>{
            Ressources.getArticleData(this.data.id)
            .then((e)=>{
                console.log('[E]',e);
                this.setState(e);
            });
        },1000);
    }

    renderArticle(){
        let skeleton = this.state.title === null;
        return (
            <div className="ui-container ui-size-fluid article-read">
                <div className="ui-container ui-size-fluid ui-md-size-8">
                    <h1 className={
                        "ui-container ui-size-fluid "+
                        (skeleton ? 'skeleton' : '')
                    }>
                        {this.state.title}
                    </h1>
                    <div className="ui-container ui-size-fluid">
                        <div className={
                            "ui-element ui-size-fluid date " +
                            (skeleton ? 'skeleton' : '')
                        }>
                            {
                                skeleton ? '':
                                    'Publié le '+ Ressources.getDateString(this.state.publishDate) + ', ' +this.state.time
                            }
                        </div>
                    </div>
                    <div className={
                        "ui-container ui-size-fluid ui-image caption "+
                        (skeleton ? 'skeleton' : '')
                    } style={
                        skeleton ? null :
                            {
                                backgroundImage: 'url('+this.state.caption+')'
                            }
                    }>

                    </div>
                    <div className="ui-container ui-size-fluid article-text">
                        {
                            skeleton ?
                                Ressources.range(0,Math.random() * 60 + 10).map((i,j)=>{
                                    return <p className="ui-container ui-size-fluid skeleton" style={{
                                        width: (Math.random() * 100 + 10)+'%'
                                    }} key={j}/>;
                                }) :
                                this.state.text
                        }
                    </div>
                </div>
            </div>
        );
    }

    renderAppreciationBox(){
        let skeleton = this.state.title === null;
        return (
            skeleton ?

                <div className="ui-container ui-size-fluid appreciation ui-vertical-center">
                    <span className="ui-container ui-size-fluid ui-sm-size-6 ui-md-size-4 text skeleton">
                    </span>
                    <button className="ui-element ui-button skeleton">
                    </button>
                    <button className="ui-element ui-button skeleton">
                    </button>
                </div>
                :
                <div className="ui-container ui-size-fluid appreciation ui-vertical-center">
                    <span className="ui-container ui-size-fluid ui-sm-size-6 ui-md-size-4 text">
                        Vous avez aimé cet article ?
                    </span>
                    <button className="ui-element ui-button primary-theme">
                        <Icon icon="thumbs-up"/>
                        J'ai apprécié !
                    </button>
                    <button className="ui-element ui-button ui-alert-theme ui-text-clipped">
                        <Icon icon="grin-wink"/>
                        J'espérais mieux
                    </button>
                </div>
        );
    }

    render() {
        return (
            <DefaultPage title={this.data.title}>
                {this.renderArticle()}
                {this.renderAppreciationBox()}
                <Footer/>
            </DefaultPage>
        );
    }
}