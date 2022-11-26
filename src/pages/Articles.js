import React from 'react';
import Header, {Icon} from "../components/Header";
import Ressources from "../utils/Ressources";
import {DefaultPage} from "../components/Page";
import Body from "../components/Body";
import ArticleThumbnail, {ArticlePreview} from "../components/ArticleThumbnail";
import Footer from "../components/Footer";
import Drawer from "../components/Menu";
import Field from "../components/Field";
import Events from "../utils/Events";
import FilterBox from "../components/FilterBox";

export default class Articles extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            categories: {},
            articles: Ressources.getArticlesFakeData(),
            currentCategorie: "all"
        };
    }

    componentDidMount() {
        Ressources.getArticleCategories().then((e)=>{
            this.setState((state)=>{
                return {
                    ...state,
                    categories: e
                }
            })
        });
        Events.on('filter-change', (filter)=>{
            this.setState((state)=>{
                return {
                    ...state,
                    currentCategorie: filter
                }
            });
        })
        .on('scroll', (e)=>{
            if(e.top > 60){
                Events.emit("show-header-icon",'filter')
            }
            else{
                Events.emit("hide-header-icon",'filter')
            }
        })
        setTimeout(()=>{
            Ressources.getArticles().then((result)=>{
               this.setState((state)=>{
                   return {
                       ...state,
                       articles: result
                   }
                });
            });
        },1000);
    }

    render(){
        return (
            <>
                <FilterBox className="filter-box" default={this.state.currentCategorie} categories={this.state.categories}/>
                <DefaultPage>
                    <div className="ui-container ui-size-fluid type-chooser ui-vertical-center">
                        {FilterBox.content(this.state.categories)}
                    </div>
                    <div className="ui-container ui-size-fluid">

                    </div>
                    <div className="ui-container ui-size-fluid ui-horizontal-center">
                        <div className="ui-container ui-size-fluid ui-sm-size-10 ui-md-size-8 ui-lg-size-6  articles-container ui-horizontal-left">
                            {
                                this.state.articles.map((article,index)=>{
                                    if([article.categorie, 'all'].indexOf(this.state.currentCategorie) < 0 && article.title !== null){
                                        return;
                                    }
                                    return (
                                        <ArticlePreview
                                            key={index}
                                            skeleton={article.title === null}
                                            title={article.title}
                                            text={article.subtitle}
                                            caption={article.caption}
                                            date={article.date}
                                        />
                                    )
                                })
                            }
                        </div>
                    </div>
                    <Footer />
                </DefaultPage>
            </>
        )
    }
}