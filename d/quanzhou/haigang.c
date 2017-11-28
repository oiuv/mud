#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "海港");
        set("long", @LONG
这里是出海的必经之地，泉州号称东方第一大港，是
海上丝绸之路的起点，舟船(chuan) 十分方便。
LONG );
        set("exits", ([
                "west" : __DIR__"zhongxin",
        ]));
        set("item_desc", ([
                "chuan" : "一条大海船。出远海没这样的船可不行。\n",
        ]));
        set("objects", ([
                __DIR__"npc/boy": 2,
                __DIR__"npc/girl": 1,
                __DIR__"npc/chuanfu" : 1,
        ]));

        set("outdoors", "quanzhou");
        setup();
}

void init()
{
        add_action("do_enter", "enter");
}

int do_enter(string arg)
{
        object ob ;
//      string dir;

        ob = this_player();
        if (arg !="chuan")
        {
                tell_object(ob, "你要去哪儿？\n" );
                return 1;
        }

        message_vision("船夫一见有人上船，忙叫了一声：开船喽！\n", ob);
        message_vision("船夫升起帆，船就向东方航行。\n", ob);
        ob->move(__DIR__"dahai");
        tell_object(ob, BLU "你在海上航行了很久很久.......\n" NOR);
        call_out("tpenghu", 10 , ob);
        return 1 ;
}

void tpenghu(object ob)
{
        if (! objectp(ob) || find_object(__DIR__"dahai") != environment(ob))
                return;

        tell_object(ob, "大船终于抵达了大海中一个大岛屿。你走下船来。\n");
        ob->move(__DIR__"penghu");
}