#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "金牛武馆");
	set("long", @LONG
金牛武馆在江湖中很有名声，很多大侠自小就是从这里走
进江湖。虽然他们在江湖早已成名立万，这里的师傅年纪也都
大了，却是他们的启蒙业师，他们也常回来看望师傅们，因此
这里长久得到黑白两道的尊重，不容侵犯。这里是武馆大厅馆
主马五德在此请授。
LONG);
	set("objects", ([
		__DIR__"npc/mawude" : 1,
		__DIR__"npc/zhangfang" : 1,
	]));
        set("no_fight",1);
        set("no_steal",1);
        set("no_beg",1);
	set("exits", ([
		"southwest" : __DIR__"northroad3",
		"east"      : __DIR__"wuguanchen",
		"south"     : __DIR__"wuguanlong",
		"west"      : __DIR__"wuguanxiao",
		"north"     : __DIR__"wuguanliu",
		"up"        : __DIR__"practice",
                "down"      : __DIR__"wuxiuxi",
	]));
	setup();
}

int valid_leave(object me, string dir)
{
	me = this_player();

	if (! me->query_temp("marks/jinniu_paied")
           && (dir == "up" || dir == "down"))
	        return notify_fail(CYN "马五德笑道: 那是本馆弟子才能进去的。\n" NOR);

	return ::valid_leave(me, dir);
}
