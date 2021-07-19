# If the editor and core files are missing, we download them from GitHub.
if [ ! -d "h5p/editor" ] || [ ! -d "h5p/core" ]
then    
    sh scripts/download-core.sh affaa83b51828be13e175c8ba1a7085ba9692d1d 7bc192798f8f6e1dee34891b56f3bf60ab320f3d
else
    echo "Not downloading H5P Core and Editor files as they are already present!"
fi