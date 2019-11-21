config=$1

# print usage is not called with a config
if [ -z "$config" ]
then
    echo "Usage: release-archive.sh config-file-path.json"
    exit 1
fi

# strip ".json" from config file to get a build name
name=`basename $config .json`
echo "Build config \"$name\" ($config)"

# build frontend code
npm run clean
BUILD_CONFIG=$config NODE_ENV=production npm run build:webpack

# make release zip
zip=assets/release/$name.zip
mkdir -p assets/release
rm -rf $zip
zip -r $zip . -x node_modules/\* .git/\* .github/\* .gitignore .DS_Store vendor/\* assets/\* src/blocks\*
