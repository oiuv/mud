inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short", "梅道");
        set("long", @LONG
这是一条充满了梅花清香的大道。往北就是凌霄城的大殿
凌霄殿了。闻着满天的梅香，本以为这里种满了梅树，走近却
才发现，这里只有两棵合围粗的白梅，开着漫天的冰凌。其实
是梅还是雪，已分不清了。看到这种情况那句「梅须逊雪三分
白，雪却输梅一段香」的话，是谁也不会信了。这梅这雪，谁
白谁香，分得出来吗？
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
                "south"  : __DIR__"iceroad3",
                "north"  : __DIR__"dadian",
                "west"  : __DIR__"meiroad2",
                "east"  : __DIR__"meiroad3",
        ]));
        set("objects", ([
                __DIR__"npc/dizi" : 2,
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
