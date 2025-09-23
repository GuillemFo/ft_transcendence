import user_routes from './users/user_routes.js';
// import avatar_routes from './avatars/avatar_routes.js';
import match_history_routes from './match_history/match_history_routes.js';

const routes = []

user_routes.forEach((route) => {
    routes.push(route);
})

//* Uncomment this for documentation on swaggerui
// avatar_routes.forEach((route) => {
//     routes.push(route);
// })

match_history_routes.forEach((route) => {
    routes.push(route);
})

export default routes;