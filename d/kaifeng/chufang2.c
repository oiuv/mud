inherit ROOM;

void create()
{
        set("short", "素斋厨");
        set("long", @LONG
素斋厨的几个大灶烧得正旺，白色的蒸汽在室顶铺了一层
灶膛间摆满了松柴，和尚们很挑剔，说是用这种柴禾煮出的饭
菜才去近佛。一边的桌上摆着一个饭桶。东面有个小门出去。
LONG);
        set("objects", ([
  		__DIR__"npc/suzhai.c" : 1,
  		__DIR__"npc/shaohuo" : 1,
	]));

        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"chufang",
  		"east" : __DIR__"zoulang",
	]));

        setup();
        replace_program(ROOM);
}
