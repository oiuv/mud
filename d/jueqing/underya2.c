#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "寒潭尽头");
        set("long", @LONG
这里只觉阳光耀眼，花香扑鼻，竟是别有天地，游目四顾，
只见繁花青草，便如同一个极大的花园，然花影不动，幽谷无
人。十余丈外有一间茅屋(house)， 侧耳倾听，四下里静悄悄
的，绝无人声鸟语，惟有蜜蜂的嗡嗡微响。身后寒潭透着阵阵
寒气。
LONG);
        set("item_desc", ([
                "house" : NOR + YEL "但见茅屋破旧不堪，似乎很久没人来过了。\n" NOR,
        ]));

        set("exits", ([
                "enter" : __DIR__"house",
        ]));
                 
        set("no_clean_up", 0);

        setup();
}

void init()
{       
        add_action("do_jump", ({ "tiao", "jump" }));
}

int do_jump(string arg)
{
        object me = this_player();
        object ob;


        if (! arg || arg != "tan")
                return notify_fail("你要往哪儿跳？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n");

        write(HIC "你纵身入潭，顺势而下忙，向光亮处游去，过不多时，便到了\n"
                  "寒潭另一侧，你迫不及待，纵身跃出水面。\n\n" NOR);

        if (! ob = find_object(__DIR__"underya"))
               ob = load_object(__DIR__"underya");

        me->move(ob);
       
        return 1;

}
