interface GameEvent {
    eventName: string
}
interface GameMouseEvent extends GameEvent{
    mouseEvent: MouseEvent

}
interface GameKeyboardEvent extends GameEvent {
    keyEvent: KeyboardEvent
}
