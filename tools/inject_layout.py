"""Replace duplicated header/footer blocks with shared partial includes."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HEADER_RE = re.compile(
    r"(^[ \t]*)<!--== Start Header Area Wrapper ==-->.*?<!--== End Header Area Wrapper ==-->",
    re.MULTILINE | re.DOTALL,
)
FOOTER_RE = re.compile(
    r"(^[ \t]*)<!--== Start Footer Area Wrapper ==-->.*?<!--== End Footer Area Wrapper ==-->",
    re.MULTILINE | re.DOTALL,
)


def prefix_for(path: Path) -> str:
    depth = len(path.relative_to(ROOT).parts) - 1
    return "../" * depth


def header_block(indent: str, prefix: str) -> str:
    src = f"{prefix}assets/js/include-partial.js"
    include = f"{prefix}partials/header.html"
    return (
        f"{indent}<!--== Start Header Area Wrapper ==-->\n"
        f"{indent}<script src=\"{src}\" data-include=\"{include}\"></script>\n"
        f"{indent}<!--== End Header Area Wrapper ==-->"
    )


def footer_block(indent: str, prefix: str) -> str:
    src = f"{prefix}assets/js/include-partial.js"
    include = f"{prefix}partials/footer.html"
    return (
        f"{indent}<!--== Start Footer Area Wrapper ==-->\n"
        f"{indent}<script src=\"{src}\" data-include=\"{include}\"></script>\n"
        f"{indent}<!--== End Footer Area Wrapper ==-->"
    )


def main() -> None:
    html_files = sorted(ROOT.rglob("*.html"))
    html_files = [p for p in html_files if "partials" not in p.parts]

    missing = []
    updated = []

    for path in html_files:
        text = path.read_text(encoding="utf-8")
        prefix = prefix_for(path)

        header_match = HEADER_RE.search(text)
        footer_match = FOOTER_RE.search(text)
        if not header_match or not footer_match:
            missing.append((str(path.relative_to(ROOT)), bool(header_match), bool(footer_match)))
            continue

        text = HEADER_RE.sub(lambda m: header_block(m.group(1), prefix), text, count=1)
        text = FOOTER_RE.sub(lambda m: footer_block(m.group(1), prefix), text, count=1)
        path.write_text(text, encoding="utf-8", newline="\n")
        updated.append(f"{path.relative_to(ROOT)} ({prefix or '.'})")

    print(f"updated {len(updated)} files:")
    for item in updated:
        print(f"  {item}")
    if missing:
        print("missing markers:")
        for item in missing:
            print(f"  {item}")


if __name__ == "__main__":
    main()
