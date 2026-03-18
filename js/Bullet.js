// ==================== 子弹类 ====================

class Bullet {
    /**
     * 创建一个子弹
     * @param {number} x - 发射X位置
     * @param {number} y - 发射Y位置
     * @param {number} angle - 发射角度（度）
     * @param {string} owner - 所有者类型 ('player' 或 'enemy')
     * @param {number} speed - 子弹速度
     * @param {number} size - 子弹大小
     */
    constructor(x, y, angle, owner = 'player', speed = 300, size = 8) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.owner = owner;
        this.speed = speed;
        this.size = size;
        this.createdTime = Date.now();
        this.isActive = true;
        this.color = owner === 'player' ? '#0099FF' : '#FF0000';

        // 计算速度向量
        const rad = degreesToRadians(angle);
        this.vx = Math.cos(rad) * speed;
        this.vy = Math.sin(rad) * speed;
    }

    /**
     * 更新子弹位置
     * @param {number} deltaTime - 时间差（秒）
     */
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // 检查生命时间
        if (Date.now() - this.createdTime > CONFIG.BULLET.LIFETIME) {
            this.isActive = false;
        }

        // 检查是否超出边界
        if (this.x < -50 || this.x > CONFIG.CANVAS_WIDTH + 50 ||
            this.y < -50 || this.y > CONFIG.CANVAS_HEIGHT + 50) {
            this.isActive = false;
        }
    }

    /**
     * 绘制子弹
     * @param {CanvasRenderingContext2D} ctx - 绘制上下文
     */
    draw(ctx) {
        if (!this.isActive) return;
        drawBullet(ctx, this.x, this.y, this.angle, this.color, this.size);
    }

    /**
     * 检查与矩形的碰撞
     * @param {number} x, y, w, h - 矩形
     * @returns {boolean} 是否碰撞
     */
    checkCollisionWithRect(x, y, w, h) {
        return checkRectCollision(
            this.x - this.size / 2, this.y - this.size / 2,
            this.size, this.size,
            x, y, w, h
        );
    }

    /**
     * 获取子弹信息
     * @returns {Object} 子弹信息
     */
    getInfo() {
        return {
            x: this.x,
            y: this.y,
            angle: this.angle,
            owner: this.owner,
            speed: this.speed,
            isActive: this.isActive
        };
    }

    /**
     * 销毁子弹
     */
    destroy() {
        this.isActive = false;
    }
}
