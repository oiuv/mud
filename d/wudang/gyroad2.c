inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "果园");
        set("long", @LONG
你轻松地走进果园。园中落英缤纷，两边是桃树林，盛开
着粉红的桃花，红云一片，望不到边。中间却是一株冠盖数亩
的大树(tree)，遮住地面好大一片绿荫。
LONG);
        set("outdoors", "wudang");
        set("item_desc", ([
                "tree" : GRN "\n这是一株人参果树，据说摘下人参果吃了对"
                         "武功进益很有好处。\n\n" NOR
        ]));
        set("exits", ([
                "west" : __DIR__"gyroad1",
        ]));
        set("guocount",1);
        setup();
}

void init()
{
        add_action("do_zhai", "zhai");
}

int do_zhai(string arg)
{
        object guo, me = this_player();

        if (! arg || arg == "")
                return notify_fail("你想摘什么？\n");

        if (arg == "guo" || arg == "renshen guo")
        {
                if (uptime() < 1800)
                {
                        message_vision(HIY "$N" HIY "看了看人参果树，发现"
                                       "树上的果子都未成熟，不禁失望地叹了"
                                       "口气。\n", me);
                        return 1;
                } else
                if (query("guocount") > 0 && random(10) == 1)
                {
                        message_vision(HIC "\n$N" HIC "从人参果树上摘下一"
                                       "个熟透的" HIM "人参果" HIC "，不禁"
                                       "大喜过望。\n\n" NOR, me);
                        guo = new(__DIR__"obj/renshenguo");
                        guo->move(me, 1);
                        add("guocount", -1);
                        return 1;
                } else
                {
                        set("guocount", 0);
                        message_vision(HIY "$N" HIY "看了看人参果树，发现"
                                       "果树的枝叶上有刚被采摘过的痕迹。\n", me);
                        return 1;            
                }
        }
        return 0;
}
