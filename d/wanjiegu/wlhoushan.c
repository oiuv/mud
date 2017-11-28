// Room: /d/wanjiegu/wlhoushan.c

inherit ROOM;

void create()
{
        set("short", "后山");
        set("long", @LONG
这里是无量山的后山，你四处看了看，还是无法找到上山的路
径。眼前有一片湖泊，看上去幽静安然。远远的看过去，对面山壁
十分光滑，宛若一面镜子。
LONG
        );
        set("outdoors", "wanjiegu");
        set("exits", ([ /* sizeof() == 2 */
                "northeast" : __DIR__"wlroad2",
        ]));

        setup();
        replace_program(ROOM);
}
