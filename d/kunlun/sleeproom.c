#include <room.h>
inherit ROOM;

void create()
{
	set("short", "卧室");
        set("long", @long
这里是何太冲最宠爱的第五小妾五姑的卧房。刚一进房扑
鼻便是一股药气，里面还能闻到一股十分古怪的气息，过了片
刻，更觉得这气息忽浓忽淡，甚是奇特。床上躺着一个人，这
人面向帐里，喘气甚急，象是扯着风箱。窗子都是紧紧关着。
long);
	set("exits", ([
		"east" : __DIR__"tieqinju",
	]));

        set("no_clean_up", 0);
	create_door("east", "小门", "west", DOOR_CLOSED);
        setup();
        replace_program(ROOM);
}
