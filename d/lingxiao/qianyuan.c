inherit ROOM;
#include <ansi.h> 

void create()
{
        set("short", "前院");
        set("long", @LONG 
这里是凌霄城的前院，凌霄弟子大都居住于此后。这里种
了一棵三人合围粗的墨梅，花瓣漆黑，气味芬芳。深邃的大院
里，高山阳光透过墨梅的花瓣射下，在雪地上映出一块块亮斑。
一只雪鹤在树下翩翩起舞，黑白相映，互有情趣。 
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"south"  : __DIR__"dadian",
            	"west"  : __DIR__"huajing", 
            	"north"  : __DIR__"zhongting",
        ]));
        set("objects", ([
                "/clone/quarry/he2" : 1,
                __DIR__"obj/ban" : 1,
        ]));
        set("no_clean_up", 0);
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
