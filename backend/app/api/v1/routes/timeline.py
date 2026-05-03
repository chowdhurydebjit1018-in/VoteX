from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_timeline():
    return {"message": "Timeline endpoint"}
