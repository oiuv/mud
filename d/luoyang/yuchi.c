#include <ansi.h> 
inherit ROOM;

void create()
{
	set("short", "洪德浴池");
	set("long", @LONG
门上挂了一块大匾，匾上四个朱漆大字“洪德浴池”，这里是洛阳城
最有特色的地方，分男女两间，可算开中国古代浴池之先河，一些有钱的
老爷少爷小姐太太经常光顾这里，生意相当不错。大门口坐着个老头，看
样子是收钱的。楼上是女间，楼下是男间，可千万别走错哟。
LONG);
        set("no_fight", 1);
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"rest1",
  		"up" : __DIR__"rest2",
  		"west" : __DIR__"sroad3",
	]));
        set("objects", ([
                __DIR__"npc/zaotang" : 1,
        ]));
	setup();
}

int valid_leave(object me, string dir)
{
        if (me->query("gender") == "女性" && dir == "east") 
                return notify_fail(CYN "澡堂伙计一把拦住你，说道：姑娘，男女有"
                                   "别，请到上面去。\n" NOR);

        if (me->query("gender") != "女性" && dir == "up") 
                return notify_fail(CYN "澡堂伙计一把拦住你，说道：喂！你一个大"
                                   "老爷们儿怎么往女浴池钻啊？\n" NOR);

        return ::valid_leave(me, dir);
}
