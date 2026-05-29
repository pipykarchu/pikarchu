import { spawn } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const run = (name, args) => {
  const child = spawn(npmCommand, args, {
    stdio: 'inherit',
    shell: false
  })

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`)
    }
  })

  return child
}

const api = run('api', ['run', 'dev:api'])
const web = run('web', ['run', 'dev'])

const shutdown = () => {
  api.kill()
  web.kill()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
