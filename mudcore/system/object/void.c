/**
 * @brief VOID_OB 房间模式示例，出口可为普通房间或区域坐标
 *
 */
inherit CORE_STD_ROOM;

private varargs void create(int x, int y, int z)
{
    set("short", "时空中转站");
    set("long", @LONG
这里是多维宇宙的时空中转站，正常情况下，没有人能来到这里。
LONG);
    set("void", 1); // 特殊环境标记
    set("exits", ([
        "up" : CORE_DIR "world/area/maze/entry",
        "down" : ([
            "filename" : CORE_DIR "world/area/void",
            "x_axis" : 55,
            "y_axis" : 5,
        ]),
    ]));
    setArea("void", x, y, z);
}
