#include <ansi.h> 
inherit ROOM;

string* npcs = ({
        "/clone/worm/xixuezhu",
        "/clone/worm/renmianzhu",
        "/clone/worm/tianwu",
        "/clone/worm/jiuweixie",
        "/clone/worm/shishixie",
        "/clone/worm/tieguxie",
        "/clone/worm/heiguafu",
        "/clone/worm/jinxianwugong",
});

void create()
{
        set("short", RED "万毒窟" NOR);
        set("long", @LONG
这里是山洞内部的支洞，这里已经没有一丝光线了，黑洞洞的什
么也看不见。洞内岩壁(wall)上好象生着几株不知名的小草。身旁传
来一阵“咝咝”的声音。
LONG);
        set("item_desc", ([
                "wall" : WHT "一堵岩壁，上面突出些石笋，似乎可以顺着爬上去。\n" NOR,
        ]));
        set("exits", ([
                "north" : __DIR__"wandu2",
        ]));

        set("objects", ([
                npcs[random(sizeof(npcs))] : 1,
                npcs[random(sizeof(npcs))] : 1,
                npcs[random(sizeof(npcs))] : 1,
        ]));
    

        setup();
}

void init()
{
       add_action("do_climb", "climb");
}
int do_climb(string arg)
{
       
        object me = this_player();
        object ob; 

        if( (!arg) ||!((arg == "wall") || (arg == "岩壁")))
                return notify_fail("你要爬什么？\n");

        message_vision(HIC "$N" HIC "攀着岩壁上突出的石笋艰难的爬了上去。\n\n" NOR,me);
        ob = load_object(__DIR__"dongxue");
        ob = find_object(__DIR__"dongxue");
        message("vision", HIC + me->query("name") + HIC "从下面爬了上来。\n" NOR, ob);

        me->move(__DIR__"dongxue");
        return 1;
}

