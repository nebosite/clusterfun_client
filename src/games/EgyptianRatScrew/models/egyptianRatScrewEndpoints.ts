import MessageEndpoint from "libs/messaging/MessageEndpoint";

/**
 * A message that describes the current state as known to the client
 */
export interface ERSTimepointUpdateMessage {
    /**
     * A unique, opaque code that corresponds to the current state
     * of the center pile. When clients take actions, they will
     * provide the timepoint code they are acting against.
     * This is to adjust for ping - messages are either generally
     * responded to at the time they are sent on the client, or
     * are discarded if they are too old.
     */
    timepointCode: string,
    /**
     * The number of cards the receiving player has left,
     * to be displayed in the corner
     */
    numberOfCards: number,
}

export enum ERSActionSuccessState {
    /**
     * The action successfully changed the state of the pile
     */
    Success,
    /**
     * The action failed and a penalty card was paid
     */
    PenaltyCard,
    /**
     * The action failed and was ignored
     */
    Ignored
}

export interface ERSActionResponse {
    successState: ERSActionSuccessState,
    timepoint?: ERSTimepointUpdateMessage
}

export const EgyptianRatScrewOnboardClientEndpoint: MessageEndpoint<unknown, { state: string, timepoint?: ERSTimepointUpdateMessage }> = {
    route: "/games/egyptian-rat-screw/lifecycle/onboard",
    responseRequired: true,
    suggestedRetryIntervalMs: 5000,
    suggestedTotalLifetimeMs: 30000
}

export const EgyptianRatScrewPushUpdateEndpoint: MessageEndpoint<ERSTimepointUpdateMessage, unknown> = {
    route: "/games/egyptian-rat-screw/cilent-push",
    responseRequired: false
}

export const EgyptianRatScrewPlayCardActionEndpoint: MessageEndpoint<{ timepointCode: string }, ERSActionResponse> = {
    route: "/games/egyptian-rat-screw/actions/color-change",
    responseRequired: true,
    suggestedRetryIntervalMs: 500,
    suggestedTotalLifetimeMs: 2000
}

export const EgyptianRatScrewTakePileActionEndpoint: MessageEndpoint<{ timepointCode: string }, ERSActionResponse> = {
    route: "/games/egyptian-rat-screw/actions/message",
    responseRequired: true,
    suggestedRetryIntervalMs: 500,
    suggestedTotalLifetimeMs: 2000
}