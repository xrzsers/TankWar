// ==================== 道具类 ====================

class Powerup {
    /**
     * 创建一个道具
     * @param {number} x - X位置
     * @param {number} y - Y位置
     * @param {string} type - 道具类型
     */
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 20;
        this.createdTime = Date.now();
        this.duration = 10000; // 毫秒，道具在地图上停留时间
        this.isActive = true;

        // 缓慢下降效果
        this.vy = 30; // 像素/秒
        this.rotation = 0;
    }

    /**
     * 更新道具
     * @param {number} deltaTime - 时间差（秒）
     */
    update(deltaTime) {
        // 下降
        this.y += this.vy * deltaTime;

        // 旋转
        this.rotation += 360 * deltaTime;
        if (this.rotation >= 360) this.rotation -= 360;

        // 检查是否过期
        if (Date.now() - this.createdTime > this.duration) {
            this.isActive = false;
        }

        // 边界检查
        if (this.y > CONFIG.CANVAS_HEIGHT + 50) {
            this.isActive = false;
        }
    }

    /**
     * 绘制道具
     * @param {CanvasRenderingContext2D} ctx - 绘制上下文
     */
    draw(ctx) {
        if (!this.isActive) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // 根据剩余时间计算透明度（快过期时闪烁）
        const remainTime = this.duration - (Date.now() - this.createdTime);
        if (remainTime < 2000) {
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 100);
        }

        drawPowerup(ctx, 0, 0, this.type, this.size);

        ctx.restore();
    }

    /**
     * 检查与坦克的碰撞
     * @param {number} tankX - 坦克X
     * @param {number} tankY - 坦克Y
     * @param {number} tankSize - 坦克大小
     * @returns {boolean} 是否碰撞
     */
    checkCollision(tankX, tankY, tankSize) {
        const distance = Math.sqrt(
            Math.pow(this.x - tankX, 2) + Math.pow(this.y - tankY, 2)
        );
        return distance < this.size + tankSize / 2;
    }

    /**
     * 获取道具效果信息
     * @returns {Object} 效果信息
     */
    getEffectInfo() {
        const effects = {
            shield: {
                name: '无敌护盾',
                duration: CONFIG.POWERUPS.shield.DURATION,
                description: '免疫所有伤害'
            },
            multi: {
                name: '多发子弹',
                duration: CONFIG.POWERUPS.multi.DURATION,
                description: '发射3发子弹'
            },
            speed: {
                name: '射速加快',
                duration: CONFIG.POWERUPS.speed.DURATION,
                description: '射速提升至2.5倍'
            },
            heal: {
                name: '治疗包',
                duration: 0,
                description: '恢复30点基地HP'
            },
            freeze: {
                name: '冰冻',
                duration: CONFIG.POWERUPS.freeze.DURATION,
                description: '敌坦克减速70%'
            }
        };

        return effects[this.type] || {};
    }

    /**
     * 销毁道具
     */
    destroy() {
        this.isActive = false;
    }
}

/**
 * 激活的道具效果管理器
 */
class ActivePowerup {
    /**
     * 创建一个激活的道具效果
     * @param {string} type - 道具类型
     * @param {Tank} tank - 应用到的坦克
     */
    constructor(type, tank) {
        this.type = type;
        this.tank = tank;
        this.startTime = Date.now();
        this.duration = CONFIG.POWERUPS[type].DURATION;
        this.isActive = true;

        // 应用效果
        this.applyEffect();
    }

    /**
     * 应用道具效果
     */
    applyEffect() {
        switch (this.type) {
            case POWERUP_TYPE.SHIELD:
                this.tank.isShielded = true;
                break;
            case POWERUP_TYPE.MULTI_SHOT:
                this.tank.multiShot = true;
                break;
            case POWERUP_TYPE.SPEED_BOOST:
                this.tank.fireRateMultiplier = CONFIG.POWERUPS.speed.FIRE_RATE_MULTIPLIER;
                break;
            case POWERUP_TYPE.FREEZE:
                // 冰冻会在Game中全局应用
                break;
        }
    }

    /**
     * 更新道具效果
     */
    update() {
        const elapsed = Date.now() - this.startTime;
        if (elapsed >= this.duration) {
            this.isActive = false;
            this.removeEffect();
        }
    }

    /**
     * 移除道具效果
     */
    removeEffect() {
        switch (this.type) {
            case POWERUP_TYPE.SHIELD:
                this.tank.isShielded = false;
                break;
            case POWERUP_TYPE.MULTI_SHOT:
                this.tank.multiShot = false;
                break;
            case POWERUP_TYPE.SPEED_BOOST:
                this.tank.fireRateMultiplier = 1;
                break;
        }
    }

    /**
     * 获取剩余时间（毫秒）
     * @returns {number} 剩余时间
     */
    getRemainingTime() {
        const elapsed = Date.now() - this.startTime;
        return Math.max(0, this.duration - elapsed);
    }

    /**
     * 获取进度百分比
     * @returns {number} 0-100
     */
    getProgress() {
        return (this.getRemainingTime() / this.duration) * 100;
    }
}
