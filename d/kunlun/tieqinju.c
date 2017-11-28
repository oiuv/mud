#include <room.h>
inherit ROOM;

void create()
{
	set("short", "铁琴居");
        set("long", @long
这儿便是“铁琴先生”何太冲的居处。房间陈设颇为精巧，
物品与中土所见别是不同。几个昆仑派弟子守在这里，个个深
有忧色。东边通往三圣堂，西边通往卧室。
long);

	set("objects",([
                CLASS_D("kunlun") + "/hetaichong" : 1,
		__DIR__"npc/kl-dizi2" :   1,
		__DIR__"npc/kl-dizi4" :   1,
	]));

	set("exits", ([
                "east" : __DIR__"jiuqulang1",
                "west" : __DIR__"sleeproom",
	]));

        set("no_clean_up", 0);
        create_door("west", "小门", "east", DOOR_CLOSED);
        setup();
        replace_program(ROOM);
}
