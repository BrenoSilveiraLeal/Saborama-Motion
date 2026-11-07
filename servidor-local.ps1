# Servidor local simples para ver o site em http://localhost:5173 (sem instalar nada).
# Imagens usam cache com validacao: o navegador so baixa de novo quando o arquivo muda.
$raiz = $PSScriptRoot
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add('http://localhost:5173/')
$l.Start()
Write-Host "Saborama Motion em http://localhost:5173"
$tipos = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.json'='application/json' }
$inv = [Globalization.CultureInfo]::InvariantCulture
while ($l.IsListening) {
  $c = $l.GetContext()
  try {
    $rel = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath).TrimStart('/')
    if (-not $rel) { $rel = 'index.html' }
    $f = [IO.Path]::GetFullPath((Join-Path $raiz $rel))
    if ($f.StartsWith($raiz) -and (Test-Path -LiteralPath $f -PathType Leaf)) {
      $ext = [IO.Path]::GetExtension($f).ToLower()
      $c.Response.ContentType = if ($tipos[$ext]) { $tipos[$ext] } else { 'application/octet-stream' }
      if ($ext -in '.png', '.jpg', '.jpeg', '.webp') {
        $data = [IO.File]::GetLastWriteTimeUtc($f).ToString('r', $inv)
        $c.Response.AddHeader('Cache-Control', 'no-cache')
        $c.Response.AddHeader('Last-Modified', $data)
        if ($c.Request.Headers['If-Modified-Since'] -eq $data) { $c.Response.StatusCode = 304; $c.Response.Close(); continue }
      } else { $c.Response.AddHeader('Cache-Control', 'no-store') }
      $b = [IO.File]::ReadAllBytes($f)
      $c.Response.OutputStream.Write($b, 0, $b.Length)
    } else { $c.Response.StatusCode = 404 }
  } catch { $c.Response.StatusCode = 500 }
  $c.Response.Close()
}
