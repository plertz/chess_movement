const canvas = document.getElementsByTagName("canvas")[0];
const c = canvas.getContext("2d");
canvas.width = "640";
canvas.height = canvas.width
const width = canvas.width;
const height = canvas.height;
const width_square = width / 8;
const height_square = height / 8;
const width_piece = 333;
const height_piece = 334;
const start_board = "cnbkqbnc/pppppppp/8/8/8/8/PPPPPPPP/CNBKQBNC";
var string_board = "8/pP/8/3k/8/5K/8/7c";
// var string_board = start_board
var board = [];
var moves = [];
var active;
var prev_active;
var active_piece;

main_game_var = {
    //current_player == 1 => zwart && current_player == 0 => wit
    current_player: 0,
    current_turn: 1,
}

var down = false;

Mouse = {
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0
}

canvas.addEventListener("mousedown", function(e) {
    // if (active == undefined) {
    if (!valid_move(e)) {
        down = true;
        canvas.style.cursor = "grabbing";
        set_active(e)
        hold_piece(e)
        Mouse.x = e.clientX - canvas.getBoundingClientRect().left;
        Mouse.y = e.clientY - canvas.getBoundingClientRect().top
        Mouse.offsetX = e.x - canvas.getBoundingClientRect().left - (active % 8 * width_square);
        Mouse.offsetY = e.y - canvas.getBoundingClientRect().top - (Math.floor(active / 8) * height_square);
        console.log("mousedown");
    }
})

window.addEventListener("mouseup", function(e) {
    console.log("mouseup");
    down = false;
    canvas.style.cursor = "pointer";
    check_moves()
    move_piece(e)
})

// canvas.addEventListener("click", function(e) {
//     console.log("click");
//     if (active != undefined) {
//         check_moves()
//         move_piece(e)
//     } else {
//         set_active(e)
//     }
// })

canvas.addEventListener("mousemove", function(e) {
    if (down) {
        Mouse.x = e.clientX - canvas.getBoundingClientRect().left;
        Mouse.y = e.clientY - canvas.getBoundingClientRect().top
    }
})

function draw_board() {
    const black = "#444444";
    const white = "#ffffff"
    for (let j = 0; j < 8; j++) {
        if (c.fillStyle == white) {
            c.fillStyle = black;
        } else {
            c.fillStyle = white;
        }
        for (let i = 0; i < 8; i++) {
            if (c.fillStyle == black) {
                c.fillStyle = white;
            } else {
                c.fillStyle = black;
            }
            c.fillRect(i * width_square, j * height_square, width_square, height_square);
        }
    }
}

function draw_grabbed() {
    if (down) {
        draw_piece(active_piece, Mouse.x - Mouse.offsetX, Mouse.y - Mouse.offsetY)
    }
    return;
}

function draw_active() {
    if (active != undefined) {
        c.fillStyle = "#026923";
        c.fillRect(active % 8 * width_square, Math.floor(active / 8) * height_square, width_square, height_square)
        draw_moves()
    }
}

function draw_moves() {
    let green = "#026923";
    let red = "#690202";
    for (let i = 0; i < moves.length; i++) {
        c.beginPath();

        if (board[moves[i]] != 0) {
            c.fillStyle = red;
            c.strokeStyle = red;
            c.arc(moves[i] % 8 * width_square + width_square / 2, Math.floor(moves[i] / 8) * height_square + height_square / 2, width_square / 2.4, 0, 2 * Math.PI)
            c.fill();
        } else {
            c.fillStyle = green;
            c.strokeStyle = green;
            c.arc(moves[i] % 8 * width_square + width_square / 2, Math.floor(moves[i] / 8) * height_square + height_square / 2, width_square / 3, 0, 2 * Math.PI)
            c.lineWidth = 10;
        }
        c.stroke();
    }
}

function draw_pieces(layout) {
    let posx = 0;
    let posy = 0;
    for (let i = 0; i < layout.length; i++) {
        piece = layout[i];
        if (piece == "/") {
            posy += height_square;
            posx = 0;
        } else if (parseInt(piece)) {
            let total = parseInt(piece) * width_square;
            posx += total;
        } else {
            draw_piece(piece, posx, posy)
            posx += width_square;
        }
    }
    return 0;
}

function draw_piece(piece, posx, posy) {
    let type = 0;
    let color = 0;
    switch (piece) {
        case "k":
            type = 0, color = 0;
            break;
        case "K":
            type = 0, color = 1;
            break
        case "q":
            type = 1, color = 0;
            break;
        case "Q":
            type = 1, color = 1;
            break;
        case "b":
            type = 2, color = 0;
            break;
        case "B":
            type = 2, color = 1;
            break;
        case "n":
            type = 3, color = 0;
            break;
        case "N":
            type = 3, color = 1;
            break;
        case "c":
            type = 4, color = 0;
            break;
        case "C":
            type = 4, color = 1;
            break;
        case "p":
            type = 5, color = 0;
            break;
        case "P":
            type = 5, color = 1;
            break;
    }
    if (main_game_var.current_player == 1) {
        if (color == 0) {
            color = 1;
        } else {
            color = 0
        }
    }
    let sprite = new Image();
    sprite.src = "pieces.png"
    c.drawImage(sprite, width_piece * type, height_piece * color, width_piece, height_piece, posx, posy, width_square, height_square)
}

function draw() {
    c.clearRect(0, 0, width, height);
    draw_board();
    draw_active()
    draw_pieces(string_board);
    draw_grabbed();
    requestAnimationFrame(draw);
}

function create_board(board) {
    let new_board = [];
    let square_count = 0;
    for (let i = 0; i < board.length; i++) {
        if (board[i] == "/") {
            for (let j = 0; j < 8 - square_count; j++) {
                new_board.push(0)
            }
            square_count = 0;
        } else if (parseInt(board[i])) {
            for (let j = 0; j < parseInt(board[i]); j++) {
                new_board.push(0);
                square_count++
            }
        } else {
            new_board.push(board[i]);
            square_count++
        }
    }
    return new_board;
}

function stringfy_board(board) {
    let new_board = "";
    for (let i = 0; i < 8; i++) {
        let counter = 0;
        for (let j = 0; j < 8; j++) {
            if (board[i * 8 + j] != 0) {
                if (counter != 0) {
                    new_board = new_board.concat(counter);
                    counter = 0;
                }
                new_board = new_board.concat(board[i * 8 + j])
            } else {
                counter++
            }
        }
        if (new_board[new_board.length - 1] == "/" || new_board[new_board.length] == undefined) {
            new_board = new_board.concat("8")
        }
        if (i != 7) {
            new_board = new_board.concat("/")
        }
    }
    return new_board;
}

function get_piece(x, y) {
    x = Math.floor(x / width_square);
    y = Math.floor(y / height_square);
    return y * 8 + x;
}

function check_moves() {
    switch (board[active]) {
        case "p":
            moves_pawn(main_game_var.current_player)
            break;
        case "c":
            moves_castle()
            break;
        case "b":
            move_bishop()
            break;
        case "q":
            moves_castle()
            move_bishop()
            break;
        case "k":
            move_king()
            break;
    }
}

function moves_pawn(player) {
    if (player == 0) {
        if (active < 56 && board[active + 8] == 0 && blocked(active + 8)) moves.push(active + 8);
        if (active < 56 && board[active + 7] != 0 && blocked(active + 7)) moves.push(active + 7);
        if (active < 56 && board[active + 9] != 0 && blocked(active + 9)) moves.push(active + 9);
        if (active > 7 && active < 16 && blocked(active + 16)) moves.push(active + 16);
    } else {
        if (active > 7 && board[active - 8] == 0 && blocked(active - 8)) moves.push(active - 8);
        if (active > 7 && board[active - 7] != 0 && blocked(active - 7)) moves.push(active - 7);
        if (active > 7 && board[active - 9] != 0 && blocked(active - 9)) moves.push(active - 9);
        if (active > 47 && active < 56 && blocked(active - 16)) moves.push(active - 16)
    }

    // if (active > 7 && active < 16 || active > 47 && active < 56) {
    //     moves.push(active + 16)
    // }
}

function moves_castle() {
    let dir = [Math.floor(active / 8), 7 - active % 8, 7 - Math.floor(active / 8), active % 8];
    let counter = -8;
    for (let i = 0; i < dir.length; i++) {
        let prev = active;
        switch (i) {
            case 1:
                counter = 1
                break;
            case 2:
                counter = 8
                break;
            case 3:
                counter = -1
                break;
        }
        for (let j = 0; j < dir[i]; j++) {
            prev = prev + counter
            if (blocked(prev)) {
                moves.push(prev);
                if (board[moves[moves.length - 1]] != 0) {
                    break;
                }
            } else {
                break;
            }
        }
    }
}

function move_bishop() {
    let prev = active;
    let counter = -9
    for (let i = 0; i < 4; i++) {
        switch (i) {
            case 0:
                break;
            case 1:
                counter = -7;
                break;
            case 2:
                counter = 7
                break;
            case 3:
                counter = 9;
                break;
        }
        while (true) {
            let new_move = prev + counter;
            if (new_move > -1 && new_move < 64) {
                if (get_color_square(prev) === get_color_square(new_move) && blocked(new_move)) {
                    moves.push(new_move);
                    if (board[moves[moves.length - 1]] != 0) {
                        break;
                    }
                } else {
                    break;
                }
            } else {
                break;
            }
            prev = new_move;
        }
        prev = active;
    }
}

function move_king() {
    possible_moves = [-1, -7, -8, -9, 1, 7, 8, 9]
    for (let i = 0; i < possible_moves.length; i++) {
        if (blocked(active + possible_moves[i]) && 0 < active + possible_moves[i] && active + possible_moves[i] < 64) moves.push(active + possible_moves[i])
    }
}

function get_color_square(square) {
    let row_color = Math.floor(square / 8) % 2
    let column_color = (square % 8) % 2;
    if (row_color == 0 && column_color == 0 || row_color == 1 && column_color == 1) {
        return "black";
    } else {
        return "white";
    }
}

function blocked(move) {
    if (board[move] != 0 && move != active) {
        if (board[move] == board[move].toLowerCase()) {
            return false;
        } else if (board[move] == board[move].toUpperCase()) {
            return true;
        }
    } else {
        return true
    }
}

function set_active(e) {
    moves = [];
    let mouseX = e.clientX - canvas.getBoundingClientRect().left;
    let mouseY = e.clientY - canvas.getBoundingClientRect().top;

    active = get_piece(mouseX, mouseY);
    if (board[active] == 0 || board[active] == board[active].toUpperCase()) {
        active = undefined;
        return
    }
    active_piece = board[active];
    check_moves();
}

function valid_move(e) {
    let mouseX = e.clientX - canvas.getBoundingClientRect().left;
    let mouseY = e.clientY - canvas.getBoundingClientRect().top;
    let square = get_piece(mouseX, mouseY)
    for (let i = 0; i < moves.length; i++) {
        if (moves[i] == square) {
            return true;
        }
    }
}

function move_piece(e) {
    console.log("piece moved" + active);
    let mouseX = e.clientX - canvas.getBoundingClientRect().left;
    let mouseY = e.clientY - canvas.getBoundingClientRect().top;
    for (let i = 0; i < moves.length; i++) {
        let square = get_piece(mouseX, mouseY)
        if (moves[i] == square) {
            console.log("steppd myself");
            board[moves[i]] = active_piece;
            board[active] = 0;
            end_turn()
            string_board = stringfy_board(board)
            active = undefined;
            active_piece = undefined;
            moves = []
        }
    }
    if (moves.length != 0) {
        board[active] = active_piece;
        string_board = stringfy_board(board)
    }
    return
}

function hold_piece(e) {
    let mouseX = e.clientX - canvas.getBoundingClientRect().left;
    let mouseY = e.clientY - canvas.getBoundingClientRect().top;
    active_piece = board[active]
        // board[active] = 0;
        // string_board = stringfy_board(board)

}

function end_turn() {
    main_game_var.current_turn += 1;
    if (main_game_var.current_player === 0) {
        main_game_var.current_player = 1
    } else {
        main_game_var.current_player = 0
    }
    reverse_turn(board)
}

function reverse_turn(board) {
    for (let i = 0; i < board.length; i++) {
        let item = board[i];
        if (typeof item === "string") {
            if (item == item.toUpperCase()) {
                item = item.toLowerCase();
            } else if (item == item.toLowerCase()) {
                item = item.toUpperCase();
            }
        }
        board[i] = item
    }
}

function start() {
    board = create_board(string_board);
    console.log(board);
    draw()
}

start();