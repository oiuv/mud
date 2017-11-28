// Room: /t/wanjiegu/port.c

inherit ROOM;

void create()
{
        set("short", "善人渡");
        set("long", @LONG
这里从前是澜沧江的一个渡口，后来大理国在此修了一座铁索
桥，人们便不用再乘船过江了。桥边石上清清楚楚地刻着三个大字
“善人渡”。
LONG
        );
        set("outdoors", "wanjiegu");
        set("exits", ([ /* sizeof() == 2 */
            "west" : __DIR__"bridge",
            "east" : __DIR__"riverside3",
        ]));

        setup();
        replace_program(ROOM);
}
