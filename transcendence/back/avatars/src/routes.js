'use strict';
import AvatarsController from './AvatarsController.js';

const routes = [
    {
        method: "POST",
        url: "/generate",
        handler: AvatarsController.generate_avatar,
    },
    {
        method: "PUT",
        url: "/avatars/:id/update",
        handler: AvatarsController.update_avatar,
        schema: {
            consumes: ['multipart/form-data']
        }
    },
    {
        method: "DELETE",
        url: "/:id",
        handler: AvatarsController.delete_avatar,
    },
]

export default routes;
