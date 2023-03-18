#define AppName "diffusers-worker"
#define AppVersion "0.0.2"
#define AppPublisher "DaniGatunes"
#define AppURL "https://diffusers.gatunes.com/"
#define AppExeName "gui.exe"

[Setup]
AppId={{1B2913B2-BF7C-4D4E-9A60-15D18516C202}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
DefaultDirName={autopf}\{#AppName}
DisableDirPage=auto
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputBaseFilename={#AppName}-v{#AppVersion}
OutputDir=dist
Compression=lzma
SolidCompression=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "dist\gui\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{autoprograms}\{#AppName}"; Filename: "{app}\{#AppExeName}"
Name: "{autostartup}\{#AppName}"; Filename: "{app}\{#AppExeName}"; Parameters: "-quiet"

[Run]
Filename: "{app}\{#AppExeName}"; Description: "{cm:LaunchProgram,{#AppName}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\models"
