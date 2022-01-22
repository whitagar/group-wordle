import { LocalStorageKeys } from '../util/LocalStorageKeys';

const CreateGame = (maxPlayers, playerId, code, db) => {
  db('GAMES').insert({ playerid: playerId, maxplayers: maxPlayers, code: code }).one();
  localStorage.setItem(LocalStorageKeys.GameId, playerId);
  return true;
};

const DeleteGame = (playerId, db, e) => {
  db('GAMES').delete().where(e.eq('playerid', playerId)).all();
  localStorage.setItem(LocalStorageKeys.GameId, null);
};

const GameIdByCode = async (code, db, e) => {
  const game = await db('GAMES').return('playerid').where(e.eq('code', code)).one();

  if (game && game['playerid']) {
    return game['playerid'];
  } else {
    return null;
  }
};

export { CreateGame, GameIdByCode, DeleteGame };
