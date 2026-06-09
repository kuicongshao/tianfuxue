from fastapi import APIRouter, UploadFile

router = APIRouter()


@router.post("/documents")
async def upload_document(file: UploadFile) -> dict[str, str | int | None]:
    return {"filename": file.filename, "size": file.size, "status": "queued_for_parsing"}


@router.get("/sources")
def sources() -> dict:
    return {"supported": ["pdf", "docx", "txt", "md", "html", "web_article", "wechat_article", "gazetteer", "ancient_book", "paper"]}
