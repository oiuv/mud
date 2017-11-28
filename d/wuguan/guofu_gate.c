inherit ROOM;
#include <ansi.h>;

void create()
{
	set("short", "郭府大门");
	set("long", 
"建筑古朴的大宅院出现在你的眼前。只见门楼高挑，门前
立了两个石狮，大门上书两个大字" YEL "

              ※※※※※※※※※※※
              ※                  ※
              ※" NOR + HIY "     郭    府" NOR + YEL "     ※
              ※                  ※
              ※※※※※※※※※※※" NOR "

你从大门瞧进去，好象里面人来人往，都很繁忙的样子。这里
站着位青年，神情威严。接待前来保卫襄阳的各方义士。
");
	set("outdoors", "wuguan");
	set("no_ride", 1);
	set("exits", ([
		"south" : "/d/xiangyang/westjie1",
		"north" : __DIR__"guofu_dayuan",
	]));
	set("objects", ([
		__DIR__"npc/wudunru" : 1,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
        object riding;
        if (me->query("mark/guofu_ok")
           && present("wu dunru", environment(me)) 
           && dir == "south")
             return notify_fail(CYN "\n武敦儒伸手将你拦住道：现在"
                                "襄阳城内不太平，你还是多呆一会吧"
                                "。\n" NOR);

        if (me->query("mark/guofu_ok")
           && present("wu dunru", environment(me)) 
           && dir == "north"
           && objectp(riding = me->query_temp("is_riding")))
             return notify_fail(CYN "\n武敦儒伸手将你拦住道：不能"
                                "骑马进郭府，你撞到其他人怎么办？\n" NOR);


        if (me->query("mark/guofu_over")
           && present("wu dunru", environment(me))
           && dir == "north")
             return notify_fail(CYN "\n武敦儒将你拦住，冷笑道：郭"
                                "府留你不下，你还是走吧。\n" NOR);

        if (me->query("mark/guofu_out")
           && present("wu dunru", environment(me)) 
           && dir == "north")
             return notify_fail(CYN "\n武敦儒笑道：你再留在郭府已"
                                "无多大的用处，还是多去闯荡闯荡吧"
                                "。\n" NOR);

        if (me->query("combat_exp") > 5000
           && ! me->query("mark/guofu_ok")
           && present("wu dunru", environment(me)) 
           && dir == "north")
             return notify_fail(CYN "\n武敦儒抱拳道：现襄阳正值动"
                                "乱时期，没师父许可，任何人不得入"
                                "内。\n" NOR);

        if (! me->query("mark/guofu_ok")
           && present("wu dunru", environment(me)) 
           && dir == "north")
             return notify_fail(CYN "\n武敦儒伸手将你拦住道：如果"
                                "你不打算帮忙打杂，就别进来。\n" NOR);

        return ::valid_leave(me, dir);
}
