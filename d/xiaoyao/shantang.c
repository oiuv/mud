#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "酒家");
        set("long", @LONG
这里是树林中的一间小小的酒家，地方虽然不大，但是也
有不少逍遥派的弟子光顾这里。你终于找到香味的来源了，看
着可口的饭菜，你忍不住也想叫(order)一份了。
LONG);
        set("exits",([
                "north" : __DIR__"xiaodao2",
        ]));
        set("objects", ([
                CLASS_D("xiaoyao") + "/shiqingl": 1,
        ]));

        set("resource/water", 1);
        set("ricewater", 5);
        setup();
}

void init()
{
        add_action("do_order", "order");
}

int do_order(string arg)
{
        object me;
        object food;
        object water;

        me = this_player();

        if (arg)  return notify_fail(CYN "小二哥跑出来道：这样东西这里没有啊。\n" NOR);
        if (query("ricewater") > 0)
        {
                message_vision(CYN "小二哥连声答应，从内厅一溜烟跑出来。\n" HIY "不多"
                               "时，便端着一碗米饭和一碗水拿了给$N" HIY "。\n" NOR, me);
                food = new(__DIR__"obj/rice");
                water = new(__DIR__"obj/bowl");
                food->move(me);
                water->move(me);
                add("ricewater", -1);
        }
        else 
                message_vision(CYN "小二哥在内厅对$N" CYN "歉声道：吃的喝的都没了。\n" NOR, me);

        return 1; 
}

void reset()
{
        ::reset();
        set("ricewater", 5);
}
