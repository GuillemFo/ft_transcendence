'use strict';
import MatchHistoryController from './MatchHistoryController.js';

const routes = [
	{
		method: "GET",
		url: "/match_history",
		handler: MatchHistoryController.get_all,
		schema: {
			description: 'Returns all matches',
			tags: ['match history'],
			summary: 'Get all matches',
		}
	},
	{
        method: "GET",
		url: "/match_history/:id",
		handler: MatchHistoryController.get_one,
		schema: {
            description: 'Returns specific match',
			tags: ['match history'],
			summary: 'Get one match',
			params: {
				type: 'object',
				properties: {
                    id: {
                        type: 'string',
						description: 'match id'
					}
				}
			}
		}
	},
    {
        method: "GET",
        url: "/match_history/get_by_userId/:userId",
        handler: MatchHistoryController.get_matches_by_user,
        schema: {
            description: 'Returns all matches from a specific user',
            tags: ['match history'],
            summary: 'Get matches by userId',
            params: {
                type: 'object',
                properties: {
                    userId: {
                        type: 'string',
                        description: 'user id'
                    }
                }
            }
        }
    },
	{
		method: "POST",
		url: "/match_history",
		handler: MatchHistoryController.create,
		schema: {
			description: 'Creates a new match on the database',
			tags: ['match history'],
			summary: 'Register match',
			body: {
				type: 'object',
				properties: {
					duration: { type: 'string' },
					parry_streak: { type: 'string' },
					bounce_streak: { type: 'string' },
                    player1: { type: 'string' },
                    player1_score: { type: 'string' },
                    player1_bounce_count: { type: 'string' },
                    player1_parry_attempts:{ type: 'string' },
					player1_parry_count:{ type: 'string' },
                    player2: { type: 'string' },
                    player2_score: { type: 'string' },
                    player2_bounce_count: { type: 'string' },
                    player2_parry_attempts:{ type: 'string' },
					player2_parry_count:{ type: 'string' },
				}
			},
		}
	},
]

export default routes;