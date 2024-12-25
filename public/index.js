document.addEventListener('DOMContentLoaded', (ev) => {
    let url = getUrlConnetionWebSocket();
    let ws = openConnetionWebSocket(url);

    let gamepadControls = document.querySelectorAll('.gamepad_controls');
    gamepadControls.forEach(button => {
        button.addEventListener('click', function (ev) {
            let keyPress = this.getAttribute('data-key-press');
            sendToSocket(ws, 'gamepad', keyPress);
        });
    });

    let keyboardVirtual = document.querySelector('#keyboard__virtual_input');
    keyboardVirtual.addEventListener('input', function (ev) {
        let keyPress = this.value;
        sendToSocket(ws, 'keyboard', keyPress);
        this.value = '';
    });

    let btnsMouse = document.querySelectorAll('.btn__mouse__click');
    btnsMouse.forEach(button => {
        button.addEventListener('click', function (ev) {
            let keyPress = this.getAttribute('data-side');
            sendToSocket(ws, 'mouse', keyPress);
        });
    });

    // let areaMoveMouse = document.querySelector('#mouse__move__place');
    // areaMoveMouse.addEventListener('touchmove', function(ev) {
    //     ev.preventDefault();
    //     let coordinates = ev.changedTouches;
    //     sendToSocket(ws, 'mouse', null, {'coordinates': coordinates.length});
    // });

    function sendToSocket(connectionWebSocket, tabName, keyPress, options = {}) {
        message = formateMessageProtocol(tabName, keyPress, options);
        connectionWebSocket.send(JSON.stringify(message));
    };

    function openConnetionWebSocket(url) {
        return new WebSocket(url)
    };

    function getUrlConnetionWebSocket() {
        return window.location.href;
    };

    function formateMessageProtocol(tabName, keyPress, options) {
        return {
            'type_comand': tabName,
            'key_press': keyPress,
            'extra': options
        }
    };

    const areaMoveMouse = document.getElementById("canvas");
    areaMoveMouse.addEventListener("touchend", handleEnd);
    areaMoveMouse.addEventListener("touchmove", handleMove);
    areaMoveMouse.addEventListener("touchstart", handleStart);
    areaMoveMouse.addEventListener("touchcancel", handleCancel);

    const ongoingTouches = [];

    function handleStart(evt) {
        evt.preventDefault();
        const el = document.getElementById("canvas");
        const ctx = el.getContext("2d");
        const touches = evt.changedTouches;

        for (let i = 0; i < touches.length; i++) {
            ongoingTouches.push(copyTouch(touches[i]));
            const color = colorForTouch(touches[i]);
            ctx.beginPath();
            ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false); // a circle at the start
            ctx.fillStyle = color;
            ctx.fill();
        }
    };

    function handleMove(evt) {
        evt.preventDefault();
        const el = document.getElementById("canvas");
        const ctx = el.getContext("2d");
        const touches = evt.changedTouches;

        for (let i = 0; i < touches.length; i++) {
            const color = colorForTouch(touches[i]);
            const idx = ongoingTouchIndexById(touches[i].identifier);

            if (idx >= 0) {
                ctx.beginPath();
                ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
                ctx.lineTo(touches[i].pageX, touches[i].pageY);
                ctx.lineWidth = 4;
                ctx.strokeStyle = color;
                ctx.stroke();
                ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
                sendToSocket(ws, 'mouse', null, {
                    'coordinates': {
                        'x': ongoingTouches[idx].pageX,
                        'y': ongoingTouches[idx].pageY
                    }
                });
            }
        }
    };

    function handleEnd(evt) {
        evt.preventDefault();
        const el = document.getElementById("canvas");
        const ctx = el.getContext("2d");
        const touches = evt.changedTouches;

        for (let i = 0; i < touches.length; i++) {
            const color = colorForTouch(touches[i]);
            let idx = ongoingTouchIndexById(touches[i].identifier);

            if (idx >= 0) {
                ctx.lineWidth = 4;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
                ctx.lineTo(touches[i].pageX, touches[i].pageY);
                ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8); // and a square at the end
                ongoingTouches.splice(idx, 1); // remove it; we're done
            }
        }
    };

    function handleCancel(evt) {
        evt.preventDefault();
        const touches = evt.changedTouches;

        for (let i = 0; i < touches.length; i++) {
            let idx = ongoingTouchIndexById(touches[i].identifier);
            ongoingTouches.splice(idx, 1); // remove it; we're done
        }
    };

    function colorForTouch(touch) {
        let r = touch.identifier % 16;
        let g = Math.floor(touch.identifier / 3) % 16;
        let b = Math.floor(touch.identifier / 7) % 16;
        r = r.toString(16); // make it a hex digit
        g = g.toString(16); // make it a hex digit
        b = b.toString(16); // make it a hex digit
        const color = `#${r}${g}${b}`;
        return color;
    };

    function copyTouch({ identifier, pageX, pageY }) {
        return { identifier, pageX, pageY };
    };

    function ongoingTouchIndexById(idToFind) {
        for (let i = 0; i < ongoingTouches.length; i++) {
            const id = ongoingTouches[i].identifier;

            if (id === idToFind) {
                return i;
            }
        }
        return -1; // not found
    };

});
