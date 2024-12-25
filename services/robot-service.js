const robot = require("robotjs");

class RobotService {
    pressKey(keyPress) {
        robot.keyTap(keyPress);
    }

    mouseClick(sideClick) {
        robot.mouseClick(sideClick);
    }

    mouseMove(coordinates) {
        let screenSize = robot.getScreenSize();
        let height = (screenSize.height / 2) - 10;
        let width = screenSize.width;
        let twoPI = Math.PI * 2.0;
        let x = coordinates.x;
        let y = height * Math.sin((twoPI * coordinates.x) / width) + height;
	    robot.moveMouse(x, y);
    }
}

module.exports = RobotService;
