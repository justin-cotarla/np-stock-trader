# np-stock-trader
A JS Neopets Stock Trading Utility

This script provides a CLI interface for interacting with [Neopets](http://neopets.com)' stock exchange.

## Usage
```
node np-stock-trader [options] [command]

Options:
  -u, --username <username>  Neopets username
  -p, --password <password>  Neopets password
  -l, --log-file <file>      log file location
  -e, --auth-env             load crendentials from env
  -h, --help                 display help for command

Commands:
  buy [volume] [price]       execute buy strategy
  sell [min-price]           execute sell strategy
  balance                    display np balance
  portfolio                  display portfolio
  batches                    display portfolio batches
  listings                   display stock listings
  help [command]             display help for command
```

## Configuration
Account credentials can be read from an `.env` file alongside the script:
```
NP_USERNAME=username
NP_PASSWORD=password
```