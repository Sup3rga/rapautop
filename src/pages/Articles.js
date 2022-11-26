import React from 'react';
import Header, {Icon} from "../components/Header";
import Ressources from "../utils/Ressources";
import {DefaultPage} from "../components/Page";
import Body from "../components/Body";
import ArticleThumbnail, {ArticlePreview} from "../components/ArticleThumbnail";
import Footer from "../components/Footer";
import Drawer from "../components/Menu";
import Field from "../components/Field";

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
        return <DefaultPage>
            <div className="ui-container ui-size-fluid type-chooser ui-vertical-center">
                <label>Catégories</label>
                <Field type="select" className="ui-size-3" placeholder="Cat" options={this.state.categories}/>
                <button className="ui-element ui-button primary-theme">Filtrer</button>
            </div>
            <div className="ui-container ui-size-fluid">

            </div>
            <div className="ui-container ui-size-fluid ui-horizontal-center">
                <div className="ui-container ui-size-fluid ui-sm-size-10 ui-md-size-8 ui-lg-size-6  articles-container ui-horizontal-left">
                    {
                        this.state.articles.map((article,index)=>{
                            return <ArticlePreview
                                skeleton={article.title === null}
                                title={article.title}
                                text={article.subtitle}
                                caption={article.caption}
                                date={article.date}
                            />
                        })
                    }
                </div>
            </div>
            <Footer />
        </DefaultPage>
    }
}