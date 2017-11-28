#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "昆仑仙境");
        set("long", @LONG
你出得洞来，面前竟是个花团锦簇的翠谷，红花绿树，交
相掩映。你脚下踏著的是柔软的细草，鼻中闻到的是清幽的花
香，鸣禽间关，鲜果悬枝，哪想得到在这黑黝黝的洞穴后，竟
会有这样一个洞天福地。离地丈许高处有一山洞(dong)。
LONG);
        set("outdoors", "mingjiao");
        set("exits", ([
                "west"  : __DIR__"gudi5",
                "south" : __DIR__"gudi4",
        ]));
        set("item_desc", ([
                "dong": WHT "这是一个不知深浅的山洞。\n" NOR,
        ]));

        set("objects", ([
                "/clone/quarry/yang2" : 2,
        ]));

        setup();
}

void init()
{
        add_action("do_enter", "enter");
}

int do_enter(string arg)
{
        object me = this_player();

        if (! arg || arg != "dong")
        {
                write("你想干什么呀?\n");
                return 1;
        }
        message_vision(HIY "$N" HIY "深吸了一口气，慢慢沿着"
                       "洞壁往外爬。\n" NOR, me);
        me->move(__DIR__"gudi2");
        return 1;
}
