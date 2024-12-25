class KeyboardService {
    #robot = null;

    constructor(robotService) {
        this.#robot = robotService
    }

    handle(params) {
        this.#robot.pressKey(params.key_press);
    }
}

module.exports = KeyboardService;
