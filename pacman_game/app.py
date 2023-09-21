from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

players = {}
games = {}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('create_game')
def create_game():
    session_id = request.sid
    games[session_id] = {'players': {session_id: {'x': 200, 'y': 200, 'dir': 'RIGHT'}}}
    join_room(session_id)
    emit('game_created', {'game_id': session_id}, room=session_id)

@socketio.on('join_game')
def join_game(data):
    game_id = data['game_id']
    session_id = request.sid
    if game_id in games:
        games[game_id]['players'][session_id] = {'x': 200, 'y': 200, 'dir': 'RIGHT'}
        join_room(game_id)
        emit('update_game', {'players': games[game_id]['players']}, room=game_id)

@socketio.on('connect')
def handle_connect():
    session_id = request.sid
    players[session_id] = {
        'x': 200,  
        'y': 200,
        'dir': 'RIGHT'
    }
    emit('update_game', {'players': players})

@socketio.on('player_move')
def handle_player_move(data):
    session_id = request.sid
    players[session_id] = data['pacman']
    emit('update_game', {'players': players}, broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    session_id = request.sid
    if session_id in players:
        del players[session_id]
    emit('update_game', {'players': players}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=False, host='0.0.0.0', port=5000)
