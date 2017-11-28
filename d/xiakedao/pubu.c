// pubu.c 瀑布

inherit ROOM;

#include <ansi.h>

int do_jump(string arg);
int do_plump(string arg);

void create()
{
        set("short", "瀑布");
        set("long", @LONG
你猛听得水声响亮，轰轰隆隆，便如潮水大至一般，抬头一看，只
见一条大瀑布(pubu)，犹如银河倒悬，从高崖上直泻下来下面是万丈
悬崖(xuanya)，云雾弥漫，望不到尽头！
LONG  );
        set("exits", ([ /* sizeof() == 3 */
                "northdown" : __DIR__"road4",
        ]));

        set("outdoors", "xiakedao");
        set("item_desc",([
                "pubu"   : "你仔细一看，瀑布里面好象有出口，你似乎可以跳(jump)进去。\n",
                "xuanya" : "下面弥漫着烟雾，什么也看不见，你可不要跳(plump)下去呀！\n",
        ]));

        setup();
}

void init()
{
        add_action("do_jump","jump");
        add_action("do_plump","plump");
}

int do_jump(string arg)
{
        int n;
        object me;

        me = this_player();
        n = me->query_skill("dodge", 1);
        if (! arg || arg != "pubu")
        {
                write("不要在这里乱跳！\n");
                return 1;
        }

        message_vision("$N在瀑布前站定，深呼一口气，突然跃起。\n", me);
        if (n >= 80)
        {
                message_vision("只见$N脚尖一点地，身子轻飘飘的跃进瀑布之中。\n", me);
                me->move(__DIR__"yongdao1");
        } else
        if (n >= 50)
        {
                message_vision("只见$N使出全身的力量，身子再空"
                               "中摇摇惶惶，终于落在瀑布里面。\n", me);
                me->move(__DIR__"yongdao1");
        }
        else
                message_vision("只见$N高高跃起，不过随即落下，看来还差很远呢！\n", me);

        return 1;
}

int do_plump(string arg)
{
        object ob;

        ob = this_player();

        if (arg != "down" && arg != "xuanya")
        {
                write("你要跳什么呀? \n");
                return 1;
        }

        tell_object(ob,HIR "你不加思索，纵身跳下了悬崖。\n" NOR);
        message("vision", "只见" + ob->name() + "纵身跳下了悬崖。\n",
                environment(ob), ({ ob }));

        if ((int)ob->query_skill("dodge", 1) < 100)
        {
                ob->die();
                return 1;
        }

        ob->move(__DIR__"yadi");
        return 1;
}
