const canvas = document.getElementsByTagName("canvas")[0];
const c = canvas.getContext("2d");
canvas.height = "640";
canvas.width = "640";
const width = canvas.width; 
const height = canvas.height;
const width_square = width / 8;
const height_square = height / 8;
const width_piece = 333;
const height_piece = 334;
const start_board = "cnbkqbnc/pppppppp/8/8/8/8/PPPPPPPP/CNBKQBNC";
var string_board = "8/3Q/4c/3q/8/8/8/8";
var board = [];
var moves = [];  
var active;
var active_piece;

var down = false;
var active_piece;

// canvas.addEventListener("mousedown", function(e) {
//     down = true;
//     canvas.style.cursor = "grabbing";
//     set_active(e)
//     hold_piece(e)
// })

window.addEventListener("mouseup", function(e) {
    down = false;
    canvas.style.cursor = "pointer";
})

canvas.addEventListener("click", function(e) {
    if (active == undefined) {
        set_active(e)
    }
    else{
        move_piece(e)
    }
})

canvas.addEventListener("mousemove", function(e) {
    let mouseX = e.clientX - canvas.getBoundingClientRect().left;
    let mouseY = e.clientY - canvas.getBoundingClientRect().top
    // if(down){
    //     console.log(e);
    // }
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
            c.fillRect(i* width_square, j* height_square, width_square, height_square); 
        }
    }
}

function draw_active(){
    if (board[active] != 0 || active == null) {
        c.fillStyle = "#026923";
        c.fillRect(active%8 * width_square, Math.floor(active/8)*height_square, width_square, height_square)
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
            c.arc(moves[i]%8 * width_square + width_square/2, Math.floor(moves[i]/8)*height_square + height_square / 2, width_square / 2.4, 0, 2 * Math.PI)
            c.fill();
        }
        else {
            c.fillStyle = green;
            c.strokeStyle = green;
            c.arc(moves[i]%8 * width_square + width_square/2, Math.floor(moves[i]/8)*height_square + height_square / 2, width_square / 3, 0, 2 * Math.PI)
            c.lineWidth = 10;
        }
        c.stroke();
    }
}

function draw_pieces(layout){
    let posx = 0;
    let posy = 0;
    for (let i = 0; i < layout.length; i++) {
        piece = layout[i];
        if (piece == "/") {
            posy += height_square;
            posx = 0;
        }
        else if (parseInt(piece)){
            let total = parseInt(piece) * width_square;
            posx += total;
        }
        else{
            draw_piece(piece, posx, posy)
            posx +=  width_square;  
        }
    }
    return 0;
}

function draw_piece(piece, posx, posy){
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
    let sprite = new Image();
    sprite.src = "pieces.png"   
    c.drawImage(sprite, width_piece * type, height_piece * color, width_piece, height_piece, posx, posy, width_square, height_square)    
}

function draw() {
    draw_board();
    draw_active()
    draw_pieces(string_board);
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
        }
        else if(parseInt(board[i])) {
            for (let j = 0; j < parseInt(board[i]); j++) {
                new_board.push(0);
                square_count++
            }
        }
        else{
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
            if (board[i*8+j] != 0) {
                if (counter != 0) {
                    new_board = new_board.concat(counter);
                    counter = 0;
                }
                new_board = new_board.concat(board[i*8+j])
            }
            else{
                counter++
            }
        }
        if (new_board[new_board.length -1] == "/" || new_board[new_board.length] == undefined) {
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
            moves_pawn(1)
            break;
        // case "P":
        //     moves_pawn(-1);
        //     break;
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
    }
}

function moves_pawn(color) {
    moves.push(active + 8 * color);
    if (active > 7 && active < 16 || active > 47 && active < 56 ) {
        moves.push(active + 16 * color)
    }
}

function moves_castle() {
    let dir = [Math.floor(active/8), 7 - active%8, 7 - Math.floor(active/8), active%8];
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
            }
            else{
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
                }
                else{
                    break;
                }
            }
            else{
                break;
            }
            prev = new_move;
        }
        prev = active;
    }
}

function get_color_square (square) {
    let row_color = Math.floor(square/8)%2 
    let column_color = (square%8)%2; 
    if (row_color == 0 && column_color == 0 || row_color ==1 && column_color == 1) {
        return "black";
    }
    else{
        return "white";
    }
}

function blocked(move) {
    if (board[move] != 0 && move != active) {
        if (board[move] == board[move].toLowerCase()) {
            return false;
        }
        else if(board[move] == board[move].toUpperCase()){
            return true;
        }
    }
    else{
        return true
    }
}

function set_active(e) {
    moves = [];
    let mouseX = e.clientX - canvas.getBoundingClientRect().left;
    let mouseY = e.clientY - canvas.getBoundingClientRect().top;
    
    active = get_piece(mouseX, mouseY);
    check_moves();
}

function move_piece(e) {
    let mouseX = e.clientX - canvas.getBoundingClientRect().left;
    let mouseY = e.clientY - canvas.getBoundingClientRect().top;;
    for (let i = 0; i < moves.length; i++) {
        let square = get_piece(mouseX, mouseY)
        if (moves[i] == square) {
            board[moves[i]] = board[active];
            board[active] = 0;
            string_board = stringfy_board(board)
            active = undefined;
            moves = []
            return;
        }
    }
    return set_active(e)
}

function hold_piece(e) {
    let mouseX = e.clientX - canvas.getBoundingClientRect().left;
    let mouseY = e.clientY - canvas.getBoundingClientRect().top;
    board[active] = 0;
    console.log(board);
    string_board = stringfy_board(board)

}

function start() {
    board = create_board(string_board);
    console.log(board);
    draw()
}

start();

