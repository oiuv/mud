inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
你走在衡山山路上，四望山峰错落，林壑幽深，溪泉飞瀑，
云雾缭绕，不觉心胸大快。东北方就是南天门了，高高矗立在
西北方的就是衡山五峰之一的芙蓉峰。
LONG);
        set("exits", ([ 
                "northeast"  : __DIR__"nantian",
                "southeast"  : __DIR__"shanlu5",
                "northwest"  : __DIR__"furongfeng",
        ]));

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

