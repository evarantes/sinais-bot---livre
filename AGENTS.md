# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a **Telegram trading bot** that integrates with the IQ Option platform. It uses `python-telegram-bot` v20.0 for Telegram interaction and `iqoptionapi` for IQ Option trading, plus `ta`/`numpy`/`pandas` for technical analysis.

### Development environment

- **Python 3.12** with a virtual environment at `venv/`.
- Activate the venv before running anything: `source venv/bin/activate`
- Install deps: `pip install -r requirements.txt`

### Running

- Entry point: `python main.py` (via `Procfile`).
- **Note:** `main.py` is currently a stub — it calls `asyncio.run(main())` but the `main()` function is not defined, so it will raise `NameError`. This is the existing state of the repository.

### Linting

- `pylint` is available as a transitive dependency (from `iqoptionapi`). Run: `python -m pylint main.py`
- No other linting/formatting tools are configured in this repo.

### Testing

- There are no automated tests in this repository.

### Key gotchas

- The `iqoptionapi` package is installed from a GitHub repo (`Lu-Yi-Hsun/iqoptionapi`), not PyPI. Network connectivity is required during dependency installation.
- `python3.12-venv` system package must be installed for `python3 -m venv` to work (pre-installed in the snapshot).
