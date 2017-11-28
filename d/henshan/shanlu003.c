inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
你走在衡山山路上，四望山峰错落，林壑幽深，溪泉飞瀑，
云雾缭绕，不觉心胸大快。一直往西不远便是衡山五峰中最高
的祝融峰了。 
LONG
);
        set("exits", ([ 
                "eastdown" : __DIR__"zhurongdian",
                "westup"   : __DIR__"shanlu004",         
        ]));

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

