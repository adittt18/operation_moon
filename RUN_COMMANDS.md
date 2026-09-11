# Pixel-Moon Copy-Paste Run Commands

Run these steps in PowerShell.

## Step 1: Open the project folder

Run this first in every terminal:

```powershell
Set-Location "C:\Users\Aditya Sasamal\OneDrive\Desktop\operation_moon2.0\operation_moon"
```

## Step 2: Install Python dependencies

Run once:

```powershell
python -m pip install -r requirements.txt
```

If you use a virtual environment, activate it first:

```powershell
Set-Location "C:\Users\Aditya Sasamal\OneDrive\Desktop\operation_moon2.0\operation_moon"
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Step 3: Install frontend dependencies

Run once:

```powershell
Set-Location "C:\Users\Aditya Sasamal\OneDrive\Desktop\operation_moon2.0\operation_moon\frontend"
npm install
```

## Step 4: Generate sample data

```powershell
Set-Location "C:\Users\Aditya Sasamal\OneDrive\Desktop\operation_moon2.0\operation_moon"
python generate_sample_data.py
```

Expected message:

```text
Sample lunar datasets generated successfully in data/source and data/reference.
```

## Step 5: Run backend API

Open **Terminal 1** and keep it running:

```powershell
Set-Location "C:\Users\Aditya Sasamal\OneDrive\Desktop\operation_moon2.0\operation_moon"
python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

Expected message:

```text
Uvicorn running on http://127.0.0.1:8000
```

## Step 6: Run frontend dashboard

Open **Terminal 2**. Keep Terminal 1 running, then run:

```powershell
Set-Location "C:\Users\Aditya Sasamal\OneDrive\Desktop\operation_moon2.0\operation_moon\frontend"
npm run dev -- --host 127.0.0.1
```

Open the dashboard:

```text
http://127.0.0.1:5173/
```

Open API documentation:

```text
http://127.0.0.1:8000/docs
```

## Step 7: Run backend tests

Open **Terminal 3**:

```powershell
Set-Location "C:\Users\Aditya Sasamal\OneDrive\Desktop\operation_moon2.0\operation_moon"
python -m unittest discover -s tests -p "test*.py"
```

Expected result:

```text
Ran 15 tests
OK
```

## Step 8: Build the frontend

Run in Terminal 3:

```powershell
Set-Location "C:\Users\Aditya Sasamal\OneDrive\Desktop\operation_moon2.0\operation_moon\frontend"
npm run build
```

## Step 9: Check the API

Run in Terminal 3:

```powershell
$health = Invoke-RestMethod "http://127.0.0.1:8000/health"
$pairs = Invoke-RestMethod "http://127.0.0.1:8000/sample-pairs"
Write-Output ("health=" + $health.status + "; sample_pairs=" + $pairs.samples.Count)
```

Expected result:

```text
health=ok; sample_pairs=3
```

## Step 10: Test a sample registration

```powershell
$result = Invoke-RestMethod "http://127.0.0.1:8000/register-sample" -Method Post -Body @{sample_id="tmc2"}
Write-Output ("registration=" + $result.status + "; sensor=" + $result.sensor + "; rmse=" + $result.metrics.rmse)
```

Expected result:

```text
registration=success; sensor=TMC-2; rmse=0.7...
```

Available sample IDs:

```text
tmc2
ohrc
iirs
```

## Step 11: Stop the project

In Terminal 1 and Terminal 2, press:

```text
Ctrl+C
```

## Important

Do not run this incorrect command:

```text
python -m python -m pip install -r requirements.txt
```

Use this instead:

```powershell
python -m pip install -r requirements.txt
```

If port 8000 is already in use, check whether the API is already running:

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/health"
```

If it returns `status: ok`, use the existing backend and do not start another one.
