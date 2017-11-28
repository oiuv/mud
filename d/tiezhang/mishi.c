// Room: /u/zqb/tiezhang/mishi.c

inherit ROOM;
#include <ansi.h>
void init();
void create()
{
	set("short", HIY"密室"NOR);
	set("long", @LONG
    这是瀑布后面的一间密室，地下尘土堆积，显是长时间无人到来，
正中孤零零的摆着一张石几，几上有一只两尺见方的石盒(he)，盒口贴了封
条，此外再无别物。
LONG	);
	set("exits", ([ 
        "out" : __DIR__"hhyuan-3",
        ]));

        set("item_desc", ([ 
        "he" : "一个四四方方的石盒，上面落满了尘土。\n",
        ]));
	set("no_clean_up", 0);

	setup();
}

void init()
{
        
	object me = this_player();
	
	if((int)me->query_skill("dodge",1) <= 30) 
	{
		me->receive_damage("qi", 50);
		me->receive_wound("qi",  50);
		message_vision(HIR"$N只觉得被瀑布冲得左摇右晃，难以站稳，身体不由自主的摔出瀑布之外！\n"NOR, me);
		me->move(__DIR__"hhyuan-3");
		tell_object(me, HIR"你从瀑布中摔了出来，只觉得浑身无处不疼，还受了几处伤。\n"NOR);
		message("vision", HIR"只见" + me->query("name") + "从瀑布中摔了出来，躺在地上半天爬不起来！\n"NOR, environment(me), me);
	}

        add_action("do_open","open");
}

int do_open(string arg)
{
        object me = this_player();
        object ob;

       
    if (!arg || (arg != "he" && arg != "shi he"))
       {
        return notify_fail("你想打开什么？\n");
        return 1;
       }
    else
    {
    if (!present("tiezhang zhangpu",me))
       {
        write("你用力打开石盒，发现里面有一本落满尘土的书籍。你急忙把它捡起揣在怀中。\n");
        ob=new("/d/tiezhang/obj/zhangpu");
        ob->move(me);
        return 1;
       }
        write("你用力打开石盒，发现里面空空的什么也没有。\n");
        return 1;
    }
}


