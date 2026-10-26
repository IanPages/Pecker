import pytest
from pydantic import ValidationError
from app.schemas.goalsSchema import GoalCreate,GoalUpdate

def test_valid_goal_creation():
    goal = GoalCreate(name="Read",target_minutes=600,start_date="2026-01-01")
    assert goal.deadline is None


def test_no_deadline():
    goal = GoalCreate(name="read",target_minutes=200,start_date="2026-01-01")

def test_target_minutes_cero_fails():
    with pytest.raises(ValidationError):
        GoalCreate(name="Read",target_minutes=0,start_date="2026-01-01")

def test_empty_name():
    with pytest.raises(ValidationError):
        GoalCreate(name="",target_minutes=200,start_date="2026-01-01")

def test_long_name():
    with pytest.raises(ValidationError):
        GoalCreate(name="a" * 121,
                   target_minutes=220,start_date="2026-01-01")
        
def test_exact_name_limit():
    goal = GoalCreate(name="a" * 120, target_minutes=200,start_date="2026-01-01")
        
def test_negative_target_mins():
    with pytest.raises(ValidationError):
        GoalCreate(name="Read",target_minutes=-2,start_date="2026-01-01")
    
def test_deadline_prev_start_date():
    with pytest.raises(ValidationError):
        GoalCreate(name="Read",target_minutes=200,start_date="2026-01-01",deadline="2025-12-12")

def test_deadline_same_start_date():
    with pytest.raises(ValidationError):
        GoalCreate(name="read", target_minutes=200, start_date="2026-01-01",deadline="2026-01-01")

def test_empty_goal_update():
    goal = GoalUpdate()

def test_diff_status():
    with pytest.raises(ValidationError):
        GoalUpdate(status="stopped")