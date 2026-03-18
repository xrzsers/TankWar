// ==================== 向量类 ====================

class Vector2 {
    /**
     * 创建一个2D向量
     * @param {number} x - X分量
     * @param {number} y - Y分量
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * 向量相加
     * @param {Vector2} other - 另一个向量
     * @returns {Vector2} 新向量
     */
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    /**
     * 向量相减
     * @param {Vector2} other - 另一个向量
     * @returns {Vector2} 新向量
     */
    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    /**
     * 向量数乘
     * @param {number} scalar - 标量
     * @returns {Vector2} 新向量
     */
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    /**
     * 向量除法
     * @param {number} scalar - 标量
     * @returns {Vector2} 新向量
     */
    divide(scalar) {
        if (scalar === 0) return new Vector2(0, 0);
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    /**
     * 计算向量长度
     * @returns {number} 长度
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * 向量归一化
     * @returns {Vector2} 新的单位向量
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2(0, 0);
        return this.divide(mag);
    }

    /**
     * 计算点积
     * @param {Vector2} other - 另一个向量
     * @returns {number} 点积结果
     */
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * 计算距离
     * @param {Vector2} other - 另一个点
     * @returns {number} 距离
     */
    distanceTo(other) {
        return this.subtract(other).magnitude();
    }

    /**
     * 克隆向量
     * @returns {Vector2} 克隆后的向量
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    /**
     * 向量转为对象
     * @returns {Object} {x, y}对象
     */
    toObject() {
        return { x: this.x, y: this.y };
    }

    /**
     * 向量的字符串表示
     * @returns {string} 字符串
     */
    toString() {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
}
