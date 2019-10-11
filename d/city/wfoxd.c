#include <ansi.h> 
inherit ROOM;

void create()
{
        set("short", HIG "【武林外传】" NOR+HIW "办公区" NOR );
        set("long", @LONG                     
武林外传是武林群侠传中为大家提供休闲娱乐服务的组织，这里是办公
区，现在由管理员秋林拾叶负责，话说在酒楼长租办公区真是够奢侈的，也
不明白他究竟在干些什么。你可以看见在右边有一个咨询处（advisory），
左边有一个服务台（serve）。
LONG );
        set("no_fight", 1); 
        set("item_desc", ([
                 "advisory" : HIW "〖武林外传〗"NOR+HIY"是游戏中为大家提供娱乐休闲服务的组织。\n" NOR,
                 "serve" :  "服务台上写着：\n"
                            "    广大的泥潭朋友们，你们好！\n"
                            "我们提供很多娱乐服务项目，如果你有兴趣可以到mud.gameivy.com看看。\n\n"
                            "                                                                 秋林拾叶      \n\n",
        ]));
        set("objects", ([
                __DIR__"npc/wfoxd-mm": 2,
        ]));
        set("exits", ([
                "south" : __DIR__"zuixianlou",
                "up" : "/u/ivy/mogong",
        ]));
        setup();
        "/clone/board/wfoxd_b"->foo();
        replace_program(ROOM);
}