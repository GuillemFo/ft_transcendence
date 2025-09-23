import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';
import sharp from 'sharp';
import jwt from 'jsonwebtoken'

import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
const pump = promisify(pipeline);
const path = "/avatars/"; //for frontend proxy

class AvatarsController {
	static isAllowed(req, res) {
    	try {
			// console.log("check: ", jwt.verify(req.cookies.Authorization, fs.readFileSync('/run/secrets/password-jwt'), {maxAge: '16h'}).id , " =? ", req.params.id);
			if ((jwt.verify(req.cookies.Authorization, fs.readFileSync('/run/secrets/password-jwt'), {maxAge: '16h'}).id == req.params.id)) {
				return (true);
			}
			else {
				// console.log("Debug: Wrong credential used ", jwt.verify(req.cookies.Authorization, fs.readFileSync('/run/secrets/password-jwt')).id);
				return (false);
			}
		}
		catch (err) {
			// console.log("Debug: error catched in isAllowed(): ", err);
			return (false);
		}
	}

	async generate_avatar(req, res) {
        try {
            const filename = crypto.randomUUID();
            if (!req.body.id)
                return res.status(409).send({message: "Missing id param in body"});
            const avatar = createAvatar(bottts, {
                seed: filename,
                size: 500,
                backgroundColor: ["32323F"],
                backgroundType: ["solid"]
            })
            await sharp(Buffer.from(avatar.toString()))
                .jpeg({ quality: 100 })
                .toFile(`/api/avatars/${filename}.jpg`);
            res.status(201).send({url: `${path}${filename}.jpg`})
        } catch (err) {
            res.status(500).send(
                {message: err.message || 'Error at AvatarsController.generate_avatar'},
            );
        }
    }

    async update_avatar(req, res) {
        try {
			if (!AvatarsController.isAllowed(req, res)) {
				res.status(403).send({message: "You lack proper credentials"});
				return;
			}
            const fileData = await req.file();

            if (!["image/png", "image/jpeg"].includes(fileData.mimetype))
                return res.status(400).send({message: "Unsupported media type"})

            const filename = crypto.randomUUID();

            if (!fileData)
                return res.status(400).send({message: "No file uploaded"});
            const file = fileData.file;
            const extension = fileData.filename.split('.').pop();
            const savePath = `/api/avatars/${filename}.${extension}`;
            await pump(file, fs.createWriteStream(savePath));
            if (file.truncated)
            {
                fs.rmSync(savePath);
                return res.status(400).send({message: "File too large. Limit: 2MB"})
            }
            const response = await fetch(`http://user_management:3010/users/${req.params.id}/avatar`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({"avatar": `${path}${filename}.${extension}`})
            });
            const avatar_body = await response.json();
            if (!response.ok)
                return res.status(500).send(avatar_body);
            const old_avatar = avatar_body.old.split(path).pop()

            fs.rmSync(`/api/avatars/${old_avatar}`);
            res.status(200).send({status: "true", url: `${path}${filename}.${extension}`});
        } catch (err) {
            res.status(500).send({message: err.message || "Error saving avatar"});
        }
    }

    async delete_avatar(req, res) {
        try {
            const file = `/api/avatars/${req.params.id}.${req.query.filetype}`;
            fs.rmSync(file);
            res.status(200).send({status: true})
        } catch (err) {
            if (err.message.includes("no such file or directory"))
                res.status(404).send({message: "file not found"})
            else
                res.status(500).send(
                    {message: err.message || 'Error at AvatarsController.delete_avatar'},
                );
        }
    }
}
export default new AvatarsController();
