import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Favorite from "../../models/Favorite";
import { sendError, Errors } from "../constant/errors";

let app: FastifyInstance;

function getUserFromToken(req: FastifyRequest, res: FastifyReply): any | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token || token === "undefined") return null;
  try {
    return app.jwt.verify(token);
  } catch {
    return null;
  }
}

export class FavoritesController {
  static async init(fastify: FastifyInstance) {
    app = fastify;
    fastify.get('/favorites', getFavorites);
    fastify.post('/favorites', addFavorite);
    fastify.delete('/favorites/:gameUuid', removeFavorite);
  }
}

async function getFavorites(req: FastifyRequest, res: FastifyReply) {
  const decoded = getUserFromToken(req, res);
  if (!decoded) return sendError(res, Errors.AUTH_TOKEN_MISSING);

  const favorites = await Favorite.findAll({
    where: { userId: decoded.id },
    order: [['createdAt', 'DESC']],
  });
  return res.send(favorites.map(f => f.gameUuid));
}

async function addFavorite(req: FastifyRequest<{ Body: { gameUuid: string } }>, res: FastifyReply) {
  const decoded = getUserFromToken(req, res);
  if (!decoded) return sendError(res, Errors.AUTH_TOKEN_MISSING);

  const { gameUuid } = req.body;
  if (!gameUuid) return res.status(400).send({ error: 'gameUuid required' });

  await Favorite.findOrCreate({
    where: { userId: decoded.id, gameUuid },
  });
  return res.send({ ok: true });
}

async function removeFavorite(req: FastifyRequest<{ Params: { gameUuid: string } }>, res: FastifyReply) {
  const decoded = getUserFromToken(req, res);
  if (!decoded) return sendError(res, Errors.AUTH_TOKEN_MISSING);

  await Favorite.destroy({
    where: { userId: decoded.id, gameUuid: req.params.gameUuid },
  });
  return res.send({ ok: true });
}
