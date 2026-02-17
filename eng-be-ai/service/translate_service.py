"""Translation service (English to Vietnamese) using deep-translator (Google Translate)."""

from deep_translator import GoogleTranslator


def translate_to_vietnamese(text: str, src: str = "en", dest: str = "vi") -> str:
    """
    Translate text from source language to Vietnamese.
    Preserves newlines/paragraph breaks by translating each line separately.

    Args:
        text: Text to translate.
        src: Source language code (default: 'en' for English).
        dest: Destination language code (default: 'vi' for Vietnamese).

    Returns:
        Translated text.
    """
    if not text or not text.strip():
        return ""

    translator = GoogleTranslator(source=src, target=dest)
    lines = text.split("\n")
    translated_lines = []
    for line in lines:
        if line.strip():
            result = translator.translate(line.strip())
            translated_lines.append(result or line)
        else:
            translated_lines.append("")  # preserve empty lines (paragraph breaks)
    return "\n".join(translated_lines)
