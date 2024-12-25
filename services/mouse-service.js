class MouseService {
    #robot = null;

    constructor(robotService) {
        this.#robot = robotService
    }

    handle(params) {
        if (params.key_press != null) {
            this.#robot.mouseClick(params.key_press);
            return;
        }

        this.#robot.mouseMove(params.extra.coordinates);
    }
}

module.exports = MouseService;
