

import { BaseGameModel, ISessionHelper, ITypeHelper, SessionHelper, ClusterFunSerializer, 
    instantiateGame, getPresenterTypeHelper, getClientTypeHelper, GeneralGameState } from "../../libs";
import { UIProperties } from "libs/types/UIProperties";
import { Provider } from "mobx-react";
import React from "react";
import { ClusterFunGameProps } from "./GameChooser";


class DummyComponent extends React.Component<{ appModel?: any, uiProperties: UIProperties }>
{
    render() { return <div>DUMDUMDUM</div>}
}
// -------------------------------------------------------------------
// Main Game Page
// -------------------------------------------------------------------
export class ClusterfunGameComponent 
extends React.Component<ClusterFunGameProps>
{

    appModel?: BaseGameModel;
    UI: React.ComponentType<{ appModel?: any, uiProperties: UIProperties }> = DummyComponent;

    init(
        presenterType: React.ComponentType<{ appModel?: any, uiProperties: UIProperties }>,
        clientType: React.ComponentType<{ appModel?: any, uiProperties: UIProperties }>,
        derivedPresenterTypeHelper: ( sessionHelper: ISessionHelper, gameProps: ClusterFunGameProps) => ITypeHelper,
        derivedClientTypeHelper: ( sessionHelper: ISessionHelper, gameProps: ClusterFunGameProps) => ITypeHelper
    )
    {
        const {  gameProperties, messageThing,  onGameEnded, serverCall } = this.props;

        const sessionHelper = new SessionHelper(
            messageThing, 
            gameProperties.roomId, 
            gameProperties.presenterId, 
            new ClusterFunSerializer(),
            serverCall
            );


        if(gameProperties.role === "presenter")
        {
            this.UI = presenterType;
            this.appModel = instantiateGame(
                `${gameProperties.gameName}PresenterModel`, 
                this.props, 
                getPresenterTypeHelper( derivedPresenterTypeHelper(sessionHelper, this.props)))
        } else {
            this.UI = clientType;
            this.appModel = instantiateGame(
                `${gameProperties.gameName}ClientModel`, 
                this.props, 
                getClientTypeHelper(derivedClientTypeHelper( sessionHelper, this.props)))
        }
    
        this.appModel.subscribe(GeneralGameState.Destroyed, "GameOverCleanup", () => onGameEnded());

        document.title = `${gameProperties.gameName} / ClusterFun.tv`
    }
    

    // -------------------------------------------------------------------
    // render
    // -------------------------------------------------------------------
    render() {
        const UI = this.UI;
        return (
            <Provider appModel={this.appModel}>
                <React.Suspense fallback={<div>loading...</div>}>
                    <UI uiProperties={this.props.uiProperties}/>
                </React.Suspense>
            </Provider>
        );
    };
}