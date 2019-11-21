for config in config/*.json
do
    echo $config
    bash bin/release-archive.sh "$config"
done
