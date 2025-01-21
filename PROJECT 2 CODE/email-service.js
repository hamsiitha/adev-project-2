const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (email) => {
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
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendWelcomeEmail
}; 