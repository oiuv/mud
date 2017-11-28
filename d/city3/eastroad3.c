#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "东大街");
        set("long", @LONG
你走在东大街上，踩着坚实的青石板地面。向北是一条宽
直的大道。北边可以通往东城门，西南边通向南大街，东南方
便是有名的望江楼。东边不远处有一幢破烂的房屋，但是屋子
的门梁 (liang)已经垮塌，把门封了个严实。
LONG );

        set("outdoors", "chengdu");
        set("exits", ([
            	"southeast"  : __DIR__"wangjianglou",
            	"southwest"  : __DIR__"southroad1",
            	"north"      : __DIR__"eastroad2",
        ]));

        set("item_desc", ([
            	"liang" : "房子的门梁垮塌，将门封了个严实。\n"
        ]) );

        set("no_clean_up", 0);
        setup();
}

void init()
{
        add_action("do_break", "break");
}

int do_break(string arg)
{
//      int n;
        object /*weapon,*/ me = this_player();

        if (arg != "liang")
        	return 0;

        if (query("break"))
                return notify_fail("房梁已经被震飞，用不着再费力了。\n");

        message_vision(HIY "$N" HIY "走到房前，运气双掌，猛地击"
                       "向垮塌的房梁！\n" NOR, me);

        if (me->query("max_neili") < 1000)
        {
               message_vision(HIR "结果只听一声闷哼，$N" HIR "内"
                              "力不济，被房梁反震，眼前顿时一黑…"
                              "…\n" NOR, me);
               me->set("neili", 0);
               me->unconcious();
               return 1;
        }

        message_vision(HIY "只听一声轰响，房梁顿时被$N" HIY "震"
                       "得飞起，露出了大门！\n" NOR, me);

        set("exits/enter", __DIR__"minju");
        me->set("neili", 0);
        set("break", 1);
        return 1;
}