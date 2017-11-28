inherit ROOM;

void create()
{
        set("short", "长廊");
        set("long", @LONG
这里是非常气派的长廊。北边是间休息室。南边有一间小
小的药房，里面传来一阵器皿碰击的声音。西边是扇拱月形敞
门。东边是练功场。
LONG);
        set("exits", ([
                "west"  : __DIR__"ximen",
                "east"  : __DIR__"liangong",
                "north" : __DIR__"restroom",
                "south" : __DIR__"yaofang",
        ]));

        setup();
        replace_program(ROOM);
}
