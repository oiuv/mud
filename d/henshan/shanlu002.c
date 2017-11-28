inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
你走在衡山山路上，四望山峰错落，林壑幽深，溪泉飞瀑，
云雾缭绕，不觉心胸大快。一直往西可通往磨镜台和天柱峰。 
LONG
);
        set("exits", ([ 
                "southeast"  : __DIR__"banshan",
                "west"       : __DIR__"shanlu001",    
        ]));

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

