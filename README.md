# task-tracker-v2

Configured API on this web server https://task-tracker-v2.herokuapp.com/
The server will start automatically in 5 - 7 seconds after clicking on this link.

### Set up
 - npm install
 
### Running server
 - npm run dev `For development`
 - npm start `For production`

### Routes
 - Users
     - /api/users
     - /api/users?page=1&limit=10
     - /api/users/{user_id}
     - /api/users/signup
     - /api/users/login
     - /api/users/edit
     - /api/users/delete
 - Tasks
     - /api/tasks
     - /api/tasks?filter=View&sort=asc
     - /api/tasks/create
     - /api/tasks/{task_id}/edit
     - /api/tasks/{task_id}/changeStatus
     - /api/tasks/{task_id}/assignTo
     - /api/tasks/{task_id}/delete

### Пользователь

- Регистрация пользователя

    - Authorization - Bearer Token (JWT)

- Вход для пользователя
- Редактирование данных у пользователя
- Удаление пользователя
- Получение данных пользователя

### Пользователи

- Получение всех пользователей

    - Должна присутствовать пагинация (лимит 10 пользователей на страницу)
    
### Задачи

- Создание задачи

    - При создание задача должна быть присвоена ее создателю

- Редактирование задачи
- Изменить статус задачи

    - Должны быть три возможных статуса: `["View", "In Progress", "Done"]`

- Удаление задачи
- Получение списка задач
    - Отфильтровав по статусу
    - Отсортировав по новым/старым ~~пользователям~~ задачам
- Изменить пользователя на которого назначена задача

    Один пользователь имеет возможность назначить задачу другому пользователю
## Технические требования:
Используется база данных ~~MySQL/PostgreSQL~~ MongoDB
