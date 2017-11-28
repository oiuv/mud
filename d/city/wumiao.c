#include <room.h>

inherit ROOM;

void create()
{
	set("short", "武庙");
	set("long", @LONG
这里是扬州岳王庙的正殿，内有岳飞像，像上方悬挂岳飞手书“还我河
山”的横匾。殿两侧壁上嵌着“尽忠报国”四个大字。武人到此，都放下武
器，毕恭毕敬地上香礼拜。旁边似乎有一道侧门。
LONG );
	set("no_fight", 1);
	set("no_steal", 1);
	set("no_sleep_room", 1);

	set("valid_startroom", 1);
	set("objects", ([
		__DIR__"obj/box" : 1,
	]));

	set("exits", ([
		"east" : __DIR__"beidajie2",
		"up"   : __DIR__"wumiao2",
                "down" : "/d/wizard/herodoor"
	]));
	setup();
	replace_program(ROOM);
}