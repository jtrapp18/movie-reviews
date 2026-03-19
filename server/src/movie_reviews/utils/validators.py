import re
from datetime import date, datetime
from typing import List, Optional


def validate_required_string(
    value: str,
    field_name: str,
    min_length: int = 1,
    max_length: Optional[int] = None,
    to_lower: bool = False,
    strip: bool = True,
) -> str:
    if value is None or not isinstance(value, str):
        raise ValueError(f"{field_name} is required.")
    result = value.strip() if strip else value
    if len(result) < (min_length or 0):
        raise ValueError(f"{field_name} must be at least {min_length} characters long.")
    if max_length is not None and len(result) > max_length:
        raise ValueError(f"{field_name} must be {max_length} characters or fewer.")
    return result.lower() if to_lower else result


def validate_optional_string(
    value: Optional[str],
    field_name: str,
    min_length: int = 1,
    max_length: Optional[int] = None,
    strip: bool = True,
) -> Optional[str]:
    """Allow None or empty; if provided, validate length and return stripped string."""
    if value is None or (isinstance(value, str) and not value.strip()):
        return None
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string or empty.")
    result = value.strip() if strip else value
    if len(result) < min_length:
        raise ValueError(
            f"{field_name} must be at least {min_length} characters long, or empty."
        )
    if max_length is not None and len(result) > max_length:
        raise ValueError(f"{field_name} must be {max_length} characters or fewer.")
    return result


def validate_required_url(
    value: str, empty_error_message: str, invalid_error_message: str
) -> str:
    if not value or not isinstance(value, str) or not value.strip():
        raise ValueError(empty_error_message)
    trimmed_value = value.strip()
    if not (
        trimmed_value.startswith("http://") or trimmed_value.startswith("https://")
    ):
        raise ValueError(invalid_error_message)
    return trimmed_value


def validate_date_or_yyyy_mm_dd(value, field_name: str):
    if isinstance(value, (datetime, date)):
        return value
    if isinstance(value, str):
        try:
            datetime.strptime(value, "%Y-%m-%d")
            return value
        except ValueError as e:
            raise ValueError(
                f"Invalid date format for {field_name}. Must be YYYY-MM-DD."
            ) from e
    raise ValueError(
        f"Invalid date format for {field_name}. Must be a string or date object."
    )


def validate_enum(value: str, allowed: List[str], field_name: str) -> str:
    if value not in allowed:
        allowed_str = ", ".join(allowed)
        raise ValueError(f"{field_name} must be one of: {allowed_str}.")
    return value


def validate_optional_int_in_range(
    value, min_value: int, max_value: int, field_name: str
):
    if value is None:
        return None
    if not isinstance(value, int) or value < min_value or value > max_value:
        raise ValueError(
            f"{field_name} must be an integer between {min_value} and {max_value}, or None."
        )
    return value


def normalize_tag_name(value: str, max_length: int = 50) -> str:
    result = validate_required_string(
        value, "Tag name", min_length=1, max_length=max_length, to_lower=True
    )
    return result


def validate_optional_email(
    value: Optional[str], field_name: str = "Email"
) -> Optional[str]:
    if value is None or value == "":
        return value
    email_regex = r"^[\w\.-]+@[\w\.-]+\.[\w-]+$"
    if not re.match(email_regex, value):
        raise ValueError(f"A valid {field_name.lower()} address is required.")
    return value


def validate_optional_phone(
    value: Optional[str], field_name: str = "Phone number"
) -> Optional[str]:
    if not value:
        return value
    phone_regex = r"^\+?1?\d{9,15}$"
    if not re.match(phone_regex, value):
        raise ValueError(f"{field_name} must be in a valid format.")
    return value


def validate_zipcode(value: Optional[str]) -> Optional[str]:
    """Allow None or empty; if provided, must be 5 or 9 digits."""
    if value is None or (isinstance(value, str) and not value.strip()):
        return None
    if (
        isinstance(value, str)
        and value.strip().isdigit()
        and len(value.strip()) in [5, 9]
    ):
        return value.strip()
    raise ValueError("Invalid zipcode format")
