inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short","梅道");
        set("long",@LONG
这里种满了绿梅。站在这里，似乎看到了在凌霄城永远不
可能看到的春天一样。一阵微风吹来，在绿梅的海洋中荡起阵
阵涟漪，同时将那股浸人心脾的素香，送到每个人的心中。东
边就是凌霄城的观景胜地戏梅亭了。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"west"  : __DIR__"meiroad1",
            	"east"  : __DIR__"ting",
        ]));
        set("objects", ([ 
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
