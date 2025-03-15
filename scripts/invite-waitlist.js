import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import inquirer from 'inquirer'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)

async function inviteUser(email, isDev) {
  const redirectTo = isDev
    ? 'http://localhost:3000/confirm'
    : 'https://chartr.ai/confirm'

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  })

  if (error) {
    console.error(`${email}: Error inviting user -`, error.message)
    return false
  }

  // Check if user is on waitlist and update their status
  const { data: waitlistEntry, error: waitlistError } = await supabase
    .from('waitlist')
    .update({ is_invited: true })
    .eq('email', email)
    .select('id')

  if (waitlistError) {
    console.error(`${email}: Error updating waitlist status -`, waitlistError.message)
  }
  else if (waitlistEntry?.length > 0) {
    console.log(`${email}: Updated waitlist status`)
  }

  console.log(`${email}: Invited successfully`)
  return true
}

async function fetchUsers(batchSize) {
  const { data: users, error } = await supabase
    .from('waitlist')
    .select('email, created_at')
    .eq('is_invited', false)
    .order('created_at', { ascending: true })
    .limit(batchSize)

  if (error) {
    console.error('Error fetching waitlist:', error.message)
    return null
  }

  return users
}

async function inviteBatch(batchSize, isDev) {
  const users = await fetchUsers(batchSize)
  if (!users) return

  console.log('\nUsers to be invited:')
  users.forEach((user, index) => {
    const createdAt = new Date(user.created_at)
    console.log(`${index + 1}. ${user.email} (joined ${createdAt})`)
  })

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Proceed with inviting these ${users.length} users?`,
      default: false,
    },
  ])

  if (!confirm) {
    console.log('Operation cancelled')
    return
  }

  console.log('\nProceeding with invites...')
  for (const user of users) {
    await inviteUser(user.email, isDev)
    // Add small delay between invites
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

async function main() {
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Would you like to invite a single user or process a batch?',
      choices: ['single', 'batch'],
      default: 'batch',
    },
  ])

  const { isDev } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isDev',
      message: 'Use development environment?',
      default: false,
    },
  ])

  if (mode === 'single') {
    const { email } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter the email address to invite:',
        validate: input => input.includes('@') || 'Please enter a valid email',
      },
    ])
    await inviteUser(email, isDev)
  }
  else {
    const { batchSize } = await inquirer.prompt([
      {
        type: 'number',
        name: 'batchSize',
        message: 'How many users would you like to invite?',
        default: 10,
        validate: input => input > 0 || 'Please enter a number greater than 0',
      },
    ])
    await inviteBatch(batchSize, isDev)
  }
}

main().catch(console.error)
