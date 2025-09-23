PRAGMA foreign_keys=ON;
BEGIN TRANSACTION;
CREATE TABLE `users` (
	`id` TEXT NOT NULL PRIMARY KEY UNIQUE,
	`username` TEXT NOT NULL UNIQUE,
	`password` TEXT NOT NULL,
	`email` TEXT NOT NULL UNIQUE,
	`avatar` TEXT,
	`wins` TEXT NOT NULL DEFAULT '0',
	`losses` TEXT NOT NULL DEFAULT '0',
	`parryAttempts` TEXT NOT NULL DEFAULT '0',
	`parryCount` TEXT NOT NULL DEFAULT '0',
	`longestRally` TEXT NOT NULL DEFAULT '0',
	`longestParryChain` TEXT NOT NULL DEFAULT '0',
	`timesScoredAgainst` TEXT NOT NULL DEFAULT '0',
	`timesScored` TEXT NOT NULL DEFAULT '0'
);

INSERT INTO `users` VALUES('amaia','amaia','amaia','amaia@amaia.amaia','/avatars/amaia.png',0,0,0,0,0,0,0,0);


CREATE TABLE IF NOT EXISTS `friendships` (
	`userId` TEXT NOT NULL REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
	`friendId` TEXT NOT NULL REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
	PRIMARY KEY (`userId`, `friendId`)
	);

CREATE TABLE IF NOT EXISTS `friendRequests` (
	`userId` TEXT NOT NULL REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
	`receiverId` TEXT NOT NULL REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
	PRIMARY KEY (`userId`, `receiverId`)
	);

COMMIT;
