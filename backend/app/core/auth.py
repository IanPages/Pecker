import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Decodifica y valida el token JWT del usuario utilizando la API de Auth de Supabase.
    """
    token = credentials.credentials
    try:
        user_response = supabase.auth.get_user(token)
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Error al validar usuario: {str(e)}"
        )

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
