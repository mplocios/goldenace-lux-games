Install MySQL

Install NodeJS

Install nodemon

```
npm install nodemon --save-dev
```

Install Redis

```
sudo apt install redis-server
sudo systemctl enable redis-server
```

Create .env file

```
PORT=8000
DEBUG_MODE=true

NODE_ENV=development

DB_HOST=localhost
DB_NAME=HorseRace
DB_USER=root
DB_PASSWORD=testing
DB_PORT=3306
DB_DIALECT=mysql
DB_TIMEZONE=+08:00
```

Create config/config.json

```
{
  "development": {
    "username": "root",
    "password": "testing",
    "database": "HorseRace",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": "testing",
    "database": "HorseRace",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": testing,
    "database": "HorseRace",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

Replace the variables needed there

Then run

```
npm i
npm run initTestData
npm run dev
```
