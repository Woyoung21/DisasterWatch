# SET UP

## clone repo
```
git clone https://github.com/John-Tsiglieris/SF-hacks-2025-secret-repo.git
```

## change env file
To replace `CHANGE_THIS_PASS` with a new password as a one-liner:
### Linux:
```bash
sed -i 's/CHANGE_THIS_PASS/new_password/' .env
```

### Windows (PowerShell):
```powershell
(Get-Content .env) -replace 'CHANGE_THIS_PASS', 'new_password' | Set-Content .env
``` 

## install npm packages
```
npm install
```

## run dev server
```
npm run dev
```

## editing the database via CLI
see [cli.readme.md](https://github.com/John-Tsiglieris/SF-hacks-2025-secret-repo/blob/main/cli.readme.md)


# TODO
- ~~create static file serve~~
- ~~set up templating:~~ See `views` folder
- update nav
- ~~find a way to stream events (websockets?)~~
