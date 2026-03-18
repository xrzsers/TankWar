// ==================== 类型定义 ====================
// 这个文件包含游戏中所有的类型定义

/**
 * 游戏难度类型
 */
const DIFFICULTY = {
    EASY: 'easy',      // 简单
    NORMAL: 'normal',  // 普通
    HARD: 'hard',      // 困难
    HELL: 'hell'       // 地狱
};

/**
 * 游戏模式
 */
const GAME_MODE = {
    SINGLE: 'single',  // 单人
    COOP: 'coop'       // 双人合作
};

/**
 * 游戏状态
 */
const GAME_STATE = {
    MENU: 'menu',           // 主菜单
    DIFFICULTY: 'difficulty', // 难度选择
    PLAYING: 'playing',     // 游戏中
    PAUSED: 'paused',       // 暂停
    GAME_OVER: 'gameover',  // 游戏失败
    LEVEL_COMPLETE: 'complete' // 关卡完成
};

/**
 * 坦克类型
 */
const TANK_TYPE = {
    PLAYER: 'player',      // 玩家坦克
    NORMAL: 'normal',      // 普通敌坦克
    HEAVY: 'heavy',        // 重装敌坦克
    ELITE: 'elite',        // 精锐敌坦克
    BOSS: 'boss'           // Boss敌坦克
};

/**
 * 道具类型
 */
const POWERUP_TYPE = {
    SHIELD: 'shield',      // 无敌护盾
    MULTI_SHOT: 'multi',   // 多发子弹
    SPEED_BOOST: 'speed',  // 射速加快
    HEAL: 'heal',          // 治疗包
    FREEZE: 'freeze'       // 冰冻
};
