import {createRoot} from 'react-dom/client'
import { LobbyModel } from "./lobby/models/LobbyModel";
import { GameTestComponent } from "./testLobby/Components/GameTestComponent";
import { LobbyMainPage } from "./lobby/views/LobbyMainPage";
import { GameTestModel } from "./testLobby/models/GameTestModel";
import { QuickTestComponent } from "./testLobby/Components/QuickTestComponent";
import { googleTrackingIds } from "secrets";
import { GameDescriptor, GameInstanceProperties, getStorage, MockTelemetryLoggerFactory, TelemetryLoggerFactory, WebSocketMessageThing } from './libs';
import { GLOBALS } from './Globals';
import 'index.css'
import React from 'react';
import TestatoAssets from 'testLobby/TestGame/assets/Assets';
import { resolve } from 'node:path/win32';

const rootContainer = document.getElementById('root') as HTMLElement;
const root = createRoot(rootContainer);

document.title = GLOBALS.Title;

// auto-redirect http to http on the prod server
if (window.location.href.toLowerCase().startsWith('http://clusterfun.tv')) {
    window.location.replace(`https:${window.location.href.substring(5)}`);
}

console.log(`MOBILE: ${GLOBALS.IsMobile}`)
// -------------------------------------------------------------------
// _serverCall 
// -------------------------------------------------------------------
async function serverCall<T>(url: string, payload: any | undefined) {
    if(payload) {
        const response = await fetch(url, {
            method: "POST",
            headers: [
                ['Content-Type', 'application/json']
            ],
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            return await response.json() as T
        } else {
            const responseBody = await response.text();
            throw new Error("Failed to connect to game: " + responseBody);
        }        
    }
    else {
        const response = await fetch(url, { method: "GET" });
        if (response.ok) {
            const streamText = await response.text();
            return await JSON.parse(streamText) as T
        } else {
            const responseBody = await response.text();
            throw new Error("Server call failed" + responseBody);
        }        
    }

}

// Get the google analitics measurement ID from :  https://analytics.google.com/analytics/web/#/a169765098p268496630/admin/streams/table/2416371752

const telemetryFactory=  new TelemetryLoggerFactory(googleTrackingIds);

const quickTest = process.env.REACT_APP_QUICKTEST ?? false;
// -------------------------------------------------------------------
// Development: Render test Lobby
// -------------------------------------------------------------------
if (quickTest) {
    root.render( <QuickTestComponent /> );        

}
else if (process.env.REACT_APP_DEVMODE === 'development') {
    //console.log(`------- TEST PAGE RELOAD -------------------`)
    const factory = process.env.REACT_APP_USE_REAL_TELEMETRY 
        ? telemetryFactory
        : new MockTelemetryLoggerFactory();

    const gameTestModel = new GameTestModel(4, getStorage("clusterfun_test"), factory);

    
    const games: GameDescriptor[] = Array(10).fill(0).map((_, i) => {
        return {
            name: `Testato${i + 1}`,
            logoName: TestatoAssets.images.logo,
            tags: [],
            lazyType: React.lazy(() => import('./testLobby/TestGame/views/GameComponent'))
        };
    });
    
    root.render( <GameTestComponent gameTestModel={gameTestModel} games={games} /> );        
}

// -------------------------------------------------------------------
// Production: Render Lobby
// -------------------------------------------------------------------
else {
    console.log(`------- PAGE RELOAD -------------------`)

    let cachedMessageThings = new Map<string, WebSocketMessageThing>()
    const lobbyModel = new LobbyModel(
        {
            messageThingFactory: (gp: GameInstanceProperties) => {
                //console.log(`getting message thing for ${gp.personalSecret}`)
                let cachedThing = cachedMessageThings.get(gp.personalSecret);
                if(!cachedThing || cachedThing.isClosed)
                {
                    console.log(`Caching a new web socket for ${gp.personalSecret}...`)
                    cachedThing = new WebSocketMessageThing(gp.roomId, gp.personalId, gp.personalSecret)
                    cachedMessageThings.set(gp.personalSecret, cachedThing)
                }
                return cachedThing;
            },
            serverCall: serverCall,
            storage: getStorage("clusterfun"),            
            telemetryFactory,
            onGameEnded: () => {},
        }
        , "mainLobby");

    // TODO: Add server loading code here along with a check to make sure empty list of games works
    // TODO: Fill game list dynamically
    setTimeout(async() => {
        const getGameManifest = async () => {
            const response = await fetch("/api/game_manifest", { method: "GET" });
            if (response.ok) {
                const streamText = await response.text();
                return await JSON.parse(streamText) as any[]
            } else {
                return []
            }      
        }
        const gamesFromServerManifest:GameDescriptor[] = await getGameManifest(); 
        gamesFromServerManifest.forEach(g => {
            g.lazyType = React.lazy(() => import( (g as any).codeUrl))
        })


        console.log("MANIFEST", gamesFromServerManifest)

        root.render( <LobbyMainPage lobbyModel={lobbyModel} games={gamesFromServerManifest}/> );             

    },0)
    root.render( <div>Loading stuff....</div> );     
}
