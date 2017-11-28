inherit ROOM;
#include <ansi.h>

void create()
{
	set("short", "皇宫北门");
	set("long", @LONG
这里便是皇宫的北门，丈高的朱红大门敞开着，门上金色的铆钉闪闪发光。
大门两旁站着两排神情严肃的卫兵，不停的打量着过往的行人。灿烂的阳光直
射在巍峨雄伟的古城墙上，使得城墙上方“紫禁城”三个烁金大字显得格外的
耀眼。东厂和西厂两个京城的特务机构架设在皇宫北门的左右两侧。从北方穿
过地安门可以到达北京的北城郊。
LONG NOR);
	set("exits", ([
		"south" : __DIR__"hg",
		"north" : __DIR__"dianmen",
	]));
	set("objects", ([
		__DIR__"npc/bing2" : 1,
		__DIR__"npc/bing3" : 1,
		__DIR__"npc/yuqian1" : 1,
	]));
	set("no_fight", 1);
	setup();
}

int valid_leave(object me, string dir)
{
	if (objectp(present("guan bing", environment(me))) && dir == "south")
		return notify_fail("御前侍卫伸手拦住你朗声说道：皇宫重地，岂容寻常百姓出入。\n\n");
	return ::valid_leave(me, dir);
}
