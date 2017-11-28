inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
你走在衡山山路上，四望山峰错落，林壑幽深，溪泉飞瀑，
云雾缭绕，不觉心胸大快。西边上山是赤帝峰。东边远远可以
看到衡山五峰之一的紫盖峰了。
LONG);
        set("exits", ([ 
               "westup"  : __DIR__"chidifeng",
               "east"    : __DIR__"shanlu12",
        ]));

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

