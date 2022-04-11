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
var pvb = false;
var square;
var warning = [];
var move_number = 0;

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

function randomnum(max){return Math.floor((Math.random())*(max))}
function limit(num, min=0, max=10){if (num<min){return min;}else if(num>max){return max;}return num;}
function mod(num, max=10){if(num>max){return num%max}return num}
function absolute(num){if(num<0){return num*-1}return num}
function iterate(max, value){let temp = [];for(let i=0;i<max;i++){temp.push(value)}return temp}
function equalslowercase(value){if(value==value.toLowerCase()){return true}return false}

function pieceValue(piece){
    switch(piece){
        case "p":
            return 2;
        case "c":
            return 7;
        case "b":
            return 4;
        case "q":
            return 9;
        case "k":
            return 1;
        case "n":
            return 5;
    }
}

function pieceValueOther(piece){
    switch(piece){
        case "p":
            return 3;
        case "c":
            return 7;
        case "b":
            return 4;
        case "q":
            return 10;
        case "k":
            return 15;
        case "n":
            return 5;
        default:
            return 1;
    }
}

canvas.addEventListener("mousedown", function(e) {
    // if (active == undefined) {
    if(main_game_var.game_over==0 && !(main_game_var.current_player==1 && pvb)){
        if (!valid_move(e)) {
            down = true;
            canvas.style.cursor = "grabbing";
            set_active(e)
            hold_piece(e)
            Mouse.x = e.clientX - canvas.getBoundingClientRect().left;
            Mouse.y = e.clientY - canvas.getBoundingClientRect().top
            Mouse.offsetX = e.x - canvas.getBoundingClientRect().left - (active % 8 * width_square);
            Mouse.offsetY = e.y - canvas.getBoundingClientRect().top - (Math.floor(active / 8) * height_square);
        }
    }
})

window.addEventListener("mouseup", function(e) {
    if(main_game_var.game_over==0 && !(main_game_var.current_player==1 && pvb)){
        down = false;
        canvas.style.cursor = "pointer";
        check_moves()
        move_piece(e)
    }
})

canvas.addEventListener("mousemove", function(e) {
    if(main_game_var.game_over==0 && !(main_game_var.current_player==1 && pvb)){
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

function end_of_game(){
    console.log("End");
}

function draw() {
    c.clearRect(0, 0, width, height);
    draw_board();
    draw_active()
    draw_pieces(stringfy_board(board));
    draw_grabbed();
    if(main_game_var.game_over==1){
        console.log("Player 2 won!");
        main_game_var.game_over=3;
        end_of_game();
    }else if(main_game_var.game_over==2){
        console.log("Player 1 won!");
        main_game_var.game_over=3;
        end_of_game();
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

function check_moves(player=0) {
    if (moves.length != 0) {
        return
    }
    switch (board[active]) {
        case "p":
            moves_pawn(player)
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

function moves_pawn(player, index=active) {
    if (player == 0) {
        if (index > 7 && board[index - 8] == 0 && blocked(index - 8)) moves.push(index - 8);
        if (index > 7 && board[index - 7] != 0 && blocked(index - 7)) moves.push(index - 7);
        if (index > 7 && board[index - 9] != 0 && blocked(index - 9)) moves.push(index - 9);
        //if (index > 7 && board[index + 1] == "P" && blocked(index + 1)) {moves.push(index - 7);en_passant=true}
        //if (index > 7 && board[index - 1] == "P" && blocked(index - 1)) {moves.push(index - 9);en_passant=true}
        if (index > 47 && index < 56 && blocked(index - 16) && board[index-16]==0) moves.push(index - 16)
    } else {
        if (index < 56 && board[index + 8] == 0 && blocked(index + 8)) moves.push(index + 8);
        if (index < 56 && board[index + 7] != 0 && blocked(index + 7)) moves.push(index + 7);
        if (index < 56 && board[index + 9] != 0 && blocked(index + 9)) moves.push(index + 9);
        //if (index < 56 && board[index - 1] == "P" && blocked(index - 1)) {moves.push(index + 7);en_passant=true}
        //if (index < 56 && board[index + 1] == "P" && blocked(index + 1)) {moves.push(index + 9);en_passant=true}
        if (index > 7 && index < 16 && blocked(index + 16) && board[index+16]==0) moves.push(index + 16);
    }
}

function moves_castle(index=active) {
    let dir = [Math.floor(index / 8), 7 - index % 8, 7 - Math.floor(index / 8), index % 8];
    let counter = -8;
    for (let i = 0; i < dir.length; i++) {
        let prev = index;
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

function move_bishop(index=active) {
    let prev = index;
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
        prev = index;
    }
}

function move_king(index=active) {
    possible_moves = [-1, 7, -9, 8, -8, 1, -7, 9]
    let column = index % 8
    if (column == 0) {
        possible_moves.splice(0, 3)
    } else if (column == 7) {
        possible_moves.splice(5, 3)
    }
    for (let i = 0; i < possible_moves.length; i++) {
        if (0 <= index + possible_moves[i] && index + possible_moves[i] < 64 && blocked(index + possible_moves[i])) moves.push(index + possible_moves[i])

    }
    if(moved_board[index]==0){
        if(board[index+1]==0&&board[index+2]==0&&moved_board[index+3]==0){
            moves.push(index+2)
        }else if(board[index-1]==0&&board[index-2]==0&&board[index-3]==0&&moved_board[index-4]==0){
            moves.push(index-2)
        }
    }
}

function move_knight(index=active) {
    possible_moves = [-10, 6, 15, -17, -15, 17, 10, -6]
        // -10, 6, -15, 17,  
        // -17, 15, 10, -6
        // 15, 17, 6, 10, -15, -17, -6, -10
    let column = index % 8
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

    for (let i = 0; i < possible_moves.length; i++) {
        if (0 <= index + possible_moves[i] && index + possible_moves[i] < 64 && blocked(index + possible_moves[i])) moves.push(index + possible_moves[i])
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
    try{
        if (board[move] != 0 && move != active) {
            if (board[move] == board[move].toLowerCase()) {
                return false;
            } else if (board[move] == board[move].toUpperCase()) {
                return true;
            }
        } else {
            return true;
        }
    }catch{
        return false;
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
    check_moves(main_game_var.current_player);
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

function move_piece(e=null, mouseX=-1, mouseY=-1) {
    try{
        mouseX = e.clientX - canvas.getBoundingClientRect().left;
        mouseY = e.clientY - canvas.getBoundingClientRect().top;
    }catch{
        mouseX = -1;
        mouseY = -1;
    }
    for (let i = 0; i < moves.length; i++) {
        if(!(main_game_var.current_player==1 && pvb)){
            square = get_piece(mouseX, mouseY);
        }
        if (moves[i] == square) {
            if (en_passant){
                let temp = absolute(moves[i]-active)
                if (temp == 7){
                    board[active-((Player*2)-1)] = 0;
                }else if (temp == 9){
                    board[active+((Player*2)-1)] = 0;
                }
            }
            try{
                if(board[active].toLowerCase()=="k"&&moves[i]==active+2){
                    board[moves[i]-1] = board[moves[i]+1];
                    board[moves[i]+1] = 0;
                }else if(board[active].toLowerCase()=="k"&&moves[i]==active-2){
                    board[moves[i]+1] = board[moves[i]-2];
                    board[moves[i]-2] = 0;
                }
                if(board[active]=="p"&&(moves[i]<8||moves[i]>55)){
                    board[moves[i]] = "q";
                }else{
                    board[moves[i]] = active_piece;
                }
            }catch{}
            board[active] = 0;
            moved_board[active] = 1;
            warning = moves;
            string_board = stringfy_board(board)
            end_turn();
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
    move_number++;
    console.log(move_number);
    no_king();
    main_game_var.current_turn += 1;
    if (main_game_var.current_player === 0) {
        main_game_var.current_player = 1
    } else {
        main_game_var.current_player = 0
    }
    Player = mod(Player+1, 1);
    active = undefined;
    active_piece = undefined;
    moves = [];
    console.log("Test")
    reverse_turn(board);
    en_passant=false;
    draw_pieces(stringfy_board(board));
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
    draw();
}

start();
