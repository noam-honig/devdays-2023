import { FormEvent, useEffect, useState } from 'react'
import { Task } from '../shared/Task'
import { remult } from 'remult'
import { TasksController } from '../shared/TasksController'

const taskRepo = remult.repo(Task)

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')

  useEffect(() => {
    return taskRepo
      .liveQuery({
        orderBy: {
          createdAt: 'asc',
        },
        where: {
          completed: undefined,
        },
      })
      .subscribe((info) => setTasks(info.applyChanges))
  }, [])

  async function addTask(e: FormEvent) {
    e.preventDefault()
    try {
      const newTask = await taskRepo.insert({
        title: newTaskTitle,
      })
      setTasks([...tasks, newTask])
      setNewTaskTitle('')
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function setAllCompleted(completed: boolean) {
    TasksController.setAllCompleted(completed)
  }

  return (
    <main>
      {taskRepo.metadata.apiInsertAllowed() && (
        <form onSubmit={addTask}>
          <input
            value={newTaskTitle}
            placeholder="What needs to be done?"
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button>Add</button>
        </form>
      )}
      {tasks.map((task) => {
        function setTask(value: Task) {
          setTasks((tasks) => tasks.map((t) => (t === task ? value : t)))
        }

        async function setCompleted(completed: boolean) {
          setTask(await taskRepo.save({ ...task, completed }))
        }
        function setTitle(title: string) {
          setTask({ ...task, title })
        }
        async function deleteTask() {
          try {
            await taskRepo.delete(task)
            setTasks(tasks.filter((t) => t !== task))
          } catch (error: any) {
            alert(error.message)
          }
        }

        return (
          <div key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            <input
              value={task.title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button onClick={deleteTask}>x</button>
          </div>
        )
      })}
      <footer>
        <button onClick={() => setAllCompleted(true)}>Set all completed</button>
        <button onClick={() => setAllCompleted(false)}>
          Set all uncompleted
        </button>
      </footer>
    </main>
  )
}
