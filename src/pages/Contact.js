import React from 'react';
import {DefaultPage} from "../components/Page";
import Field from "../components/Field";
import Footer from "../components/Footer";

export default class Contact extends React.Component{

    render() {
        return (
          <DefaultPage>
                <div className="ui-container ui-wrap ui-md-unwrap ui-size-fluid contact-us ui-all-center">
                    <div className="ui-container ui-size-fluid ui-md-size-4 image ui-height-5 ui-md-fluid-height" style={{
                        backgroundImage: 'url(/assets/rapper.png)'
                    }}>
                        <div className="ui-container ui-size-fluid ui-fluid-height mask">

                        </div>
                    </div>
                    <div className="ui-container ui-size-fluid ui-md-size-6 form">
                        <h1>
                            Contactez-nous
                        </h1>
                        <p className="ui-container ui-size-fluid">
                            Nous sommes à l'écoute de ce que vous avez à nous dire !
                        </p>
                        <div className="ui-container ui-size-fluid">
                            <div className="ui-container ui-size-fluid ui-md-size-6 wrapper">
                                <Field placeholder="Votre nom" className="ui-element ui-size-fluid field"/>
                            </div>
                            <div className="ui-container ui-size-fluid ui-md-size-6 wrapper">
                                <Field placeholder="Votre Prénom" className="ui-element ui-size-fluid field"/>
                            </div>
                            <Field placeholder="Votre E-mail" className="ui-element ui-size-fluid field"/>
                            <Field placeholder="Votre Message" type="textarea" className="ui-element ui-size-fluid field plain"/>
                            <div className="ui-container ui-size-fluid actions">
                                <button className="ui-element ui-button primary-theme">Envoyer</button>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer/>
          </DefaultPage>
        );
    }
}