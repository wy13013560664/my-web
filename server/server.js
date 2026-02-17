const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP最多100次请求
    message: {
        error: '请求过于频繁，请稍后再试'
    }
});
app.use('/api/', limiter);

// 预约数据存储（生产环境请使用数据库）
let reservations = [];

// 生成预约编号
function generateReservationNumber() {
    const timestamp = Date.now().toString().slice(-8);
    return `XD${timestamp}`;
}

// API路由

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 创建预约
app.post('/api/reservations', 
    [
        body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号'),
        body('nickname').isLength({ min: 2, max: 12 }).withMessage('昵称长度应为2-12个字符'),
        body('gender').isIn(['male', 'female']).withMessage('请选择性别'),
        body('age').isIn(['18-22', '23-28', '29-35', '35+']).withMessage('请选择年龄段'),
        body('plan').isIn(['monthly', 'quarterly', 'yearly']).withMessage('请选择套餐')
    ],
    async (req, res) => {
        try {
            // 验证输入
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { phone, nickname, gender, age, plan } = req.body;

            // 检查手机号是否已预约
            const existingReservation = reservations.find(r => r.phone === phone);
            if (existingReservation) {
                return res.status(400).json({
                    success: false,
                    error: '该手机号已预约'
                });
            }

            // 生成预约编号
            const reservationNumber = generateReservationNumber();

            // 创建预约记录
            const reservation = {
                id: reservations.length + 1,
                reservationNumber,
                phone,
                nickname,
                gender,
                age,
                plan,
                status: 'pending', // pending, paid, cancelled
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                metadata: {
                    userAgent: req.headers['user-agent'],
                    ip: req.ip,
                    referrer: req.body.referrer || '',
                    utm_source: req.body.utm_source || '',
                    utm_medium: req.body.utm_medium || '',
                    utm_campaign: req.body.utm_campaign || ''
                }
            };

            // 保存预约
            reservations.push(reservation);

            // 返回成功响应
            res.status(201).json({
                success: true,
                data: {
                    reservationNumber: reservation.reservationNumber,
                    plan: reservation.plan,
                    createdAt: reservation.createdAt
                }
            });

            // 记录日志
            console.log(`[预约成功] ${reservationNumber} - ${phone} - ${plan}`);

        } catch (error) {
            console.error('[预约错误]', error);
            res.status(500).json({
                success: false,
                error: '服务器错误，请稍后重试'
            });
        }
    }
);

// 获取预约信息
app.get('/api/reservations/:reservationNumber', (req, res) => {
    const reservation = reservations.find(
        r => r.reservationNumber === req.params.reservationNumber
    );

    if (!reservation) {
        return res.status(404).json({
            success: false,
            error: '预约不存在'
        });
    }

    res.json({
        success: true,
        data: {
            reservationNumber: reservation.reservationNumber,
            nickname: reservation.nickname,
            plan: reservation.plan,
            status: reservation.status,
            createdAt: reservation.createdAt
        }
    });
});

// 获取统计数据
app.get('/api/stats', (req, res) => {
    const stats = {
        total: reservations.length,
        byPlan: {
            monthly: reservations.filter(r => r.plan === 'monthly').length,
            quarterly: reservations.filter(r => r.plan === 'quarterly').length,
            yearly: reservations.filter(r => r.plan === 'yearly').length
        },
        byAge: {
            '18-22': reservations.filter(r => r.age === '18-22').length,
            '23-28': reservations.filter(r => r.age === '23-28').length,
            '29-35': reservations.filter(r => r.age === '29-35').length,
            '35+': reservations.filter(r => r.age === '35+').length
        },
        byGender: {
            male: reservations.filter(r => r.gender === 'male').length,
            female: reservations.filter(r => r.gender === 'female').length
        },
        recentReservations: reservations.slice(-10).reverse()
    };

    res.json({
        success: true,
        data: stats
    });
});

// 分析事件追踪
app.post('/api/analytics', (req, res) => {
    const { eventName, eventParams, timestamp } = req.body;

    // 记录事件日志
    console.log('[事件追踪]', {
        event: eventName,
        params: eventParams,
        timestamp: timestamp || new Date().toISOString(),
        ip: req.ip
    });

    res.json({
        success: true,
        message: '事件已记录'
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('[服务器错误]', err);
    res.status(500).json({
        success: false,
        error: '服务器内部错误'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '接口不存在'
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 统计接口: http://localhost:${PORT}/api/stats`);
    console.log(`❤️  健康检查: http://localhost:${PORT}/api/health`);
});

module.exports = app;