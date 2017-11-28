#include <ansi.h> 
inherit ROOM;

int exercise_improve();
	
void create()
{
        set("short", "玄冰室");
	set("long", @LONG
这是昔日天山童姥修练内功的地方。屋子正中有一块千年
玄冰 (ice)，冰上冒出丝丝寒气，屋里因此寒气逼人，你不由
得打了一个寒颤。
LONG);
        set("exits", ([
		"east" : __DIR__"changl13",
        ]));

	set("item_desc", ([
	        "ice" : HIW "\n这是一块采自天山之巅的千"
                        "年玄冰，奇寒无比。\n\n" NOR,
	]));

        set("exercise_improve", (: exercise_improve :));

	setup();
	//replace_program(ROOM);
}

int exercise_improve()
{
        object me;

        me = this_player();

        if (me->query_skill("bahuang-gong", 1) >= 10)
        {
                if (random(5) == 0)
                        tell_object(me, HIW "\n你运用八荒六合惟我独尊功"
                                        "抵御寒气，缓缓行功。\n");
                return me->query_skill("force") / 10;
        }

        tell_object(me, HIW "\n你冻的牙齿直打颤，丹田内息也是一阵阵的混"
                        "乱。\n" NOR);
        return -20;
}
