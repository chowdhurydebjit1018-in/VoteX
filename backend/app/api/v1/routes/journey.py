from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_journey():
    return {"message": "Journey endpoint"}
