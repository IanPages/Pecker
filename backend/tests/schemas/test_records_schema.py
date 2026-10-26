import pytest
from pydantic import ValidationError
from app.schemas.recordsSchema import RecordCreate,RecordUpdate

def test_same_hour():
    with pytest.raises(ValidationError):
        RecordCreate(name="Trabajo",date="2026-01-01",start_hour="2026-01-01T10:00:00",finish_hour="2026-01-01T10:00:00")

def test_prev_finish_to_start_hour():
    with pytest.raises(ValidationError):
        RecordCreate(name="Trabajo",date="2026-01-01",start_hour="2026-01-01T10:00:00",finish_hour="2026-01-01T09:00:00")

def test_update_name():
    record = RecordUpdate(name="New record name")

