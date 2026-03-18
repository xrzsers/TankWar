// ==================== 游戏状态管理 ====================

class GameState {
    /**
     * 创建游戏状态管理器
     */
    constructor() {
        this.state = GAME_STATE.MENU;
        this.mode = GAME_MODE.SINGLE;
        this.difficulty = DIFFICULTY.NORMAL;
        this.currentLevel = 1;
        this.score = 0;
        this.killCount = 0;
        this.baseHealth = 100;
        this.maxBaseHealth = 100;

        // 游戏统计
        this.stats = {
            totalEnemiesKilled: 0,
            totalBulletsShot: 0,
            totalBulletHit: 0,
            startTime: 0,
            pausedTime: 0,
            lastPauseTime: 0
        };

        // 关卡数据
        this.levelData = null;
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;

        // 道具状态
        this.activePowerups = [];
        this.frozenStartTime = 0;
        this.isFrozen = false;
    }

    /**
     * 初始化新游戏
     * @param {string} mode - 游戏模式
     * @param {string} difficulty - 难度
     */
    initNewGame(mode = GAME_MODE.SINGLE, difficulty = DIFFICULTY.NORMAL) {
        this.mode = mode;
        this.difficulty = difficulty;
        this.currentLevel = 1;
        this.score = 0;
        this.killCount = 0;
        this.stats.totalEnemiesKilled = 0;
        this.stats.totalBulletsShot = 0;
        this.stats.totalBulletHit = 0;
        this.stats.startTime = Date.now();

        this.applyDifficultyMultiplier();
        this.setState(GAME_STATE.PLAYING);
        this.loadLevel(1);
    }

    /**
     * 应用难度倍数
     */
    applyDifficultyMultiplier() {
        const multiplier = CONFIG.DIFFICULTY_MULTIPLIERS[this.difficulty];
        this.maxBaseHealth = multiplier.baseHealth;
        this.baseHealth = this.maxBaseHealth;
    }

    /**
     * 加载关卡
     * @param {number} levelNum - 关卡号（1-10）
     */
    loadLevel(levelNum) {
        if (levelNum < 1 || levelNum > CONFIG.LEVELS.length) {
            this.setState(GAME_STATE.GAME_OVER);
            return;
        }

        this.currentLevel = levelNum;
        this.levelData = CONFIG.LEVELS[levelNum - 1];
        this.enemiesSpawned = 0;
        this.enemiesRemaining = this.levelData.totalEnemies;
        this.killCount = 0;
        this.activePowerups = [];
        this.isFrozen = false;

        console.log(`加载关卡 ${levelNum}: ${this.levelData.name}`);
    }

    /**
     * 设置游戏状态
     * @param {string} newState - 新状态
     */
    setState(newState) {
        if (newState === GAME_STATE.PAUSED && this.state === GAME_STATE.PLAYING) {
            this.stats.lastPauseTime = Date.now();
        } else if (newState === GAME_STATE.PLAYING && this.state === GAME_STATE.PAUSED) {
            this.stats.pausedTime += Date.now() - this.stats.lastPauseTime;
        }
        this.state = newState;
    }

    /**
     * 获取当前状态
     * @returns {string} 当前状态
     */
    getState() {
        return this.state;
    }

    /**
     * 添加分数
     * @param {number} amount - 分数
     */
    addScore(amount) {
        this.score += amount;
    }

    /**
     * 增加击杀数
     */
    incrementKills() {
        this.killCount++;
        this.stats.totalEnemiesKilled++;
    }

    /**
     * 减少基地血量
     * @param {number} damage - 伤害
     */
    damageBase(damage) {
        this.baseHealth = Math.max(0, this.baseHealth - damage);
        if (this.baseHealth === 0) {
            this.setState(GAME_STATE.GAME_OVER);
        }
    }

    /**
     * 治疗基地
     * @param {number} amount - 治疗量
     */
    healBase(amount) {
        this.baseHealth = Math.min(this.maxBaseHealth, this.baseHealth + amount);
    }

    /**
     * 激活道具
     * @param {string} type - 道具类型
     * @param {Tank} tank - 应用到的坦克
     */
    activatePowerup(type, tank) {
        if (type === POWERUP_TYPE.HEAL) {
            // 治疗直接生效
            this.healBase(CONFIG.POWERUPS.heal.HEAL_AMOUNT);
        } else if (type === POWERUP_TYPE.FREEZE) {
            // 冰冻全局生效
            this.isFrozen = true;
            this.frozenStartTime = Date.now();
            setTimeout(() => {
                this.isFrozen = false;
            }, CONFIG.POWERUPS.freeze.DURATION);
        } else {
            // 其他道具应用到坦克
            const activePowerup = new ActivePowerup(type, tank);
            this.activePowerups.push(activePowerup);
        }
    }

    /**
     * 更新激活的道具
     */
    updatePowerups() {
        this.activePowerups = this.activePowerups.filter(p => p.isActive);
        for (const p of this.activePowerups) {
            p.update();
        }
    }

    /**
     * 获取玩家的所有活跃道具
     * @returns {Array} 道具数组
     */
    getActivePowerups() {
        return this.activePowerups;
    }

    /**
     * 完成关卡
     */
    levelComplete() {
        this.setState(GAME_STATE.LEVEL_COMPLETE);
        
        // 计算关卡得分
        const levelBonus = 100 * this.currentLevel;
        const healthBonus = this.baseHealth * 2;
        const speedBonus = this.getPlayTimeBonus();
        
        const totalBonus = levelBonus + healthBonus + speedBonus;
        this.addScore(totalBonus);

        console.log(`关卡 ${this.currentLevel} 完成！基地HP: ${this.baseHealth}/${this.maxBaseHealth}`);
    }

    /**
     * 获取游玩时间奖励
     * @returns {number} 奖励分数
     */
    getPlayTimeBonus() {
        const levelStartTime = this.stats.startTime;
        const playedTime = (Date.now() - levelStartTime - this.stats.pausedTime) / 1000; // 秒
        const timeLimit = 120; // 120秒内完成加分
        return playedTime < timeLimit ? Math.max(0, (timeLimit - playedTime) * 2) : 0;
    }

    /**
     * 下一关
     */
    nextLevel() {
        if (this.currentLevel < 10) {
            this.loadLevel(this.currentLevel + 1);
            this.setState(GAME_STATE.PLAYING);
        } else {
            // 游戏通关
            this.setState(GAME_STATE.GAME_OVER);
        }
    }

    /**
     * 重新开始
     */
    restart() {
        this.initNewGame(this.mode, this.difficulty);
    }

    /**
     * 获取游戏信息
     * @returns {Object} 游戏信息
     */
    getInfo() {
        return {
            state: this.state,
            mode: this.mode,
            difficulty: this.difficulty,
            level: this.currentLevel,
            score: this.score,
            kills: this.killCount,
            baseHealth: this.baseHealth,
            maxBaseHealth: this.maxBaseHealth,
            enemiesRemaining: this.enemiesRemaining,
            totalEnemies: this.levelData?.totalEnemies || 0,
            isFrozen: this.isFrozen,
            powerups: this.activePowerups
        };
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计
     */
    getStats() {
        return {
            totalEnemiesKilled: this.stats.totalEnemiesKilled,
            totalBulletsShot: this.stats.totalBulletsShot,
            totalBulletHit: this.stats.totalBulletHit,
            accuracy: this.stats.totalBulletsShot > 0 ? 
                (this.stats.totalBulletHit / this.stats.totalBulletsShot * 100).toFixed(2) : 0,
            playedTime: (Date.now() - this.stats.startTime - this.stats.pausedTime) / 1000
        };
    }
}
