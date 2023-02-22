# usdz to glb

## Requirements
### 1. Aspose - aspose.3d
> `.usdz` to `.glb`\
> `pip install aspose-3d`로 설치\
> window 및 linux 지원(MacOS 아직 없음), Python 3.5 이상 3.10 이하 버전 사용


### 2. ARkit - usdzconvert
> `.glb` to `.usdz`\
> USDPython 0.66 에서는 `Python3.7.9` 사용\
> MacOS 환경에서 precompiled 되어있음. 

## Usage
1. 루트에 `tmp`, `auth` 폴더 추가
2. 루트에 `usdpython` 다운로드 => [USDPython-pkg v0.66.zip](https://developer.apple.com/augmented-reality/tools/files/USDPython-pkg.zip)
3. env 설정
4. `usdpython` 사용 시 파이썬 버전 확인 (3.7.9)
5. `npm start`