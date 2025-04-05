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

## instapp npm packages
```
npm install
```

## run dev server
```
npm run dev
```

# TODO
- ~~create static file serve~~
- set up templating
- find a way to stream events (websockets?)
