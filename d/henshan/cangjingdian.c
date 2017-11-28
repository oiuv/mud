inherit ROOM;
void create()
{
        set("short", "藏经殿");
        set("long", @LONG
藏经殿深掩祥光峰下，因为藏明太祖所赠「大藏经」故名。
只见这里古木参天，殿宇飘翼，奇花异草，林壑幽深，景色秀
丽，「藏经殿之秀」是衡山大四绝之一。
LONG);
        set("exits", ([
               "east"   : __DIR__"shanlu14",
               "south"  : __DIR__"shuzhuangtai",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

