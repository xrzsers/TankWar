// ==================== 游戏配置 ====================

const CONFIG = {
    // 画布设置
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    // 玩家坦克配置
    PLAYER_TANK: {
        SPEED: 150,          // 像素/秒
        ROTATION_SPEED: 180, // 度/秒
        SIZE: 30,            // 坦克大小
        FIRE_RATE: 1,        // 发/秒
        HEALTH: 1,           // 中一枪就死
        BULLET_SPEED: 300,
        BULLET_SIZE: 8
    },

    // 基地配置
    BASE: {
        SIZE: 60,
        HEALTH: 100,
        X: 400,              // 画布中心
        Y: 520               // 底部上方
    },

    // 敌坦克配置
    ENEMY_TANKS: {
        normal: {
            HEALTH: 1,
            SPEED: 120,
            FIRE_RATE: 0.8,
            BULLET_SPEED: 250,
            COLOR: '#00FF00'
        },
        heavy: {
            HEALTH: 1,
            SPEED: 80,
            FIRE_RATE: 1.0,
            BULLET_SPEED: 250,
            COLOR: '#FFFF00'
        },
        elite: {
            HEALTH: 1,
            SPEED: 150,
            FIRE_RATE: 1.5,
            BULLET_SPEED: 250,
            COLOR: '#FF00FF',
            DODGE_CHANCE: 0.5  // 躲避概率
        },
        boss: {
            HEALTH: 1,
            SPEED: 90,
            FIRE_RATE: 2.0,
            BULLET_SPEED: 250,
            COLOR: '#FF0000',
            DODGE_CHANCE: 0.3
        }
    },

    // 道具配置
    POWERUPS: {
        shield: {
            DURATION: 8000,        // 毫秒
            COLOR: '#FFD700',
            SPAWN_CHANCE: 0.2
        },
        multi: {
            DURATION: 12000,
            COLOR: '#FF00FF',
            SPAWN_CHANCE: 0.15
        },
        speed: {
            DURATION: 10000,
            COLOR: '#FF0000',
            SPAWN_CHANCE: 0.15,
            FIRE_RATE_MULTIPLIER: 2.5
        },
        heal: {
            HEAL_AMOUNT: 30,
            COLOR: '#00FF00',
            SPAWN_CHANCE: 0.2
        },
        freeze: {
            DURATION: 6000,
            COLOR: '#00FFFF',
            SPAWN_CHANCE: 0.1,
            SLOW_MULTIPLIER: 0.3
        }
    },

    // 子弹配置
    BULLET: {
        LIFETIME: 5000,  // 毫秒
        SIZE: 8
    },

    // 难度倍数
    DIFFICULTY_MULTIPLIERS: {
        easy: {
            enemySpeed: 0.8,
            enemyFireRate: 0.7,
            baseHealth: 120,
            powerupSpawnChance: 1.2
        },
        normal: {
            enemySpeed: 1.0,
            enemyFireRate: 1.0,
            baseHealth: 100,
            powerupSpawnChance: 1.0
        },
        hard: {
            enemySpeed: 1.2,
            enemyFireRate: 1.3,
            baseHealth: 80,
            powerupSpawnChance: 0.8
        },
        hell: {
            enemySpeed: 1.4,
            enemyFireRate: 1.5,
            baseHealth: 60,
            powerupSpawnChance: 0.5
        }
    },

    // 关卡配置
    LEVELS: [
        {
            level: 1,
            name: '训练营',
            totalEnemies: 5,
            waves: [
                { types: ['normal', 'normal'], delay: 2000 },
                { types: ['normal', 'normal'], delay: 5000 },
                { types: ['normal'], delay: 5000 }
            ],
            obstaclesDensity: 0.1
        },
        {
            level: 2,
            name: '边境前线',
            totalEnemies: 8,
            waves: [
                { types: ['normal', 'normal', 'normal'], delay: 0 },
                { types: ['normal', 'normal', 'normal'], delay: 6000 },
                { types: ['normal', 'normal'], delay: 6000 }
            ],
            obstaclesDensity: 0.25
        },
        {
            level: 3,
            name: '矿区冲突',
            totalEnemies: 8,
            waves: [
                { types: ['normal', 'normal', 'normal'], delay: 0 },
                { types: ['heavy', 'normal', 'normal'], delay: 8000 },
                { types: ['heavy'], delay: 5000 }
            ],
            obstaclesDensity: 0.35
        },
        {
            level: 4,
            name: '森林阻击',
            totalEnemies: 7,
            waves: [
                { types: ['normal', 'normal', 'heavy'], delay: 0 },
                { types: ['normal', 'normal', 'heavy'], delay: 8000 },
                { types: ['heavy'], delay: 5000 }
            ],
            obstaclesDensity: 0.45
        },
        {
            level: 5,
            name: '峡谷血战',
            totalEnemies: 9,
            waves: [
                { types: ['normal', 'normal', 'heavy'], delay: 0 },
                { types: ['heavy', 'heavy', 'heavy'], delay: 8000 },
                { types: ['elite', 'elite'], delay: 8000 }
            ],
            obstaclesDensity: 0.5
        },
        {
            level: 6,
            name: '防线坚守',
            totalEnemies: 13,
            waves: [
                { types: ['normal', 'normal', 'normal', 'heavy'], delay: 0 },
                { types: ['heavy', 'heavy', 'elite'], delay: 8000 },
                { types: ['heavy', 'heavy', 'elite', 'elite'], delay: 8000 }
            ],
            obstaclesDensity: 0.55
        },
        {
            level: 7,
            name: '山地突袭',
            totalEnemies: 10,
            waves: [
                { types: ['heavy', 'heavy', 'elite', 'elite'], delay: 0 },
                { types: ['heavy', 'heavy', 'elite'], delay: 10000 },
                { types: ['heavy', 'heavy', 'elite'], delay: 8000 }
            ],
            obstaclesDensity: 0.6
        },
        {
            level: 8,
            name: '绝地反击',
            totalEnemies: 8,
            waves: [
                { types: ['elite', 'elite', 'elite'], delay: 0 },
                { types: ['elite', 'elite', 'elite'], delay: 10000 },
                { types: ['elite', 'elite'], delay: 10000 }
            ],
            obstaclesDensity: 0.65
        },
        {
            level: 9,
            name: '最后的防线',
            totalEnemies: 10,
            waves: [
                { types: ['elite', 'elite', 'elite'], delay: 0 },
                { types: ['elite', 'elite', 'elite', 'elite'], delay: 8000 },
                { types: ['elite', 'elite', 'elite'], delay: 8000 }
            ],
            obstaclesDensity: 0.7
        },
        {
            level: 10,
            name: '最终对决',
            totalEnemies: 1,
            waves: [
                { types: ['boss'], delay: 0 }
            ],
            obstaclesDensity: 0.75,
            isBoss: true
        }
    ]
};
