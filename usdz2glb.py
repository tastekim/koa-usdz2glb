import sys
import os.path
import aspose.threed as a3d

def usdz2glb(usdzFilePath, glbFileName):
    scene = a3d.Scene.from_file(usdzFilePath)
    scene.save('./tmp/' + glbFileName)
    file_exits = os.path.exists('./tmp/' + glbFileName)
    print(file_exits,end='')
    sys.stdout.flush()


if __name__ == '__main__':
    usdz2glb(sys.argv[1], sys.argv[2])