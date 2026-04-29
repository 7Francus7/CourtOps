$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$audioDir = Join-Path $root "audio"
New-Item -ItemType Directory -Force -Path $audioDir | Out-Null

Add-Type -AssemblyName System.Speech

function New-VoiceLine {
  param(
    [string]$Text,
    [string]$Output,
    [int]$Rate = 1,
    [int]$Volume = 100
  )

  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $voice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like "es-*" } | Select-Object -First 1
  if ($voice) {
    $synth.SelectVoice($voice.VoiceInfo.Name)
  }
  $synth.Rate = $Rate
  $synth.Volume = $Volume
  $synth.SetOutputToWaveFile($Output)
  $synth.Speak($Text)
  $synth.Dispose()
}

$lines = @(
  @{ Name = "vo-01.wav"; Text = "Tu club todavía se maneja así?"; Rate = 1 },
  @{ Name = "vo-02.wav"; Text = "Turnos desordenados, clientes que se pierden, y cero control."; Rate = 1 },
  @{ Name = "vo-03.wav"; Text = "Con CourtOps, gestionás todo tu club desde un solo lugar."; Rate = 1 },
  @{ Name = "vo-04.wav"; Text = "Reservas rápidas, control total de clientes, reportes claros, y más tiempo para hacer crecer tu negocio."; Rate = 2 },
  @{ Name = "vo-05.wav"; Text = "Menos errores. Más control. Más ingresos."; Rate = 1 },
  @{ Name = "vo-06.wav"; Text = "Digitalizá tu club hoy con CourtOps."; Rate = 1 }
)

foreach ($line in $lines) {
  New-VoiceLine -Text $line.Text -Output (Join-Path $audioDir $line.Name) -Rate $line.Rate
}

@"
Generated voiceover lines in $audioDir
"@
