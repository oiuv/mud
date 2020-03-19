inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short","梅道");
        set("long",@LONG 
这也是一条充满梅花清香的小道。与殿外不同的是，这儿
种满了梅树，而且全是如鲜血般灿烂的红梅，花瓣片片飘落到
洁白的雪地上，就如一个温婉和顺的美人，在给自己的心上人
刺绣时，不小心刺破了手指而流出的一滴血，浸到了白绢上样。
一只通体雪白的雪鹤在地上翩然起舞，逍遥自得。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"west"  : __DIR__"stone",
            	"east"  : __DIR__"meiroad1",
        ]));
        set("objects", ([
                "/clone/quarry/he2" : 1,
                __DIR__"obj/ban" : 1,
        ]));
        setup();
}

void init()
{
        add_action("do_pick","pick");
}

int do_pick(string arg)
{
        object me = this_player();
        object ob;

        if (arg == "mei hua" || arg == "meihua")
        {
                if (query("count") < -5)
                        return notify_fail("这里的梅花已经被摘光了。\n");

                ob = new(__DIR__"obj/mei");
                ob->move(me, 1);
                add("count", -1);

                message_vision("$N从路旁的树上摘了一朵" +
                               ob->query("name") + "。\n", me);
                return 1;
        } else
                return notify_fail("你要摘什么？\n");
}
