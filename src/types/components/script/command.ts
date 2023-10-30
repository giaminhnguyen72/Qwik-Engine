import { Engine } from "../../../core/engine.js"

interface Command {
    engineType: Engine
    execute(): void
}