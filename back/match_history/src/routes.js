'use strict';
import MatchHistoryController from './MatchHistoryController.js';

const routes = [
	{
		method: "GET",
		url: "/match_history",
		handler: MatchHistoryController.get_all,
	},
    {
        method: "GET",
        url: "/match_history/get_by_userId/:userId",
        handler: MatchHistoryController.get_matches_by_user,
    },
	{
        method: "GET",
        url: "/match_history/:id",
        handler: MatchHistoryController.get_one,
	},
	{
		method: "POST",
		url: "/match_history",
		handler: MatchHistoryController.create,
	},
	{
		method: "PUT",
		url: "/match_history/forget_user/:userId",
		handler: MatchHistoryController.forget_user,
	}
]

export default routes;