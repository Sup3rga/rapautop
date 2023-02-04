import React from 'react';
import {DefaultPage} from "../components/Page";
import Field from "../components/Field";
import Ressources from "../utils/Ressources";
import Footer from "../components/Footer";
import {Icon} from "../components/Header";

export class Punchline extends React.Component{
    render() {
        let {data, className,onClick} = this.props,
            skeleton = data.card == null;
        return (
            <div className={
                    "ui-element ui-image punchline " +
                    className + ' ' +
                    (skeleton ? 'skeleton' : '')
                }
                style={ skeleton ? null : {
                    backgroundImage: 'url('+data.card+')'
                }}
                onClick={onClick}
            />
        );
    }
}

export default class Punchlines extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            previewMode: false,
            gallery: [],
            total: null,
            current: null,
            lists: {
                categories: ['Tout'],
                artists: ['Tout'],
                years: ['Tout']
            }
        };
        for(let i = 0, j = Math.random() * 50 + 20; i < j; i++){
            this.state.gallery.push({});
        }
    }

    componentDidMount() {
        setTimeout(()=>{
            Ressources.getPunchlinesData().then((result)=>{
                this.setState(state => {
                    return {
                        ...state,
                        total: result.length,
                        gallery: result
                    }
                })
            })
        },1000);
    }

    renderHeadOf(){
        return (
            <div className="ui-container ui-size-fluid filter-zone">
                <div className="ui-container ui-size-fluid ui-md-size-3 ui-unwrap wrapper ui-vertical-center">
                    <label className="ui-element">Catégorie</label>
                    <Field type="select" className="ui-element ui-size-fluid field" options={this.state.lists.categories}/>
                </div>
                <div className="ui-container ui-size-fluid ui-md-size-3 ui-unwrap wrapper ui-vertical-center">
                    <label className="ui-element">Artiste</label>
                    <Field type="select" className="ui-element ui-size-fluid field" options={this.state.lists.artists}/>
                </div>
                <div className="ui-container ui-size-fluid ui-md-size-3 ui-unwrap wrapper ui-vertical-center">
                    <label className="ui-element">Année</label>
                    <Field type="select" className="ui-element ui-size-fluid field" options={this.state.lists.years}/>
                </div>
            </div>
        );
    }

    renderPunchlinesGrid(){
        return (
          <div className={
              "ui-element ui-size-fluid grid ui-scroll-y " +
              (this.state.previewMode ? 'flexible' : '')
          }>
              {
                  this.state.gallery.map((data, index) => {
                      return (
                          <div className="ui-element ui-size-4 ui-sm-size-3 ui-md-size-2 wrapper">
                              <Punchline key={index} className="ui-size-fluid" data={data} onClick={(e)=>{
                                  this.setState(state=>{
                                      return {
                                          ...state,
                                          previewMode: true,
                                          current: data
                                      }
                                  })
                              }}/>
                          </div>
                      );
                  })
              }
          </div>
        );
    }

    renderPunchlinePreview(){
        let {current} = this.state;
        return (
            <div className={
                "ui-container preview ui-no-scroll " +
                (this.state.previewMode ? 'flexible' : '')
            }>
                <div className="ui-element ui-size-fluid ui-horizontal-right head">
                    <Icon icon="times" onClick={()=>{
                        this.setState(state=>{
                            return {
                                ...state,
                                previewMode: false,
                                current: null
                            }
                        });
                    }}/>
                </div>
                <div className="ui-container ui-size-fluid ui-fluid-height ui-scroll-y">
                {
                    !current ? null : (
                        <>
                        <div className="ui-element ui-size-fluid image ui-image ui-height-8" style={{
                            backgroundImage: 'url('+current.image+')'
                        }}/>
                        <div className="ui-container ui-size-fluid metadata">
                            <div className="ui-element ui-size-fluid title">
                                {current.music}
                            </div>
                            <div className="ui-element ui-size-fluid artist">
                                {current.artist}
                            </div>
                            <div className="ui-element ui-size-fluid">
                                <div className="ui-element ui-size-6 year">
                                    <label>Année de sortie : </label> {current.year}
                                </div>
                                <div className="ui-element ui-size-6 year">
                                    <label>Catégorie : </label> {current.category}
                                </div>
                            </div>
                            <div className="ui-element ui-size-fluid comment">
                                {current.comment}
                            </div>
                        </div>
                        <div className="ui-container ui-size-fluid actions">
                            <button className="ui-element ui-button primary-theme">
                                <Icon mode="ion" icon="android-share-alt"/>
                                Partager
                            </button>
                            <button className="ui-element ui-button primary-theme">
                                <Icon icon="download"/>
                                Sauvegarder
                            </button>
                        </div>
                        </>
                    )
                }
                </div>
            </div>
        );
    }

    render() {
        return (
            <DefaultPage
                title={Ressources.getProjectName()+' | Punchlines'}
                className="punchlines-page ui-container ui-unwrap ui-column"
            >
                <h1>
                    Punchlines ({this.state.total})
                </h1>
                {this.renderHeadOf()}
                {this.renderPunchlinesGrid()}
                {this.renderPunchlinePreview()}
                <Footer simple={true}/>
            </DefaultPage>
        );
    }
}