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
const start_board = "CNBQKBNC/PPPPPPPP/8/8/8/8/pppppppp/cnbqkbnc";
// var string_board = "8/8/3n/8/5N/8/8/8";
var string_board = start_board
var board = [];
var moved_board = [];
for(let i=0;i<64;i++)if(i>15&&i<48){moved_board[i]=1}else{moved_board[i]=0};
var moves = [];
var active;
var prev_active;
var active_piece;
var kings_moved = [0,0];
var castles_moved = [0,0,0,0];
var en_passant = false;
var Player = 0;

main_game_var = {
    //current_player == 1 => zwart && current_player == 0 => wit
    current_player: 0,
    current_turn: 1,
    game_over: 0,
}

var down = false;

Mouse = {
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0
}

function limit(num, min=0, max=10){if (num<min){return min;}else if(num>max){return max;}return num;}
function mod(num, max=10){if(num>max){return num%max}return num}
function absolute(num){if(num<0){return num*-1}return num}
function iterate(max, value){let temp = [];for(let i=0;i<max;i++){temp.push(value)}return temp}

canvas.addEventListener("mousedown", function(e) {
    // if (active == undefined) {
    if(main_game_var.game_over==0){
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
    }
})

window.addEventListener("mouseup", function(e) {
    if(main_game_var.game_over==0){
        console.log("mouseup");
        down = false;
        canvas.style.cursor = "pointer";
        check_moves()
        move_piece(e)
    }
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
    if(main_game_var.game_over==0){
        if (down) {
            Mouse.x = e.clientX - canvas.getBoundingClientRect().left;
            Mouse.y = e.clientY - canvas.getBoundingClientRect().top
        }
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
    if(main_game_var.game_over==1){
        console.log("Player 2 won!");
        main_game_var.game_over=3;
    }else if(main_game_var.game_over==2){
        console.log("Player 1 won!");
        main_game_var.game_over=3;
    }
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
    if (moves.length != 0) {
        return
    }
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
        case "n":
            move_knight()
            break;
    }
}

function moves_pawn(player) {
    if (player == 0) {
        if (active > 7 && board[active - 8] == 0 && blocked(active - 8)) moves.push(active - 8);
        if (active > 7 && board[active - 7] != 0 && blocked(active - 7)) moves.push(active - 7);
        if (active > 7 && board[active - 9] != 0 && blocked(active - 9)) moves.push(active - 9);
        if (active > 7 && board[active + 1] == "P" && blocked(active + 1)) {moves.push(active - 7);en_passant=true}
        if (active > 7 && board[active - 1] == "P" && blocked(active - 1)) {moves.push(active - 9);en_passant=true}
        if (active > 47 && active < 56 && blocked(active - 16) && board[active-16]==0) moves.push(active - 16)
    } else {
        if (active < 56 && board[active + 8] == 0 && blocked(active + 8)) moves.push(active + 8);
        if (active < 56 && board[active + 7] != 0 && blocked(active + 7)) moves.push(active + 7);
        if (active < 56 && board[active + 9] != 0 && blocked(active + 9)) moves.push(active + 9);
        if (active < 56 && board[active - 1] == "P" && blocked(active - 1)) {moves.push(active + 7);en_passant=true}
        if (active < 56 && board[active + 1] == "P" && blocked(active + 1)) {moves.push(active + 9);en_passant=true}
        if (active > 7 && active < 16 && blocked(active + 16) && board[active+16]==0) moves.push(active + 16);
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
    possible_moves = [-1, 7, -9, 8, -8, 1, -7, 9]
    let column = active % 8
    console.log(column);
    if (column == 0) {
        possible_moves.splice(0, 3)
    } else if (column == 7) {
        possible_moves.splice(5, 3)
    }
    for (let i = 0; i < possible_moves.length; i++) {
        if (0 <= active + possible_moves[i] && active + possible_moves[i] < 64 && blocked(active + possible_moves[i])) moves.push(active + possible_moves[i])

    }
    if(moved_board[active]==0){
        if(board[active+1]==0&&board[active+2]==0&&moved_board[active+3]==0){
            moves.push(active+2)
        }else if(board[active-1]==0&&board[active-2]==0&&board[active-3]==0&&moved_board[active-4]==0){
            moves.push(active-2)
        }
    }
}

function move_knight() {
    possible_moves = [-10, 6, 15, -17, -15, 17, 10, -6]
        // -10, 6, -15, 17,  
        // -17, 15, 10, -6
        // 15, 17, 6, 10, -15, -17, -6, -10
    let column = active % 8
    switch (column) {
        case 0:
            possible_moves.splice(0, 4)
            break
        case 1:
            possible_moves.splice(0, 2)
            break
        case 6:
            possible_moves.splice(6, 2)
            break;
        case 7:
            possible_moves.splice(4, 4)
            break;
    }
    console.log(possible_moves);

    for (let i = 0; i < possible_moves.length; i++) {
        if (0 <= active + possible_moves[i] && active + possible_moves[i] < 64 && blocked(active + possible_moves[i])) moves.push(active + possible_moves[i])
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
            if (en_passant){
                let temp = absolute(moves[i]-active)
                if (temp == 7){
                    board[active-((Player*2)-1)] = 0;
                }else if (temp == 9){
                    board[active+((Player*2)-1)] = 0;
                }
            }
            if(board[active].toLowerCase()=="k"&&moves[i]==active+2){
                board[moves[i]-1] = board[moves[i]+1];
                board[moves[i]+1] = 0;
            }else if(board[active].toLowerCase()=="k"&&moves[i]==active-2){
                board[moves[i]+1] = board[moves[i]-2];
                board[moves[i]-2] = 0;
            }
            console.log("steppd myself");
            if(board[active]=="p"&&(moves[i]<8||moves[i]>55)){
                board[moves[i]] = "q";
            }else{
                board[moves[i]] = active_piece;
            }
            board[active] = 0;
            moved_board[active] = 1;
            end_turn()
            string_board = stringfy_board(board)
            active = undefined;
            active_piece = undefined;
            moves = []
        }
    }
    if (moves.length != 0) {
        board[active] = active_piece;
        console.log(active)
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
    no_king();
    main_game_var.current_turn += 1;
    if (main_game_var.current_player === 0) {
        main_game_var.current_player = 1
    } else {
        main_game_var.current_player = 0
    }
    Player = mod(Player+1, 1);
    reverse_turn(board);
    console.log(main_game_var.game_over)
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

function no_king() {
    if(Player == 0){
        if(board.indexOf("k")==-1){
            main_game_var.game_over = 1;
        }else if(board.indexOf("K")==-1){
            main_game_var.game_over = 2;
        }
    }else{
        if(board.indexOf("k")==-1){
            main_game_var.game_over = 2;
        }else if(board.indexOf("K")==-1){
            main_game_var.game_over = 1;
        }
    }
}

function start() {
    board = create_board(string_board);
    console.log(board);
    draw()
}

start();