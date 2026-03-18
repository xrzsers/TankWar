// ==================== 工具函数 ====================

/**
 * 生成随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 生成随机整数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机整数
 */
function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

/**
 * 计算两点之间的距离
 * @param {number} x1 - 第一个点的X坐标
 * @param {number} y1 - 第一个点的Y坐标
 * @param {number} x2 - 第二个点的X坐标
 * @param {number} y2 - 第二个点的Y坐标
 * @returns {number} 距离
 */
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算两点之间的角度（弧度）
 * @param {number} x1 - 起点X
 * @param {number} y1 - 起点Y
 * @param {number} x2 - 终点X
 * @param {number} y2 - 终点Y
 * @returns {number} 角度（弧度）
 */
function getAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * 将弧度转换为角度
 * @param {number} radians - 弧度
 * @returns {number} 角度
 */
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

/**
 * 将角度转换为弧度
 * @param {number} degrees - 角度
 * @returns {number} 弧度
 */
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * 检查两个矩形是否碰撞
 * @param {number} x1, y1, w1, h1 - 矩形1
 * @param {number} x2, y2, w2, h2 - 矩形2
 * @returns {boolean} 是否碰撞
 */
function checkRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

/**
 * 检查两个圆是否碰撞
 * @param {number} x1, y1, r1 - 圆1
 * @param {number} x2, y2, r2 - 圆2
 * @returns {boolean} 是否碰撞
 */
function checkCircleCollision(x1, y1, r1, x2, y2, r2) {
    const d = distance(x1, y1, x2, y2);
    return d < r1 + r2;
}

/**
 * 限制数值范围
 * @param {number} value - 值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的值
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * 角度规范化到0-360
 * @param {number} angle - 角度
 * @returns {number} 规范化后的角度
 */
function normalizeAngle(angle) {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
}

/**
 * 计算角度差
 * @param {number} angle1 - 角度1
 * @param {number} angle2 - 角度2
 * @returns {number} 角度差（±180以内）
 */
function angleDifference(angle1, angle2) {
    let diff = normalizeAngle(angle2 - angle1);
    if (diff > 180) diff -= 360;
    return diff;
}

/**
 * 绘制坦克（身体和炮管一体化）
 * @param {CanvasRenderingContext2D} ctx - 绘制上下文
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {number} bodyAngle - 身体和炮管朝向（度）
 * @param {string} color - 颜色
 * @param {number} size - 大小
 */
function drawTank(ctx, x, y, bodyAngle, color, size = 30) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(degreesToRadians(bodyAngle));

    // 坦克底盘（底部，暗一些）
    ctx.fillStyle = color === '#00FFFF' ? '#004444' : color === '#00FF00' ? '#004400' : color === '#FFFF00' ? '#444400' : '#444444';
    ctx.fillRect(-size / 2 - 2, -size / 2 - 2, size + 4, size + 4);

    // 坦克身体主体
    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    
    // 身体上的装甲纹理（竖条刻线）
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size / 4, -size / 2);
    ctx.lineTo(-size / 4, size / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size / 4, -size / 2);
    ctx.lineTo(size / 4, size / 2);
    ctx.stroke();
    
    // 坦克身体高光（左上角）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size / 2 + 2, -size / 2 + 2);
    ctx.lineTo(size / 2 - 2, -size / 2 + 2);
    ctx.lineTo(size / 2 - 2, -size / 4);
    ctx.stroke();
    
    // 坦克边框
    ctx.strokeStyle = color === '#00FFFF' ? '#00AAAA' : '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(-size / 2, -size / 2, size, size);

    // 炮塔圆盘
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 炮塔边框
    ctx.strokeStyle = color === '#00FFFF' ? '#00AAAA' : '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2.5, 0, Math.PI * 2);
    ctx.stroke();

    // 炮管（粗壮的柱体）
    ctx.fillStyle = color;
    ctx.fillRect(size / 6, -size / 6, size / 2, size / 3);
    
    // 炮管高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(size / 6 + 1, -size / 6 + 1, size / 2 - 2, size / 12);
    
    // 炮口
    ctx.fillStyle = color === '#00FFFF' ? '#003333' : color === '#00FF00' ? '#003300' : color === '#FFFF00' ? '#333300' : '#333333';
    ctx.beginPath();
    ctx.arc(size / 2 + 5, 0, size / 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 炮口内部
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(size / 2 + 5, 0, size / 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * 绘制基地
 * @param {CanvasRenderingContext2D} ctx - 绘制上下文
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {number} size - 大小
 * @param {string} color - 颜色
 * @param {boolean} damaged - 是否受伤（闪烁效果）
 */
function drawBase(ctx, x, y, size, color = '#FFD700', damaged = false) {
    ctx.save();
    
    // 受损时闪烁效果
    if (damaged && Math.floor(Date.now() / 100) % 2) {
        ctx.globalAlpha = 0.6;
    }

    // 外层防护光晕
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 基地设计：3x3方格布局
    const gridSize = size / 3;
    
    // 绘制9个方格
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const gx = x - size / 2 + col * gridSize;
            const gy = y - size / 2 + row * gridSize;
            
            // 外层方格（金色）
            ctx.fillStyle = color;
            ctx.fillRect(gx, gy, gridSize, gridSize);
            
            // 内层装饰（更亮的金色）
            ctx.fillStyle = '#FFFF99';
            ctx.fillRect(gx + 2, gy + 2, gridSize - 4, gridSize - 4);
            
            // 方格边框
            ctx.strokeStyle = '#FF8800';
            ctx.lineWidth = 2;
            ctx.strokeRect(gx, gy, gridSize, gridSize);
        }
    }

    // 中心核心（闪闪发光的钻石）
    ctx.fillStyle = '#FFFF99';
    ctx.beginPath();
    ctx.moveTo(x, y - size / 6);           // 上
    ctx.lineTo(x + size / 6, y);           // 右
    ctx.lineTo(x, y + size / 6);           // 下
    ctx.lineTo(x - size / 6, y);           // 左
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#FF8800';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 防护盾牌圆
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size / 2 + 20, 0, Math.PI * 2);
    ctx.stroke();
    
    // 外层定位圈
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(x, y, size / 2 + 35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 1;
    ctx.restore();
}

/**
 * 绘制子弹
 * @param {CanvasRenderingContext2D} ctx - 绘制上下文
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {number} angle - 角度
 * @param {string} color - 颜色
 * @param {number} size - 大小
 */
function drawBullet(ctx, x, y, angle, color = '#0099FF', size = 8) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(degreesToRadians(angle));

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // 轨迹
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 2, 0);
    ctx.stroke();

    ctx.restore();
}

/**
 * 绘制道具
 * @param {CanvasRenderingContext2D} ctx - 绘制上下文
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {string} type - 道具类型
 * @param {number} size - 大小
 */
function drawPowerup(ctx, x, y, type, size = 20) {
    const colors = {
        shield: '#FFD700',
        multi: '#FF00FF',
        speed: '#FF0000',
        heal: '#00FF00',
        freeze: '#00FFFF'
    };

    const color = colors[type] || '#FFFFFF';

    ctx.save();
    ctx.translate(x, y);

    // 外圆
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.stroke();

    // 内圆
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();

    // 旋转指示
    ctx.globalAlpha = 1;
    ctx.rotate(degreesToRadians(Math.floor(Date.now() / 10) % 360));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();

    ctx.restore();
}

/**
 * 绘制障碍物
 * @param {CanvasRenderingContext2D} ctx - 绘制上下文
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {number} size - 大小
 * @param {string} type - 类型
 */
function drawObstacle(ctx, x, y, size, type = 'wall') {
    if (type === 'wall') {
        // 砖块墙体 - 可破坏的
        // 底色（橙色）
        ctx.fillStyle = '#E67E22';
        ctx.fillRect(x, y, size, size);
        
        // 添加渐变效果（左上角亮，右下角暗）
        const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, size, size);
        
        // 细致的网格纹理（4×4）
        ctx.strokeStyle = '#B85C1F';
        ctx.lineWidth = 1.5;
        
        // 竖线
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x + (size / 4) * i, y);
            ctx.lineTo(x + (size / 4) * i, y + size);
            ctx.stroke();
        }
        
        // 横线
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x, y + (size / 4) * i);
            ctx.lineTo(x + size, y + (size / 4) * i);
            ctx.stroke();
        }
        
        // 内部细线（增加立体感）
        ctx.strokeStyle = '#A0532A';
        ctx.lineWidth = 0.8;
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x + (size / 4) * i + 0.5, y + 1);
            ctx.lineTo(x + (size / 4) * i + 0.5, y + size - 1);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 1, y + (size / 4) * i + 0.5);
            ctx.lineTo(x + size - 1, y + (size / 4) * i + 0.5);
            ctx.stroke();
        }
        
        // 强化的左上角高光（3D凸起效果）
        ctx.strokeStyle = 'rgba(255, 200, 100, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + size - 2);
        ctx.lineTo(x + 2, y + 2);
        ctx.lineTo(x + size - 2, y + 2);
        ctx.stroke();
        
        // 强化的右下角阴影（3D凹陷效果）
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + size - 2, y + 2);
        ctx.lineTo(x + size - 2, y + size - 2);
        ctx.lineTo(x + 2, y + size - 2);
        ctx.stroke();
    } else if (type === 'forest') {
        // 森林（无法破坏）- 优化视觉
        ctx.fillStyle = '#0d5c0d';
        ctx.fillRect(x, y, size, size);
        
        // 树木群落
        for (let i = 0; i < 6; i++) {
            const px = x + randomRange(5, size - 5);
            const py = y + randomRange(5, size - 5);
            
            // 树冠（多层次）
            ctx.fillStyle = '#2d8a3d';
            ctx.beginPath();
            ctx.arc(px, py, size / 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#1a6b23';
            ctx.beginPath();
            ctx.arc(px, py - 3, size / 6, 0, Math.PI * 2);
            ctx.fill();
            
            // 树冠高光
            ctx.fillStyle = 'rgba(150, 255, 150, 0.2)';
            ctx.beginPath();
            ctx.arc(px - size / 12, py - size / 12, size / 10, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 森林边框
        ctx.strokeStyle = '#0a3a0a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);
    } else if (type === 'water') {
        // 水体（无法破坏）- 优化视觉
        ctx.fillStyle = '#0047AB';
        ctx.fillRect(x, y, size, size);
        
        // 水面波纹（多层次）
        ctx.strokeStyle = '#0080FF';
        ctx.lineWidth = 1;
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (size / 4) * i, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 水面高光（上方）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(centerX, y + size / 4, size / 3, size / 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 水流纹理（斜线）
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * size / 3 - size / 4, y);
            ctx.lineTo(x + i * size / 3 + size / 4, y + size);
            ctx.stroke();
        }
        
        // 水体边框
        ctx.strokeStyle = '#003D99';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);
    }
}

// 辅助函数：生成随机范围数
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 格式化数字（千位分隔）
 * @param {number} num - 数字
 * @returns {string} 格式化后的字符串
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
