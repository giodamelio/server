const Vantage = require('vantage');
const Table = require('cli-table');
const chalk = require('chalk');

const config = require('./config');
const User = require('./models/user');

const vantage = new Vantage();

vantage.auth('basic', {
  users: [
    {
      user: config.VANTAGE_USERNAME,
      pass: config.VANTAGE_PASSWORD,
    },
  ],
  retry: 3,
  retryTime: 500,
  deny: 1,
  unlockTime: 3000,
});

// List all users
vantage
  .command('user-list')
  .description('List all users')
  .action(function() {
    return User.find({})
      .then((users) => {
        const table = new Table({
          head: [
            'ID',
            'Name',
            'Email',
            'Approved',
            'Role',
          ],
        });

        users.forEach((user) => {
          table.push([
            user.id,
            user.name,
            user.email,
            user.approved ? chalk.green(user.approved) : chalk.red(user.approved),
            user.role === 'admin' ? chalk.red.bold.underline(user.role) : user.role,
          ]);
        });

        this.log(table.toString());
      });
  });

vantage
  .command('user-approve <approve> <id>')
  .description('Approve or Disapprove a user')
  .action(function(args) {
    return User.findOneAndUpdate({ _id: args.id }, { approved: args.approve }, { new: true })
      .then((user) => {
        if (user.approved) {
          this.log(`User "${user.name}" (id: ${user._id}) is ${chalk.green('approved!')}`);
        } else {
          this.log(`User "${user.name}" (id: ${user._id}) is ${chalk.red.bold('disapproved!')}`);
        }
      });
  });

module.exports = vantage;
