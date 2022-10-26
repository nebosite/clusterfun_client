

// ------------------------------------------------------------------------------------------
// LexiblePlayRequestMessage

import { ClusterFunMessageBase, Vector2 } from "libs";

// ------------------------------------------------------------------------------------------
export interface PlayBoard {
    gridWidth: number
    gridHeight: number
    gridData: string
}

export class LexiblePlayRequestMessageData extends ClusterFunMessageBase
{
    roundNumber: number = 0;
    playBoard: PlayBoard = { gridWidth: 0, gridHeight: 0, gridData: "" };
    teamName: string = "";
} 
export class LexiblePlayRequestMessage  extends LexiblePlayRequestMessageData {
    static readonly messageTypeName = "LexiblePlayRequestMessage";
    constructor(payload: LexiblePlayRequestMessageData) { super(payload); Object.assign(this, payload);  } 
}

export type LetterChain = {letter: string, coordinates: Vector2}[]

// ------------------------------------------------------------------------------------------
// LexibleFailedWordMessage
// ------------------------------------------------------------------------------------------
export class LexibleFailedWordMessageData extends ClusterFunMessageBase
{
    letters: LetterChain = []
}
export class LexibleFailedWordMessage  extends LexibleFailedWordMessageData {
    static readonly messageTypeName = "LexibleFailedWordMessage";
    constructor(payload: LexibleFailedWordMessageData) { super(payload); Object.assign(this, payload);  } 
}

// ------------------------------------------------------------------------------------------
// LexibleWordHintMessage
// ------------------------------------------------------------------------------------------
export class LexibleWordHintMessageData extends ClusterFunMessageBase
{
    wordList: string[] = [];
}
export class LexibleWordHintMessage  extends LexibleWordHintMessageData {
    static readonly messageTypeName = "LexibleWordHintMessage";
    constructor(payload: LexibleWordHintMessageData) { super(payload); Object.assign(this, payload);  } 
}

export class LexibleScoredWordMessage  extends ClusterFunMessageBase {
    static readonly messageTypeName = "LexibleScoredWordMessage";
    scoringPlayerId: string = "";
    team: string = "";
    letters: LetterChain = []
    score: number = 0
    
    // eslint-disable-next-line
    constructor(payload: LexibleScoredWordMessage) { super(payload); Object.assign(this, payload);  } 
}


// ------------------------------------------------------------------------------------------
// LexibleEndOfRoundMessage
// ------------------------------------------------------------------------------------------
export class LexibleEndOfRoundMessageData extends ClusterFunMessageBase
{
    roundNumber: number = 0;
    winningTeam: string = "";
}

export class LexibleEndOfRoundMessage  extends LexibleEndOfRoundMessageData {
    static readonly messageTypeName = "LexibleEndOfRoundMessage";
    
    // eslint-disable-next-line
    constructor(payload: LexibleEndOfRoundMessageData) { super(payload); Object.assign(this, payload);  } 
}


// ------------------------------------------------------------------------------------------
// LexiblePlayerActionMessage
// ------------------------------------------------------------------------------------------
export enum LexiblePlayerAction {
    LetterSelect = "LetterSelect",
    WordSubmit = "WordSubmit",
}
export interface LetterSelectData {
    coordinates: Vector2
    playerId: string
    selectedValue: boolean
    isFirst: boolean
}

export interface WordSubmissionData {
    letters: LetterChain
}
export class LexiblePlayerActionMessageData extends ClusterFunMessageBase
{
    roundNumber: number = 0;
    action: LexiblePlayerAction = LexiblePlayerAction.WordSubmit;
    actionData: LetterSelectData | WordSubmissionData = { letters:[] };
}
export class LexiblePlayerActionMessage extends LexiblePlayerActionMessageData {
    static readonly messageTypeName = "LexiblePlayerActionMessage";

    // eslint-disable-next-line
    constructor(payload: LexiblePlayerActionMessageData)  { super(payload); Object.assign(this, payload); } 
}
