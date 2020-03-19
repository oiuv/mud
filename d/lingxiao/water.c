#include <ansi.h>

inherit ROOM;

void create()
{
   set("short", "雪山温泉");
   set("long", @LONG
这是两个山道盆地之间的一处温泉(quan)，一股喷泉正在嘶
嘶喷水，灼热的水花被风吹散，在月光下形成一团团白色的花环。
在这雪山之上，居然还有此等令人惬意之处，亦不由让人感叹造
物之神奇。碧波绿水中，飘荡着朵朵雪莲花瓣，片片雪花飘然而
下，离水面有数寸，便即纷纷化为白雾而散。在这生命绝迹的大
雪山之上，惟有这里，才有绿树、红花、青草。一个少女在温泉
畔凝望落花，似有无限心事。
LONG);
        set("outdoors", "lingxiao"); 
    	set("resource/water", 1);
    	set("objects", ([
           	__DIR__"npc/a-xiu" : 1,
    	]) );
        set("exits", ([ 
     		"east" :__DIR__"sroad6",
	]));
        set("item_desc", ([
                "quan" : HIC "这是山道间的一处温泉，深不见底，似乎可以"
                         "潜(dive)下去。\n" NOR,
        ]) );
        setup(); 
}

void init()
{       
        add_action("do_dive", "dive");
}

int do_dive(string arg)
{
        object me = this_player();

        if ((arg != "quan" || ! arg))
                return notify_fail("你要潜什么？\n");

   		message_vision(HIY "只见$N" HIY "憋足了一口气，“扑通”一"
                               "声，纵身跳下了温泉。\n" NOR, me);

        if ((int)me->query_skill("force") < 100)
	{ 
   		message_vision(HIR "$N" HIY "刚下水不久，发现愈往下潜，水"
                               "压愈大，再也忍受不住，猛地窜了上来。\n"
                               NOR, me);
        } else 
        {
		message_vision(HIY "$N" HIY "只觉压力越来越大，立即强运内"
                               "力，奋力支持，继续向下潜去……\n\n" NOR +
                               HIC "只听水中哗啦一声，就平静下来了。\n" NOR,
                               this_player()); 
                me->move(__DIR__"wave1"); 
        } 
        return 1;
}

