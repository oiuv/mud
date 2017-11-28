inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
你走在衡山山路上，四望山峰错落，林壑幽深，溪泉飞瀑，
云雾缭绕，不觉心胸大快。山路转过芙蓉峰，西面远远看到藏
经阁，东南方向通往南天门。
LONG);
        set("exits", ([ 
               "west"       : __DIR__"cangjingdian",
               "southeast"  : __DIR__"nantian",
        ]));

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

