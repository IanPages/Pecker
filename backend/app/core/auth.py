import logging

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase_auth.errors import AuthError

from app.db.supabase import supabase

logger = logging.getLogger(__name__)
security = HTTPBearer()

def fetch_user(token: str):
    """
    La conexión HTTP/2 con Supabase Auth se reutiliza y Supabase la cierra si queda inactiva:
    la primera petición después falla con un error de red, así que se reintenta una vez con conexión nueva.
    """
    try:
        return supabase.auth.get_user(token)
    except httpx.TransportError as e:
        logger.warning("Conexión con Supabase Auth caída (%s), reintentando", type(e).__name__)
        return supabase.auth.get_user(token)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Decodifica y valida el token JWT del usuario utilizando la API de Auth de Supabase.
    """
    token = credentials.credentials
    try:
        user_response = fetch_user(token)
    except AuthError:
        # Supabase respondió: el token es inválido o ha caducado
        user_response = None
    except httpx.TransportError:
        # Supabase no respondió: no es culpa del usuario, no debe parecer un 401
        logger.exception("No se pudo contactar con Supabase Auth")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo validar la sesión, inténtalo de nuevo"
        )

    if not user_response or not user_response.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación inválido o expirado"
        )

    return {
        "id": user_response.user.id,
        "email": user_response.user.email,
        # app_metadata only editable with the service role, users can't promote themselves
        "role": (user_response.user.app_metadata or {}).get("role")
        #TODO: Include the other user info when frontend is ready.
    }

def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    """
    Solo deja pasar a usuarios con app_metadata.role == "admin".
    """
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un administrador puede realizar esta acción"
        )
    return user
