CREATE TABLE IF NOT EXISTS `match_histories` (
    `id` TEXT NOT NULL UNIQUE PRIMARY KEY,
    `duration` TEXT,
    `parry_streak` TEXT,
    `bounce_streak` TEXT,
    `player1` TEXT,
    `player1_score` TEXT,
    `player1_bounce_count` TEXT,
    `player1_parry_attempts` TEXT,
    `player1_parry_count` TEXT,
    `player2` TEXT,
    `player2_score` TEXT,
    `player2_bounce_count` TEXT,
    `player2_parry_attempts` TEXT,
    `player2_parry_count` TEXT,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL
);