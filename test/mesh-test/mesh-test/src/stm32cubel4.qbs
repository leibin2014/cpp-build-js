import qbs 1.0

MeshDriver {
    includes: ["includes"]
    files: ["*.c", "*.h", "includes/*.h"]
    drivers: [
        "cmsis-core-common",
        "target"
    ]
}
