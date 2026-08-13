Get-ChildItem -Path "src/components/forms" -Recurse -Include "*.tsx" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw

  # Replace gray border/bg/text with green palette
  $content = $content -replace 'border-gray-200','border-[#E8F0EA]'
  $content = $content -replace 'border-gray-300','border-[#E8F0EA]'
  $content = $content -replace 'border-gray-600','border-[#E8F0EA]'
  $content = $content -replace 'border-gray-700','border-[#E8F0EA]'
  $content = $content -replace 'border-gray-800','border-[#E8F0EA]'
  $content = $content -replace 'bg-gray-50','bg-[#F3F7F3]'
  $content = $content -replace 'bg-gray-100','bg-[#F3F7F3]'
  $content = $content -replace 'bg-gray-200','bg-[#E8F0EA]'
  $content = $content -replace 'bg-gray-800','bg-white'
  $content = $content -replace 'bg-gray-900','bg-white'
  $content = $content -replace 'text-gray-400','text-[#718078]'
  $content = $content -replace 'text-gray-500','text-[#718078]'
  $content = $content -replace 'text-gray-600','text-[#718078]'
  $content = $content -replace 'text-gray-700','text-[#26352E]'
  $content = $content -replace 'text-gray-900','text-[#26352E]'
  $content = $content -replace 'text-gray-100','text-white'

  # Remove all dark: variants (they break the palette)
  $content = $content -replace '\s+dark:[^\s"]+',''

  # Replace Tailwind emerald/indigo/blue focus rings with green
  $content = $content -replace 'focus:ring-emerald-\d+','focus:ring-[#315C4A]'
  $content = $content -replace 'focus:ring-indigo-\d+','focus:ring-[#315C4A]'
  $content = $content -replace 'focus:ring-blue-\d+','focus:ring-[#315C4A]'
  $content = $content -replace 'focus:border-emerald-\d+','focus:border-[#315C4A]'
  $content = $content -replace 'focus:border-indigo-\d+','focus:border-[#315C4A]'

  # Replace rounded-lg with rounded-xl
  $content = $content -replace 'rounded-lg','rounded-xl'

  Set-Content $_.FullName $content -NoNewline
}
Write-Host "DONE - all modal gray/dark colors replaced"
