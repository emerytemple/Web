// Author: Emery Temple

var key_state = {
	up_pressed: false,
	down_pressed: false,
	left_pressed: false,
	right_pressed: false
}

var game_state = {
	background_updated: false,
	game_updated: false,
	ui_updated: false
}

var frame_data = {
	last_frame: null,
	curr_frame: null,
	dt: null,
	frame_rate: null
}

var game_data = {
	gravity: -1,
	height: 576,
	width: 864
}

var player = {
	frames_jumped: 0,
	jump_frames: 30,
	is_ducking: false,
	is_jumping: false,
	is_jumping_left: false,
	is_jumping_right: false,
	is_running_left: false,
	is_running_right: false,
	speed: 10, // pixels/frame
	height: 50,
	width: 50,
	xpos: 400,
	ypos: 432-60
}

var player_sprite = {
	curr_frame: 0,
	sprite_rows: 4,
	sprite_cols: 4,
	width: 45,
	height: 70,
	// stand: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
	jump_left: [10],
	jump: [1],
	jump_right: [13],
	stand: [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4],
	left: [9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12],
	right: [13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16],
	duck: [2],
	tilesheet: null,
	tile_to_sprite_col: function(tile) {
		var mod = tile%player_sprite.sprite_cols;

		if (mod == 0) {
			return player_sprite.sprite_cols;
		} else {
			return mod;
		}
	},
	tile_to_sprite_row: function(tile) {
		return Math.ceil(tile/player_sprite.sprite_cols);
	}
}

var map = {
	cols: 12,
	rows: 8,
	tsize: 72,
	tilesheet: null,
	sprite_cols: 13,
	sprite_rows: 13,
	tiles: [
		  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
		  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
		  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
		  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
		  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
		  0,   0,   0,   0,   0,   0,   0,  70,   0,   0,   0,   0,
		139,  10,  10,  10,  10,  10,  10,  10,  10,  10,  10, 113,
		  0,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   0
	],
	get_tile: function(row, col) {
		return this.tiles[row*map.cols+col];
	},
	tile_to_sprite_col: function(tile) {
		return tile%map.sprite_cols;
	},
	tile_to_sprite_row: function(tile) {
		return Math.ceil(tile/map.sprite_cols);
	}
}

function loading_screen() {
	console.log('loading background spritesheet...');
	var map_img = new Image(); // look into image preloading tactics
	map_img.src = 'assets/tiles_spritesheet.png';

	map_img.onload = function() {
		console.log('loading player spritesheet...');
		var player_img = new Image(); // look into image preloading tactics
		player_img.src = 'assets/download.png';

		player_img.onload = function() {
			map.tilesheet = map_img;
			player_sprite.tilesheet = player_img;
			console.log('loading complete!');

			window.requestAnimationFrame(render);
		}
	}
	
}

function render(timestamp) {

	// full 60 fps
	window.requestAnimationFrame(render);

	if (frame_data.last_frame == null) {
		frame_data.last_frame = timestamp;
	} else {
		frame_data.last_frame = frame_data.curr_frame;
	}

	frame_data.curr_frame = timestamp;
	
	frame_data.dt = frame_data.curr_frame - frame_data.last_frame;
	frame_data.frame_rate = 1000.0/frame_data.dt;

	if (game_state.background_updated == false) {
		draw_background();
		game_state.background_updated = true;
	}
	if (game_state.game_updated == false) {
		draw_game();
		game_state.game_updated = true;
	}
	if (game_state.ui_updated == false) {
		draw_ui();
		game_state.ui_updated = true;
	}

	game_state.game_updated = false;
	game_state.ui_updated = false;
}

function draw_background() {
	var bg_ctx = document.getElementById('background-layer').getContext('2d');

	for (var r = 0; r < map.rows; r++) {
		for (var c = 0; c < map.cols; c++) {		
			var tile = map.get_tile(r, c);

			if(tile !== 0) { // 0 => empty tile
				var tc = map.tile_to_sprite_col(tile);
				var tr = map.tile_to_sprite_row(tile); // maybe check to make sure not greater than max rows

				bg_ctx.drawImage(
					map.tilesheet,
					(tc-1)*map.tsize, (tr-1)*map.tsize, // source x, y
					map.tsize, map.tsize, // source w, h
					c*map.tsize, r*map.tsize, // target x, y
					map.tsize, map.tsize // target w, h
				);
			}
		}
	}
}

function draw_game() {
	var game_ctx = document.getElementById('game-layer').getContext('2d');

	game_ctx.clearRect(0, 0, game_data.width, game_data.height);

	// move player
	// add better collision detection later
	
	// up
	if (key_state.up_pressed == true && player.is_jumping == false) {
		player.is_jumping = true;

	}

	// left
	if (key_state.left_pressed == true && player.xpos >= player.speed) {
		player.xpos -= player.speed;
		player.xvel = -player.speed;

		player.is_running_left = true;
		player.is_jumping_left = true;
	} else {
		player.is_running_left = false;
		player.is_jumping_left = false;
	}

	// right
	if (key_state.right_pressed == true && player.xpos <= game_data.width - player.width - player.speed) {
		player.xpos += player.speed;
		player.xvel = player.speed;

		player.is_running_right = true;
		player.is_jumping_right = true;
	} else {
		player.is_running_right = false;
		player.is_jumping_right = false;
	}

	// down
	if(key_state.down_pressed == true) {
		player.is_ducking = true;
	} else {
		player.is_ducking = false;
	}

	// implement physics later
	if (player.is_jumping == true) {
		player.frames_jumped++;
		if (player.frames_jumped >= player.jump_frames/2) {
			// console.log(player.frames_jumped, player.jump_frames, 1);
			player.ypos += player.speed;
		} else {
			// console.log(player.frames_jumped, player.jump_frames, 3);
			player.ypos -= player.speed;
		}

		if (player.frames_jumped > player.jump_frames) {
			// console.log(player.frames_jumped, player.jump_frames, 2);
			player.frames_jumped = 0;
			player.ypos = 432-60;
			player.yvel = 0;
			player.yacc = 0;
			player.is_jumping = false;			
		}
	}

	// draw player
	if (player.is_jumping == true) {
		if (player.is_jumping_right == true) {
			get_player_animation(player_sprite.jump_right, game_ctx);
		}
		else if (player.is_jumping_left == true) {
			get_player_animation(player_sprite.jump_left, game_ctx);
		} else {
			get_player_animation(player_sprite.jump, game_ctx);
		}
	} else if (player.is_ducking == true) {
		get_player_animation(player_sprite.duck, game_ctx);
	} else if (player.is_running_left == true) {
		get_player_animation(player_sprite.left, game_ctx);
	} else if (player.is_running_right == true) {
		get_player_animation(player_sprite.right, game_ctx);
	} else { // standing around
		get_player_animation(player_sprite.stand, game_ctx);
	}

};

function get_player_animation(array, ctx) {
	var tc = player_sprite.tile_to_sprite_col(array[player_sprite.curr_frame]);
	var tr = player_sprite.tile_to_sprite_row(array[player_sprite.curr_frame]);
	// console.log('stand[', player_sprite.curr_frame, '] = ', array[player_sprite.curr_frame], 'ans = ', tr, tc)
	ctx.drawImage(player_sprite.tilesheet,
					   (tc-1)*player_sprite.width, (tr-1)*player_sprite.height,
					   player_sprite.width, player_sprite.height,
					   player.xpos, player.ypos,
					   player_sprite.width, player_sprite.height
	);

	// advance animation
	player_sprite.curr_frame++;
	player_sprite.curr_frame %= array.length;
}

function draw_ui() {
	var ui_ctx = document.getElementById('ui-layer').getContext('2d');

	var fps = 'fps = ' + frame_data.frame_rate.toFixed(3) + ' ' +
			  'dt = ' + frame_data.dt.toFixed(3);
	var btn = 'button: up = ' + key_state.up_pressed + ' ' +
			  'down = ' + key_state.down_pressed + ' ' +
			  'left = ' + key_state.left_pressed + ' ' +
			  'right = ' + key_state.right_pressed;
	var pos = 'xpos = ' + player.xpos.toPrecision(3) + ' ' +
			  'ypos = ' + player.ypos.toPrecision(3);
	var jmp = 'is_jumping = ' + player.is_jumping + ' frames jumped = ' + player.frames_jumped + ' ' +
			  'is_jumping_left = ' + player.is_jumping_left + ' is_jumping_right = ' + player.is_jumping_right;
	var duck = 'is_ducking = ' + player.is_ducking;
	var run = 'is_running_left = ' + player.is_running_left + ' is_running_right = ' + player.is_running_right;

	ui_ctx.clearRect(0, 0, game_data.width, game_data.height);
	
	ui_ctx.fillText(fps, 10, 50);
	ui_ctx.fillText(btn, 10, 60);
	ui_ctx.fillText(pos, 10, 70);
	ui_ctx.fillText(jmp, 10, 90);
	ui_ctx.fillText(duck, 10, 100);
	ui_ctx.fillText(run, 10, 110);
}

document.addEventListener('keydown', keydown_handler, false);
document.addEventListener('keyup', keyup_handler, false);

function keydown_handler(event) {
	var key = event.key;
	var type = event.type;

	if (key == 'ArrowUp') {
		key_state.up_pressed = true;
	} else if (key == 'ArrowLeft') {
		key_state.left_pressed = true;
	} else if (key == 'ArrowRight') {
		key_state.right_pressed = true;
	} else if (key == 'ArrowDown') {
		key_state.down_pressed = true;
	}
	
	// step through each frame
	if (key == ' ') {
		window.requestAnimationFrame(render);
	}
};

function keyup_handler(event) {
	var key = event.key;
	var type = event.type;

	if (key == 'ArrowUp') {
		key_state.up_pressed = false;
	} else if (key == 'ArrowLeft') {
		key_state.left_pressed = false;
	} else if (key == 'ArrowRight') {
		key_state.right_pressed = false;
	} else if (key == 'ArrowDown') {
		key_state.down_pressed = false;
	}
};

loading_screen();