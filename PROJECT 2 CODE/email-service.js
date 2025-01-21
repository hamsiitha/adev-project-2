const nodemailer = require('nodemailer');
require('dotenv').config();

// 创建邮件传输器
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true, // 启用调试模式
    logger: true // 启用日志
});

// 验证邮件配置
transporter.verify(function(error, success) {
    if (error) {
        console.error('邮件服务器配置错误:', error);
    } else {
        console.log('邮件服务器配置成功');
    }
});

const sendWelcomeEmail = async (email) => {
    console.log('准备发送欢迎邮件到:', email);
    console.log('使用邮箱账号:', process.env.EMAIL_USER);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '欢迎订阅自动售货机更新',
        html: `
            <h1>感谢您的订阅！</h1>
            <p>您已成功订阅我们的自动售货机更新服务。</p>
            <p>我们会定期向您发送以下信息：</p>
            <ul>
                <li>新产品上架通知</li>
                <li>特别优惠信息</li>
                <li>售货机维护更新</li>
            </ul>
            <p>如果您有任何问题，请随时回复此邮件。</p>
        `
    };

    try {
        console.log('开始发送邮件...');
        const info = await transporter.sendMail(mailOptions);
        console.log('邮件发送成功:', info);
        return true;
    } catch (error) {
        console.error('邮件发送失败:', error);
        console.error('错误详情:', {
            code: error.code,
            response: error.response,
            responseCode: error.responseCode
        });
        return false;
    }
};

module.exports = {
    sendWelcomeEmail
}; 