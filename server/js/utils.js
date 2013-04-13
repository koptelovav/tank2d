/**
 * Модуль вспомогательных функций
 */
var Utils = {};

module.exports = Utils;

/**
 *
 * @param {number} range Диапазон для выборки случайного числа
 * @returns {number} Случайное число
 */
Utils.random = function(range) {
    return Math.floor(Math.random() * range);
};
