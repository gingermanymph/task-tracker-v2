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

### User
- User registration
    - Authorization - Bearer Token (JWT)
- User login
- User edit profile
- User delete account
- User get info

### Users
- Get all users
    - Pages and pagination (limit 10 users per page)
    
### Tasks
- Task creation
    - A user becomes an owner after task creation
- Task edit
- Task change status
    - Available statuses: `["View", "In Progress", "Done"]`
- Task delete
- Task get list
    - Filter by status
    - Sort by new/old ~~users~~ tasks
- Assign to another user
    - Each user can assign the task to another users
    
### Technocal requirements:
Used database ~~MySQL/PostgreSQL~~ MongoDB
