# Backup Guide

## How Backup Works
Backup is deployed on a separate system, which utilized RSnapshot. Follow these steps to set up a new backup system:

1. Download RSnapshot
```
# sudo apt-get install -y rsnapshot
```

2. Copy the config file (rsnaposhot.conf) to /etc/rsnapshot.conf on the backup machine (need root).
Use `rsnapshot configtest` to check the syntax of the config file.
Change the URL of production machine, backup location on line 232.
Backup is symmetrically encrypted with AES. Passcode is located on line 232.
Change backup frequency on line 99 to 101.

3. Setup Backup with `crontab -e`
```
00 01 * * *     /usr/bin/rsnapshot daily > /tmp/rsnapshot.out 2>&1 && cat /tmp/rsnapshot.out | mail -s "Daily Backups Completed" admin@example.com || cat /tmp/rsnapshot.out | mail -s "Daily Backups Failed" admin@example.com
00 23 * * 1     /usr/bin/rsnapshot weekly > /tmp/rsnapshot.out 2>&1 && cat /tmp/rsnapshot.out | mail -s "Daily Backups Completed" admin@example.com || cat /tmp/rsnapshot.out | mail -s "Daily Backups Failed" admin@example.com
00 00 1 * *     /usr/bin/rsnapshot monthly > /tmp/rsnapshot.out 2>&1 && cat /tmp/rsnapshot.out | mail -s "Daily Backups Completed" admin@example.com || cat /tmp/rsnapshot.out | mail -s "Daily Backups Failed" admin@example.com
```

Note:
Local email utility needs to be configured for email notification to work. Using SSMTP or POSTFIX is recommended for sending emails.

## How to restore from the backup

Go to /backup/mongo/ dir on the backup server. Locate the desired backup (daily/weekly/monthly) directory. The actual file is located in ./daily.0/rapid-320/backup/mongo/mongo.tar.gz.aes.

Follow these steps to perform a restore:

1. Copy the encrypted archive file to the production server. 

2. Type the following in the SSH terminal of the production server.
```
# openssl enc -aes-256-cbc -d -k 1234567890 -in mongo.tar.gz.aes | gunzip > db.archive
# mongorestore --archive=db.archive
```
