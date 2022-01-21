import { LocalStorageKeys } from '../util/LocalStorageKeys';

/* eslint-disable no-extend-native */
String.prototype.hashCode = function () {
  var hash = 0;
  for (var i = 0; i < this.length; i++) {
    var char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash % 1234567);
};

const CreatePlayer = (username, gameId, db) => {
  const playerId = username.toString().hashCode();
  db('PLAYERS').insert({ username: username, playerid: playerId, gameid: gameId }).one();
  localStorage.setItem(LocalStorageKeys.PlayerId, playerId);
  localStorage.setItem(LocalStorageKeys.Username, username);
  return true;
};

const IsUsernameAvailable = (username, db, e) => {
  db('PLAYERS')
    .return('username')
    .where(e.eq('username', username))
    .one()
    .then((res) => {
      if (res && res['username'] === username) {
        return false;
      } else {
        return true;
      }
    })
    .catch(() => {
      return true;
    });
};

const UsernameByPlayerId = (id, db, e) => {
  db('PLAYERS')
    .return('username')
    .where(e.eq('playerid', id))
    .one()
    .then((res) => {
      if (res && res['username']) {
        return res['username'];
      } else {
        return null;
      }
    });
};

export { CreatePlayer, IsUsernameAvailable, UsernameByPlayerId };
