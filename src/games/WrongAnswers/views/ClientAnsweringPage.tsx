// App Navigation handled here
import React from "react";
import { observer } from "mobx-react";
import styles from "./Client.module.css"
import { WrongAnswersClientModel } from "../models/ClientModel";
import { Row } from "libs";
import { action, makeObservable, observable } from "mobx";
import { doNothing } from "libs/helpers/time";

export class AnweringPageState {

    @observable  private _plusProgress = 0.0
    get plusProgress() {return this._plusProgress}
    set plusProgress(value) {action(()=>{this._plusProgress = value})()}

    //--------------------------------------------------------------------------------------
    // ctor
    //--------------------------------------------------------------------------------------
    constructor() { makeObservable(this) }
}

@observer
export class ClientAnsweringPage  extends React.Component<{appModel?: WrongAnswersClientModel}> {

    holdingPlus = false;
    plusDownTime = 0;
    plusHoldTimeout = 5000;
    st = new AnweringPageState();
    placedRandom = false;

    // -------------------------------------------------------------------
    // render
    // -------------------------------------------------------------------
    render() {
        const {appModel} = this.props;
        if (!appModel) return <div>NO APP MODEL</div>;

        const handleAnswerEntry = () => {
            this.holdingPlus = false;
            if(this.placedRandom) {
                this.placedRandom = false;
                return;
            }
            appModel.enterAnswer();
        }

        const handleNewValue = (ev: React.ChangeEvent<HTMLInputElement>) => {
            appModel.currentAnswer = ev.target.value;   
        }

        const renderAnswer = (text: string, index: number) => {
            const handleEdit = () => { appModel.editAnswer(index); }
            const handlePromote = () => { appModel.promoteAnswer(index); }
            const handleDelete = () => { appModel.deleteAnswer(index); }

            let background = "#ffffff80";
            if(index >= appModel.minAnswers) background = "#00000020"

            return <div className={styles.answerBox}
                        key={index} 
                    >
                        <Row>
                            <div className={styles.answerText} style={{background}}>{text}</div>
                            <button className={styles.answerButton} onClick={handleEdit}>✏</button>
                            <button className={styles.answerButton} onClick={handlePromote}>⭱</button>
                            <button className={styles.answerButton} onClick={handleDelete}>❌</button>
                        </Row>
                    </div>
        }

        const handlePlusDown = () => {
            console.log(`DOWN: ${this.holdingPlus}`)
            if(!this.holdingPlus) {
                this.holdingPlus = true;
                this.plusDownTime = Date.now();
                setTimeout(async () => {
                    while(true) {
                        console.log(`    holding: ${this.holdingPlus} ${this.st.plusProgress.toFixed(3)}`)
                        if(!this.holdingPlus) return;
                        this.st.plusProgress = (Date.now() - this.plusDownTime)/this.plusHoldTimeout;
                        
                        if(this.st.plusProgress > 1) {
                            this.st.plusProgress = 0;
                            appModel.currentAnswer = "RANDOM";
                            this.placedRandom = true;
                        }     
                        
                        await doNothing(100);
                    }

                },0 );
            }   
        }

        const handlePlusUp = () => {
            this.holdingPlus = false;
        }

        return (
            <div>
                <div className={styles.promptHint}>(Press and hold "+" for to generate a random answer.)</div>
                <div className={styles.promptPrefix}>
                    Enter at least {appModel.minAnswers} wrong answer{appModel.minAnswers === 1 ? "" : "s"} for: 
                </div>
                <div className={styles.prompt}>
                    {appModel.prompt}
                </div>
                <Row style={{marginBottom: "30px"}}>
                    <div className={styles.progressInputContainer}>
                        <div 
                            className={styles.plusProgress} 
                            style={{width: `${this.st.plusProgress * 100}%`}}
                        >
                        </div>                       
                        <input
                            className={styles.inputText}
                            type="text"
                            value={appModel.currentAnswer}
                            onChange={handleNewValue}
                        / >                           


                    </div>
                    <button 
                        className={styles.answerButton}
                        style={{
                            marginLeft: "930px", 
                            background: appModel.currentAnswer.trim().length === 0 ? "gray" : "inherit" }}
                        onMouseDown={handlePlusDown}
                        onMouseUp={handlePlusUp}
                        onClick={handleAnswerEntry}>✚</button>                    
                </Row>
                <div>
                    {appModel.answers.map((a,i) => renderAnswer(a,i))}
                </div>
 
            </div>
        );

    }
}
