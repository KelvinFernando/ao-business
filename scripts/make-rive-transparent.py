from pathlib import Path

path = Path(__file__).resolve().parents[1] / "public" / "prototype.riv"
data = bytearray(path.read_bytes())
style_start = data.index(b"Artboard Style")
style_end = data.index(b"Paper artwork", style_start)
color = data.index(b"\x25\x20\x20\x20\xff", style_start, style_end)
data[color + 4] = 0
path.write_bytes(data)
print(f"Set Rive artboard background alpha to 0 at byte {color + 4}")
